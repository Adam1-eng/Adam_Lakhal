// Applique les migrations SQL (dossier drizzle/). Lancé automatiquement au déploiement Vercel (script vercel-build).
import { getDb, usingPglite } from '../src/lib/db';

const db = await getDb();
if (usingPglite()) {
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db as any, { migrationsFolder: './drizzle' });
} else {
  const { migrate } = await import('drizzle-orm/node-postgres/migrator');
  await migrate(db, { migrationsFolder: './drizzle' });
}
console.log('✓ Migrations appliquées' + (usingPglite() ? ' (PGlite local)' : ''));
process.exit(0);
