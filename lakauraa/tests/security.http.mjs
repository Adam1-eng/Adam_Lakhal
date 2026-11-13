// Tests de sécurité HTTP de bout en bout, sur un serveur de test isolé (base PGlite dédiée).
// npm run test:security:http — ne touche jamais aux données réelles.
import { spawn, execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import sharp from 'sharp';

const PORT = 4410;
const B = `http://localhost:${PORT}`;
const env = { ...process.env, PGLITE_DIR: './.data/test-http' };
delete env.DATABASE_URL; delete env.POSTGRES_URL; delete env.BLOB_READ_WRITE_TOKEN; delete env.VERCEL;
rmSync('./.data/test-http', { recursive: true, force: true });
execFileSync('npx', ['tsx', 'scripts/migrate.ts'], { env, stdio: 'ignore' });

let logs = '';
const srv = spawn('npx', ['astro', 'dev', '--port', String(PORT), '--ignore-lock'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
srv.stdout.on('data', (d) => (logs += d)); srv.stderr.on('data', (d) => (logs += d));
for (let i = 0; i < 60; i++) { try { if ((await fetch(B + '/')).ok) break; } catch {} await new Promise((r) => setTimeout(r, 1000)); }

let pass = 0, fail = 0;
const t = async (name, fn) => { try { const ok = await fn(); if (ok === false) throw new Error('assertion'); pass++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, '→', e.message); } };
const cookieOf = (r) => (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).find((c) => c.startsWith('lk_admin=')) ?? '';
const form = (path, data, { cookie = '', origin = B } = {}) =>
  fetch(B + path, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: new URLSearchParams(data) });
const api = (path, method, body, { cookie = '', origin = B, raw } = {}) =>
  fetch(B + path, { method, redirect: 'manual', headers: { ...(raw ? {} : { 'Content-Type': 'application/json' }), ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
const get = (path, cookie = '') => fetch(B + path, { redirect: 'manual', headers: cookie ? { Cookie: cookie } : {} });
const PW = 'MotDePasseDeTest2026';
// Retire le contenu des attributs (déjà échappé par Astro) pour ne garder que les balises réellement exécutables
const tagsOnly = (html) => html.replace(/="[^"]*"/g, '=""');

/* ---------- 1. Routes protégées sans session ---------- */
await t('/admin sans session → redirection vers la connexion', async () => { const r = await get('/admin'); return r.status === 302 && r.headers.get('location').startsWith('/admin/login'); });
for (const [m, p] of [['POST', '/api/admin/projects/order'], ['PATCH', '/api/admin/images/x'], ['DELETE', '/api/admin/images/x'], ['POST', '/api/admin/seed'], ['POST', '/api/admin/projects/x/cover']])
  await t(`API ${m} ${p} sans session → 401`, async () => (await api(p, m, {})).status === 401);

/* ---------- 2. Installation du premier compte ---------- */
let r = await form('/admin/setup', { name: 'Test', email: 'admin@test.local', password: PW, password2: PW });
let A = cookieOf(r);
await t('installation : compte créé et session ouverte', () => r.status === 302 && Boolean(A));
await t('installation fermée une fois un compte créé', async () => (await get('/admin/setup')).status === 302);
await t('cookie de session HttpOnly + SameSite=Strict', () => (r.headers.getSetCookie?.() ?? []).some((c) => /HttpOnly/i.test(c) && /SameSite=Strict/i.test(c)));

/* ---------- 3. Connexion ---------- */
r = await form('/admin/login', { email: 'admin@test.local', password: 'mauvais' });
const msgBad = (await r.text()).includes('Courriel ou mot de passe incorrect.');
await t('mauvais mot de passe → 401 + message générique', () => r.status === 401 && msgBad);
r = await form('/admin/login', { email: 'inconnu@test.local', password: 'mauvais' });
await t('compte inexistant → même message (pas d’énumération)', async () => r.status === 401 && (await r.text()).includes('Courriel ou mot de passe incorrect.'));
r = await form('/admin/login?next=' + encodeURIComponent('//evil.example/x'), { email: 'admin@test.local', password: PW });
await t('redirection ouverte bloquée (next=//evil…) → /admin', () => r.status === 302 && r.headers.get('location') === '/admin');
const B2 = cookieOf(r);
await t('la connexion crée une nouvelle session (anti-fixation)', () => Boolean(B2) && B2 !== A);
r = await form('/admin/login', { email: 'admin@test.local', password: PW }, { cookie: 'lk_admin=jeton-impose-par-un-attaquant' });
await t('jeton imposé avant connexion remplacé par un nouveau', () => cookieOf(r) && cookieOf(r) !== 'lk_admin=jeton-impose-par-un-attaquant');

/* ---------- 4. CSRF ---------- */
await t('CSRF : formulaire admin depuis un autre site → 403', async () => (await form('/admin/faq', { action: 'create', question: 'Question CSRF ?', answer: 'Réponse.' }, { cookie: A, origin: 'https://evil.example' })).status === 403);
await t('CSRF : requête sans en-tête Origin → 403', async () => (await form('/admin/faq', { action: 'create', question: 'Question CSRF ?', answer: 'Réponse.' }, { cookie: A, origin: '' })).status === 403);
await t('CSRF : API JSON depuis un autre site → 403', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: A, origin: 'https://evil.example' })).status === 403);

const faqBefore = (await (await get('/admin/faq', A)).text()).length;
await get('/admin/faq?action=create&question=Injectee+par+GET+%3F&answer=Reponse+GET', A);
await get('/admin/logout', A);
await t('aucune requête GET ne modifie de données ni ne déconnecte', async () => { const x = await get('/admin/faq', A); const b = await x.text(); return x.status === 200 && !b.includes('Injectee par GET') && Math.abs(b.length - faqBefore) < 50; });
await t('requête légitime (même origine) acceptée', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: A })).status === 200);

