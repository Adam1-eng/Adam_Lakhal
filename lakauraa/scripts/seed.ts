// Importe le contenu de départ dans une base vide : npm run db:seed
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { seedDatabase } from '../src/lib/seed';

await seedDatabase((file) => readFile(path.resolve('public/seed', file)));
process.exit(0);
