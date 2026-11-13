import { scrypt as _scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { and, eq, gt, lt, count } from 'drizzle-orm';
import type { AstroCookies } from 'astro';
import { getDb, schema } from './db';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SESSION_DAYS = 7;
export const MAX_ATTEMPTS = 5;
const WINDOW_MIN = 15;

export type AdminUser = { id: string; email: string; name: string };

/* ---------- Mots de passe (scrypt + sel aléatoire) ---------- */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, hashB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, SCRYPT);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 12) return 'Le mot de passe doit contenir au moins 12 caractères.';
  if (pw.length > 200) return 'Mot de passe trop long.';
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return 'Utilisez au moins une lettre et un chiffre.';
  return null;
}

/* ---------- Sessions ---------- */
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
export const cookieName = (secure: boolean) => (secure ? '__Host-lk_admin' : 'lk_admin');

export async function createSession(adminId: string, cookies: AstroCookies, secure: boolean, userAgent = '') {
  const db = await getDb();
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(schema.sessions).values({ id: sha256(token), adminId, expiresAt, userAgent: userAgent.slice(0, 200) });
  cookies.set(cookieName(secure), token, { httpOnly: true, secure, sameSite: 'strict', path: '/', expires: expiresAt });
}

export async function getSessionUser(cookies: AstroCookies, secure: boolean): Promise<AdminUser | null> {
  const token = cookies.get(cookieName(secure))?.value;
  if (!token || token.length > 100) return null;
  const db = await getDb();
  const rows = await db
    .select({ id: schema.admins.id, email: schema.admins.email, name: schema.admins.name })
    .from(schema.sessions)
    .innerJoin(schema.admins, eq(schema.sessions.adminId, schema.admins.id))
    .where(and(eq(schema.sessions.id, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function destroySession(cookies: AstroCookies, secure: boolean) {
  const token = cookies.get(cookieName(secure))?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
  }
  cookies.delete(cookieName(secure), { path: '/' });
}

export async function destroyAllSessions(adminId: string) {
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.adminId, adminId));
}

/* ---------- Limitation des tentatives de connexion ---------- */
export async function tooManyAttempts(keys: string[]): Promise<boolean> {
  const db = await getDb();
  const since = new Date(Date.now() - WINDOW_MIN * 60e3);
  for (const key of keys) {
    const [r] = await db
      .select({ n: count() })
      .from(schema.loginAttempts)
      .where(and(eq(schema.loginAttempts.key, key), eq(schema.loginAttempts.success, false), gt(schema.loginAttempts.createdAt, since)));
    if ((r?.n ?? 0) >= MAX_ATTEMPTS) return true;
  }
  return false;
}

export async function recordAttempt(keys: string[], success: boolean) {
  const db = await getDb();
  if (success) {
    for (const key of keys) {
      await db.delete(schema.loginAttempts).where(and(eq(schema.loginAttempts.key, key), eq(schema.loginAttempts.success, false)));
    }
  } else {
    await db.insert(schema.loginAttempts).values(keys.map((key) => ({ key, success })));
  }
  // Nettoyage : vieilles tentatives et sessions expirées
  await db.delete(schema.loginAttempts).where(lt(schema.loginAttempts.createdAt, new Date(Date.now() - 864e5)));
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

export async function adminCount(): Promise<number> {
  const db = await getDb();
  const [r] = await db.select({ n: count() }).from(schema.admins);
  return r?.n ?? 0;
}