/* ---------- 5. Jetons invalides, déconnexion, compte supprimé ---------- */
await t('jeton forgé → accès refusé', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: 'lk_admin=forge-' + 'a'.repeat(40) })).status === 401);
const L = cookieOf(await form('/admin/login', { email: 'admin@test.local', password: PW }));
await form('/admin/logout', {}, { cookie: L });
await t('après déconnexion, l’ancien jeton ne marche plus', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: L })).status === 401);
await form('/admin/parametres', { action: 'add-admin', name: 'Deux', email: 'deux@test.local', password: PW }, { cookie: A });
const D = cookieOf(await form('/admin/login', { email: 'deux@test.local', password: PW }));
await t('second administrateur connecté', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: D })).status === 200);
const page = await (await get('/admin/parametres', A)).text();
const deuxId = [...page.matchAll(/name="id" value="([0-9a-f-]{36})"/g)].map((m) => m[1])[0];
await form('/admin/parametres', { action: 'remove-admin', id: deuxId }, { cookie: A });
await t('compte retiré : sa session est immédiatement invalide', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: D })).status === 401);

/* ---------- 6. Limitation des tentatives ---------- */
for (let i = 0; i < 5; i++) await form('/admin/login', { email: 'cible@test.local', password: 'faux' + i });
r = await form('/admin/login', { email: 'cible@test.local', password: 'faux' });
await t('6e tentative → 429 Trop de tentatives', async () => r.status === 429 && (await r.text()).includes('Trop de tentatives'));

/* ---------- 7. Validation côté serveur ---------- */
await t('JSON : propriété non autorisée → 400', async () => (await api('/api/admin/projects/order', 'POST', { ids: [], admin: true }, { cookie: A })).status === 400);
await t('JSON : champ manquant → 400', async () => (await api('/api/admin/projects/order', 'POST', {}, { cookie: A })).status === 400);
await t('JSON : mauvais type → 400', async () => (await api('/api/admin/projects/order', 'POST', { ids: 'pas-un-tableau' }, { cookie: A })).status === 400);
await t('JSON : trop d’éléments → 400', async () => (await api('/api/admin/projects/order', 'POST', { ids: Array(501).fill('x') }, { cookie: A })).status === 400);
await t('JSON : corps illisible → 400', async () => (await api('/api/admin/projects/order', 'POST', undefined, { cookie: A, raw: '{pas du json' })).status === 400);
await t('JSON légitime → 200', async () => (await api('/api/admin/projects/order', 'POST', { ids: [] }, { cookie: A })).status === 200);
const proj = (data) => form('/admin/projets/nouveau', { title: 'Projet test', kind: 'client', summary: 'Résumé', ...data }, { cookie: A });
await t('projet : nom manquant refusé', async () => (await proj({ title: '' })).status === 200);
await t('projet : nom trop long refusé', async () => (await (await proj({ title: 'x'.repeat(500) })).text()).includes('adm-toast--err'));
await t('projet : lien javascript: refusé', async () => (await (await proj({ liveUrl: 'javascript:alert(1)' })).text()).includes('Lien invalide'));
await t('projet : type hors liste refusé', async () => (await (await proj({ kind: 'superadmin' })).text()).includes('adm-toast--err'));
r = await proj({ title: '<script>alert("xss")</script><img src=x onerror=alert(1)>', summary: '"><svg onload=alert(1)>', liveUrl: 'https://exemple.com' });
const projId = r.headers.get('location')?.match(/projets\/([0-9a-f-]{36})/)?.[1];
await t('projet légitime créé (brouillon)', () => r.status === 303 && Boolean(projId));

