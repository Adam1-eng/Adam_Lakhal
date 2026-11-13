// Tests unitaires de sécurité (mots de passe, sessions, limitation, redirections, validation).
// Base de test isolée : npm run test:security:unit
import { rmSync } from 'node:fs';
process.env.PGLITE_DIR = './.data/test-unit';
rmSync('./.data/test-unit', { recursive: true, force: true });

const { getDb, schema } = await import('../src/lib/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const auth = await import('../src/lib/auth');
const { isSafeNext, isEmail } = await import('../src/lib/admin');
const { eq } = await import('drizzle-orm');
const { scryptSync, randomBytes, createHash } = await import('node:crypto');

const db = await getDb();
await migrate(db as never, { migrationsFolder: './drizzle' });

let pass = 0, fail = 0;
const t = async (name: string, fn: () => unknown | Promise<unknown>) => {
  try { const ok = await fn(); if (ok === false) throw new Error('assertion'); pass++; console.log('PASS', name); }
  catch (e) { fail++; console.log('FAIL', name, '→', (e as Error).message); }
};

// Faux « cookies » Astro pour tester les sessions sans serveur
const jar = () => {
  const m = new Map<string, string>();
  return { get: (k: string) => (m.has(k) ? { value: m.get(k)! } : undefined), set: (k: string, v: string) => void m.set(k, v), delete: (k: string) => void m.delete(k), _m: m } as never as import('astro').AstroCookies & { _m: Map<string, string> };
};

/* ---------- Mots de passe ---------- */
const hash = await auth.hashPassword('MotDePasseTest2026');
await t('hachage scrypt avec paramètres OWASP (N=2^17) et sel', () => hash.startsWith('scrypt$131072$8$1$') && hash.split('$').length === 6);
await t('deux hachages du même mot de passe sont différents (sel unique)', async () => (await auth.hashPassword('MotDePasseTest2026')) !== hash);
await t('le mot de passe n’apparaît pas dans le hachage', () => !hash.includes('MotDePasseTest2026'));
await t('bon mot de passe accepté', () => auth.verifyPassword('MotDePasseTest2026', hash));
await t('mauvais mot de passe refusé', async () => !(await auth.verifyPassword('motdepassetest2026', hash)));
await t('hachage corrompu refusé sans planter', async () => !(await auth.verifyPassword('x', 'scrypt$abc')) && !(await auth.verifyPassword('x', 'md5$a$b')));
await t('paramètres de coût abusifs refusés (anti-DoS)', async () => !(await auth.verifyPassword('x', 'scrypt$99999999$8$1$AAAA$AAAA')));
const salt = randomBytes(16);
const legacy = `scrypt$${salt.toString('base64')}$${scryptSync('AncienMotDePasse1', salt, 64, { N: 16384, r: 8, p: 1 }).toString('base64')}`;
await t('ancien format (avant audit) encore accepté', () => auth.verifyPassword('AncienMotDePasse1', legacy));
await t('ancien format détecté pour re-hachage', () => auth.needsRehash(legacy) && !auth.needsRehash(hash));
await t('politique de mot de passe : < 12 caractères refusé', () => auth.passwordProblem('abc123') !== null);
await t('politique de mot de passe : lettres + chiffres exigés', () => auth.passwordProblem('aaaaaaaaaaaaaa') !== null && auth.passwordProblem('Abcdefgh12345') === null);

/* ---------- Sessions ---------- */
const [admin] = await db.insert(schema.admins).values({ email: 'test@exemple.com', name: 'Test', passwordHash: hash }).returning();
const c1 = jar();
await auth.createSession(admin.id, c1, true);
const token = c1._m.get('__Host-lk_admin')!;
await t('cookie de session préfixé __Host- en HTTPS', () => Boolean(token) && token.length >= 40);
await t('session valide → utilisateur reconnu', async () => (await auth.getSessionUser(c1, true))?.id === admin.id);
const stored = await db.select().from(schema.sessions);
await t('le jeton brut n’est jamais stocké (seulement son SHA-256)', () => stored.every((s) => s.id !== token) && stored.some((s) => s.id === createHash('sha256').update(token).digest('hex')));
const forged = jar(); forged.set('__Host-lk_admin', 'faux-jeton-' + randomBytes(16).toString('hex'));
await t('jeton invalide refusé', async () => (await auth.getSessionUser(forged, true)) === null);
const huge = jar(); huge.set('__Host-lk_admin', 'x'.repeat(5000));
await t('jeton surdimensionné refusé', async () => (await auth.getSessionUser(huge, true)) === null);
await db.update(schema.sessions).set({ expiresAt: new Date(Date.now() - 1000) });
await t('session expirée refusée', async () => (await auth.getSessionUser(c1, true)) === null);
const c2 = jar(); await auth.createSession(admin.id, c2, true);
await auth.destroySession(c2, true);
const replay = jar(); replay.set('__Host-lk_admin', '');
await t('déconnexion : cookie supprimé', () => !c2._m.has('__Host-lk_admin'));
const c3 = jar(); await auth.createSession(admin.id, c3, true); const t3 = c3._m.get('__Host-lk_admin')!;
await auth.destroySession(c3, true);
const reuse = jar(); reuse.set('__Host-lk_admin', t3);
await t('session révoquée : réutilisation de l’ancien jeton refusée', async () => (await auth.getSessionUser(reuse, true)) === null);
const c4 = jar(); await auth.createSession(admin.id, c4, true);
await auth.destroyAllSessions(admin.id);
await t('« déconnecter tous les appareils » révoque toutes les sessions', async () => (await auth.getSessionUser(c4, true)) === null);
const c5 = jar(); await auth.createSession(admin.id, c5, true);
await db.delete(schema.admins).where(eq(schema.admins.id, admin.id));
await t('compte supprimé : sa session ne donne plus accès', async () => (await auth.getSessionUser(c5, true)) === null);

/* ---------- Limitation des tentatives ---------- */
const keys = ['ip:203.0.113.9', 'email:cible@exemple.com'];
for (let i = 0; i < auth.MAX_ATTEMPTS - 1; i++) await auth.recordAttempt(keys, false);
await t('sous la limite : pas de blocage', async () => !(await auth.tooManyAttempts(keys)));
await auth.recordAttempt(keys, false);
await t(`après ${auth.MAX_ATTEMPTS} échecs : blocage`, () => auth.tooManyAttempts(keys));
await db.update(schema.loginAttempts).set({ createdAt: new Date(Date.now() - 16 * 60e3) });
await t('après la fenêtre de 15 min : déblocage', async () => !(await auth.tooManyAttempts(keys)));

/* ---------- Redirections et validation ---------- */
await t('redirection interne admin autorisée', () => isSafeNext('/admin/projets?statut=draft'));
for (const bad of ['//evil.com', 'https://evil.com', '/admin.evil.com', '/\\evil.com', '/admin\\@evil', '/admin/\nSet-Cookie:x', 'javascript:alert(1)', '/admin' + 'x'.repeat(400)])
  await t(`redirection refusée : ${JSON.stringify(bad).slice(0, 40)}`, () => !isSafeNext(bad));
await t('courriel valide accepté', () => isEmail('adam@exemple.com'));
for (const bad of ['a@b.co</script><script>alert(1)</script>', 'a"b@c.com', 'a b@c.com', 'a@b', '<x>@y.com'])
  await t(`courriel dangereux refusé : ${bad.slice(0, 30)}`, () => !isEmail(bad));

console.log(`\n${pass} réussis, ${fail} échoués`);
rmSync('./.data/test-unit', { recursive: true, force: true });
process.exit(fail ? 1 : 0);
