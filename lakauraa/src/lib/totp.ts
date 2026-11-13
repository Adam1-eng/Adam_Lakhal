// Double authentification (TOTP, RFC 6238) — compatible Google Authenticator, Microsoft Authenticator, Authy, 1Password…
// Aucune dépendance : HMAC-SHA1, codes à 6 chiffres, période de 30 s.
import { createHmac, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb, schema } from './db';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD = 30;

export function base32Encode(buf: Buffer) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string) {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of s.toUpperCase().replace(/[^A-Z2-7]/g, '')) {
    value = (value << 5) | ALPHABET.indexOf(ch); bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export const generateSecret = () => base32Encode(randomBytes(20));

export function totpAt(secret: string, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, '0');
}

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Renvoie le « pas » de temps accepté (±30 s de tolérance), ou null. Refuse un code déjà utilisé (anti-rejeu). */
export function verifyTotp(secret: string, code: string, lastStep = 0, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code) || !secret) return null;
  const current = Math.floor(now / 1000 / PERIOD);
  for (const step of [current, current - 1, current + 1]) {
    if (step > lastStep && same(totpAt(secret, step), code)) return step;
  }
  return null;
}

export const otpauthUri = (secret: string, email: string) =>
  `otpauth://totp/${encodeURIComponent('Lakauraa:' + email)}?secret=${secret}&issuer=Lakauraa&algorithm=SHA1&digits=6&period=30`;

/* ---------- Codes de secours (usage unique, stockés hachés) ---------- */
const normalize = (c: string) => c.toLowerCase().replace(/[^a-z0-9]/g, '');
export const hashRecovery = (c: string) => createHash('sha256').update(normalize(c)).digest('hex');
export function generateRecoveryCodes(n = 8) {
  return Array.from({ length: n }, () => {
    const s = randomBytes(5).toString('hex');
    return `${s.slice(0, 5)}-${s.slice(5)}`;
  });
}

/** Second facteur à la connexion : code à 6 chiffres ou code de secours. Met à jour l’anti-rejeu / consomme le code. */
export async function checkSecondFactor(admin: typeof schema.admins.$inferSelect, input: string): Promise<'totp' | 'recovery' | null> {
  const code = input.trim();
  if (!code || code.length > 40) return null;
  const db = await getDb();
  const step = verifyTotp(admin.totpSecret, code.replace(/\s/g, ''), admin.totpLastStep);
  if (step !== null) {
    await db.update(schema.admins).set({ totpLastStep: step }).where(eq(schema.admins.id, admin.id));
    return 'totp';
  }
  const h = hashRecovery(code);
  if (normalize(code).length === 10 && admin.recoveryCodes.includes(h)) {
    await db.update(schema.admins).set({ recoveryCodes: admin.recoveryCodes.filter((x) => x !== h) }).where(eq(schema.admins.id, admin.id));
    return 'recovery';
  }
  return null;
}
