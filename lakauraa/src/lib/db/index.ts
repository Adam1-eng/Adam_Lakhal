import * as schema from './schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type DB = NodePgDatabase<typeof schema>;
export { schema };

const g = globalThis as unknown as { __lkDb?: Promise<DB> };

export function env(name: string): string | undefined {
  return process.env[name] ?? (import.meta as any).env?.[name];
}

/**
 * Production : PostgreSQL via DATABASE_URL (Neon, Supabase, etc.).
 * Développement : PGlite (Postgres embarqué) dans .data/pglite, sans installation.
 */
async function create(): Promise<DB> {
  const url = env('DATABASE_URL') || env('POSTGRES_URL');
  if (url) {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { Pool } = await import('pg');
    const local = /localhost|127\.0\.0\.1/.test(url);
    // Connexion chiffrée ET certificat vérifié (protège contre l’interception). Désactivable seulement en local.
    const pool = new Pool({ connectionString: url, max: 3, ssl: local ? undefined : { rejectUnauthorized: true } });
    return drizzle(pool, { schema });
  }
  if (env('VERCEL')) throw new Error('DATABASE_URL manquant : configurez la base de données dans Vercel.');
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const dir = env('PGLITE_DIR') || './.data/pglite';
  const { mkdirSync } = await import('node:fs');
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  return drizzle(client, { schema }) as unknown as DB;
}

export function getDb(): Promise<DB> {
  g.__lkDb ??= create();
  return g.__lkDb;
}

export function usingPglite() {
  return !(env('DATABASE_URL') || env('POSTGRES_URL'));
}