/* ---------- 8. Fichiers ---------- */
const fd = new FormData(); fd.append('file', new Blob(['<?php system($_GET[1]); ?>'], { type: 'image/png' }), 'shell.php.png');
await t('envoi d’un faux fichier image (code PHP) → refusé 422', async () => (await fetch(`${B}/api/admin/projects/${projId}/images`, { method: 'POST', headers: { Origin: B, Cookie: A }, body: fd })).status === 422);
const big = new FormData(); big.append('file', new Blob([new Uint8Array(5_000_000)], { type: 'image/png' }), 'gros.png');
await t('fichier > 4,5 Mo → refusé 413', async () => (await fetch(`${B}/api/admin/projects/${projId}/images`, { method: 'POST', headers: { Origin: B, Cookie: A }, body: big })).status === 413);
const svg = new FormData(); svg.append('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'], { type: 'image/svg+xml' }), 'x.svg');
await t('SVG (peut contenir du script) → refusé', async () => (await fetch(`${B}/api/admin/projects/${projId}/images`, { method: 'POST', headers: { Origin: B, Cookie: A }, body: svg })).status === 422);
const png = await sharp({ create: { width: 800, height: 500, channels: 3, background: '#1e6bff' } }).png().toBuffer();
const okf = new FormData(); okf.append('file', new Blob([png], { type: 'image/png' }), '../../evil.php');
r = await fetch(`${B}/api/admin/projects/${projId}/images`, { method: 'POST', headers: { Origin: B, Cookie: A }, body: okf });
const up = r.status === 201 ? await r.json() : {};
await t('image légitime acceptée (201) et convertie en WebP', () => r.status === 201 && /\.webp$/.test(up.url ?? ''));
await t('nom de fichier dangereux ignoré : nom généré par le serveur', () => /^\/media\/projets\/[a-z0-9-]+\.webp$/.test(up.url ?? '') && !/evil|php|\.\./.test(up.url ?? ''));
await t('fichier stocké servi comme image (jamais exécuté)', async () => { const f = await get(up.url); return f.status === 200 && f.headers.get('content-type') === 'image/webp' && f.headers.get('x-content-type-options') === 'nosniff'; });
await t('suppression d’image sans session → 401', async () => (await api(`/api/admin/images/${up.id}`, 'DELETE', undefined)).status === 401);
await t('téléversement sans session → 401', async () => { const f = new FormData(); f.append('file', new Blob([png]), 'a.png'); return (await fetch(`${B}/api/admin/projects/${projId}/images`, { method: 'POST', headers: { Origin: B }, body: f })).status === 401; });
await t('traversée de répertoire /media/../ → bloquée', async () => [403, 404].includes((await get('/media/..%2f..%2fpackage.json')).status) && [403, 404].includes((await get('/media/%2e%2e/%2e%2e/.env')).status));

/* ---------- 9. IDOR / appartenance ---------- */
await t('image d’un autre projet comme image principale → 404', async () => (await api(`/api/admin/projects/${projId}/cover`, 'POST', { imageId: '00000000-0000-0000-0000-000000000000' }, { cookie: A })).status === 404);
await t('modifier une image inexistante → 404', async () => (await api('/api/admin/images/00000000-0000-0000-0000-000000000000', 'PATCH', { caption: 'x' }, { cookie: A })).status === 404);

