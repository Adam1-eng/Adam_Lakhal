// Avis clients : invitations par lien personnel à usage unique, modération, affichage public.
import { randomBytes, createHash } from 'node:crypto';
import { and, desc, eq, gt } from 'drizzle-orm';
import { z } from 'zod';
import { getDb, schema } from './db';
import { getPublishedProjects, type ProjectCard } from './content';
import type { Review } from './db/schema';

const INVITE_DAYS = 60;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const validToken = (t: string) => /^[A-Za-z0-9_-]{30,60}$/.test(t);

export const reviewInput = z.object({
  rating: z.coerce.number().int().min(1, 'Choisissez une note de 1 à 5 étoiles.').max(5),
  comment: z.string().trim().min(10, 'Écrivez au moins quelques mots (10 caractères).').max(600, 'Commentaire trop long (600 caractères maximum).'),
  author: z.string().trim().min(2, 'Indiquez votre prénom ou votre nom.').max(60),
  business: z.string().trim().max(80),
  consent: z.literal('on', { message: 'Cochez la case pour autoriser la publication.' }),
}).strict();

/** Crée une invitation. Le jeton n’est renvoyé qu’ici (seule son empreinte est stockée). */
export async function createInvite(projectId: string | null, clientLabel: string) {
  const db = await getDb();
  const token = randomBytes(24).toString('base64url');
  const [row] = await db
    .insert(schema.reviews)
    .values({ tokenHash: sha256(token), projectId, clientLabel, expiresAt: new Date(Date.now() + INVITE_DAYS * 864e5) })
    .returning();
  return { id: row.id, token };
}

/** Invitation encore utilisable (jamais utilisée, non expirée), sinon null. */
export async function findInvite(token: string): Promise<Review | null> {
  if (!validToken(token)) return null;
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.reviews)
    .where(and(eq(schema.reviews.tokenHash, sha256(token)), eq(schema.reviews.status, 'invited'), gt(schema.reviews.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
}

/** Enregistre l’avis (usage unique : l’invitation passe en « en attente »). Renvoie false si le lien n’est plus valable. */
export async function submitReview(token: string, data: z.infer<typeof reviewInput>) {
  if (!validToken(token)) return false;
  const db = await getDb();
  const updated = await db
    .update(schema.reviews)
    .set({ rating: data.rating, comment: data.comment, author: data.author, business: data.business, status: 'pending', submittedAt: new Date() })
    .where(and(eq(schema.reviews.tokenHash, sha256(token)), eq(schema.reviews.status, 'invited'), gt(schema.reviews.expiresAt, new Date())))
    .returning({ id: schema.reviews.id });
  return updated.length === 1;
}

export type PublicReview = Review & { project: ProjectCard | null };

export async function getPublishedReviews(): Promise<PublicReview[]> {
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.reviews).where(eq(schema.reviews.status, 'published')).orderBy(desc(schema.reviews.publishedAt));
    if (!rows.length) return [];
    const projects = await getPublishedProjects();
    return rows.map((r) => ({ ...r, project: projects.find((p) => p.id === r.projectId) ?? null }));
  } catch (e) {
    console.error('[reviews] indisponibles :', e instanceof Error ? e.message : e);
    return [];
  }
}

export function summarize(list: { rating: number }[]) {
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average, label: average.toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) };
}

export async function getReviewSummary() {
  try {
    const db = await getDb();
    return summarize(await db.select({ rating: schema.reviews.rating }).from(schema.reviews).where(eq(schema.reviews.status, 'published')));
  } catch {
    return summarize([]);
  }
}
