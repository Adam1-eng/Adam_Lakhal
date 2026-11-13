// Opérations d’écriture sur les projets (utilisées par les pages et l’API admin).
import { asc, eq, inArray } from 'drizzle-orm';
import { getDb, schema } from './db';
import { removeStoredFile } from './storage';
import { securityEvent } from './security-log';

export async function deleteProject(id: string) {
  const db = await getDb();
  const imgs = await db.select().from(schema.projectImages).where(eq(schema.projectImages.projectId, id));
  await db.delete(schema.projects).where(eq(schema.projects.id, id)); // les images en base suivent (cascade)
  await Promise.all(imgs.flatMap((i) => [removeStoredFile(i.storageKey), removeStoredFile(i.thumbKey)]));
  securityEvent('project.deleted', { project: id, images: imgs.length });
}

export async function setStatus(id: string, status: 'draft' | 'published') {
  const db = await getDb();
  const [p] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
  if (!p) return;
  await db
    .update(schema.projects)
    .set({ status, updatedAt: new Date(), publishedAt: status === 'published' ? p.publishedAt ?? new Date() : p.publishedAt })
    .where(eq(schema.projects.id, id));
}

export async function setFeatured(id: string, featured: boolean) {
  const db = await getDb();
  await db.update(schema.projects).set({ featured, updatedAt: new Date() }).where(eq(schema.projects.id, id));
}

/** Enregistre un nouvel ordre d’affichage. `ids` doit contenir des projets existants. */
export async function reorderProjects(ids: string[]) {
  const db = await getDb();
  const existing = await db.select({ id: schema.projects.id }).from(schema.projects).where(inArray(schema.projects.id, ids));
  const valid = new Set(existing.map((x) => x.id));
  let i = 0;
  for (const id of ids) if (valid.has(id)) await db.update(schema.projects).set({ sort: i++ }).where(eq(schema.projects.id, id));
}

export async function moveProject(id: string, dir: 'up' | 'down') {
  const db = await getDb();
  const all = await db.select({ id: schema.projects.id }).from(schema.projects).orderBy(asc(schema.projects.sort), asc(schema.projects.createdAt));
  const ids = all.map((x) => x.id);
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await reorderProjects(ids);
}

export async function reorderImages(projectId: string, ids: string[]) {
  const db = await getDb();
  const mine = await db.select({ id: schema.projectImages.id }).from(schema.projectImages).where(eq(schema.projectImages.projectId, projectId));
  const valid = new Set(mine.map((x) => x.id));
  let i = 0;
  for (const id of ids) if (valid.has(id)) await db.update(schema.projectImages).set({ sort: i++ }).where(eq(schema.projectImages.id, id));
}