/* ---------- 10. XSS ---------- */
await form('/admin/faq', { action: 'create', question: '<script>alert("faq")</script> Question ?', answer: '</script><script>alert(2)</script><img src=x onerror=alert(3)>', published: 'on' }, { cookie: A });
const home = await (await get('/')).text();
await t('XSS FAQ : balises affichées comme du texte (échappées)', () => home.includes('&lt;script&gt;alert(&quot;faq&quot;)&lt;/script&gt;') || home.includes('&lt;script&gt;alert("faq")&lt;/script&gt;'));
await t('XSS FAQ : aucun <script>alert / onerror exécutable dans le HTML', () => !/<script>alert|<img src=x onerror/.test(tagsOnly(home)));
await t('XSS JSON-LD : « </script> » neutralisé dans les données structurées', () => !/<\/script><script>alert\(2\)/.test(home) && home.includes('\\u003c/script'));
const prev = await (await get(`/admin/projets/${projId}/apercu`, A)).text();
await t('XSS titre de projet : affiché échappé dans la fiche', () => prev.includes('&lt;script&gt;') && !/<script>alert|<img src=x onerror|<svg onload/.test(tagsOnly(prev)));
await t('XSS : guillemets échappés dans les attributs (impossible d’en sortir)', () => prev.includes('content="&quot;&gt;&lt;svg') || prev.includes('content="&quot;><svg'));

/* ---------- 11. Injection SQL ---------- */
await t('recherche « \' OR 1=1 -- » traitée comme du texte', async () => { const x = await get("/admin/projets?q=" + encodeURIComponent("' OR 1=1 --"), A); return x.status === 200 && (await x.text()).includes('Aucun projet ne correspond'); });
r = await proj({ title: "Robert'); DROP TABLE projects;--" });
await t('titre contenant du SQL enregistré tel quel, table intacte', async () => r.status === 303 && (await (await get('/admin/projets', A)).text()).includes('Robert&#39;); DROP TABLE projects;--'));

/* ---------- 12. En-têtes, CORS, erreurs ---------- */
r = await get('/admin/login');
await t('admin : CSP présente (frame-ancestors none, object-src none)', () => /frame-ancestors 'none'/.test(r.headers.get('content-security-policy') ?? '') && /object-src 'none'/.test(r.headers.get('content-security-policy') ?? ''));
await t('admin : X-Frame-Options DENY + no-store + noindex', () => r.headers.get('x-frame-options') === 'DENY' && r.headers.get('cache-control') === 'no-store' && /noindex/.test(r.headers.get('x-robots-tag') ?? ''));
await t('nosniff + Referrer-Policy + COOP', () => r.headers.get('x-content-type-options') === 'nosniff' && Boolean(r.headers.get('referrer-policy')) && r.headers.get('cross-origin-opener-policy') === 'same-origin');
r = await fetch(B + '/api/admin/projects/order', { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' } });
await t('CORS : aucune origine étrangère autorisée', () => !r.headers.get('access-control-allow-origin'));
r = await get('/_functions/inexistant');
await t('chemin inconnu commençant par « /_ » → 404 (et non 500)', () => r.status === 404);
r = await get('/projets/inexistant');
await t('404 sans trace technique (pile d’appels, chemin serveur)', async () => { const b = await r.text(); return r.status === 404 && !/\n\s+at [^\n]+:\d+:\d+|\/var\/task|Error: /.test(b); });

/* ---------- 13. Journal de sécurité ---------- */
await new Promise((res) => setTimeout(res, 500));
for (const ev of ['login.failure', 'login.success', 'login.locked', 'csrf.blocked', 'logout', 'admin.created', 'admin.removed', 'access.denied', 'setup.admin_created'])
  await t(`journal : événement « ${ev} » enregistré`, () => logs.includes(`"event":"${ev}"`));
await t('journal : aucun mot de passe ni jeton en clair', () => !logs.includes(PW) && !logs.includes(A.split('=')[1]));

console.log(`\n${pass} réussis, ${fail} échoués`);
srv.kill('SIGTERM');
rmSync('./.data/test-http', { recursive: true, force: true });
process.exit(fail ? 1 : 0);
