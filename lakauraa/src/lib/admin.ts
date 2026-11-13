// Outils partagés de l’espace administrateur : validation, formulaires, réponses JSON.
import { z } from 'zod';
import { and, eq, ne } from 'drizzle-orm';
import type { APIContext } from 'astro';
import { getDb, schema } from './db';
import { slugify } from './content';

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/** Double vérification côté serveur (en plus du middleware) : renvoie une réponse 401 si personne n’est connecté. */
export function denied(ctx: Pick<APIContext, 'locals'>): Response | null {
  return ctx.locals.admin ? null : json({ error: 'Authentification requise.' }, 401);
}

/** Courriel valide et sans caractère dangereux (<, >, guillemets…), 200 caractères max. */
export const isEmail = (v: string) => v.length <= 200 && /^[^\s@<>"'`;,()\\]+@[^\s@<>"'`;,()\\]+\.[a-z]{2,}$/i.test(v);

export const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
export const bool = (fd: FormData, k: string) => ['on', 'true', '1'].includes(String(fd.get(k) ?? ''));

const url = z.union([
  z.literal(''),
  z.string().trim().max(500).regex(/^(https?:\/\/|\/)[^\s<>"']+$/i, 'Lien invalide (doit commencer par https:// ou /).'),
]);

export const projectInput = z.object({
  title: z.string().trim().min(2, 'Nom du projet requis.').max(120),
  slug: z.string().trim().max(80).optional(),
  client: z.string().trim().max(120),
  categoryId: z.string().trim().max(60).nullable(),
  kind: z.enum(['client', 'personnel', 'exemple', 'maquette']),
  location: z.string().trim().max(120),
  summary: z.string().trim().max(400, 'Description courte : 400 caractères maximum.'),
  body: z.string().trim().max(8000),
  challenge: z.string().trim().max(1500),
  solution: z.string().trim().max(1500),
  features: z.array(z.object({ title: z.string().max(120), text: z.string().max(400) })).max(12),
  technologies: z.array(z.string().trim().min(1).max(40)).max(20),
  completedOn: z.union([z.literal(''), z.string().regex(/^\d{4}(-\d{2})?$/, 'Date au format AAAA ou AAAA-MM.')]),
  liveUrl: url,
  githubUrl: url,
  videoUrl: url,
  featured: z.boolean(),
});
export type ProjectInput = z.infer<typeof projectInput>;

/** Lit le formulaire projet. Fonctionnalités : une par ligne, « Titre : description ». */
export function parseProjectForm(fd: FormData) {
  const features = str(fd, 'features')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(':');
      return i > 0 ? { title: l.slice(0, i).trim(), text: l.slice(i + 1).trim() } : { title: l, text: '' };
    });
  const technologies = str(fd, 'technologies').split(',').map((t) => t.trim()).filter(Boolean);
  return projectInput.safeParse({
    title: str(fd, 'title'),
    slug: str(fd, 'slug'),
    client: str(fd, 'client'),
    categoryId: str(fd, 'categoryId') || null,
    kind: str(fd, 'kind') || 'client',
    location: str(fd, 'location'),
    summary: str(fd, 'summary'),
    body: str(fd, 'body'),
    challenge: str(fd, 'challenge'),
    solution: str(fd, 'solution'),
    features,
    technologies,
    completedOn: str(fd, 'completedOn'),
    liveUrl: str(fd, 'liveUrl'),
    githubUrl: str(fd, 'githubUrl'),
    videoUrl: str(fd, 'videoUrl'),
    featured: bool(fd, 'featured'),
  });
}

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? 'Données invalides.';
}

/** Slug unique pour un projet (ajoute -2, -3… si nécessaire). */
export async function uniqueProjectSlug(base: string, excludeId?: string) {
  const db = await getDb();
  const root = slugify(base) || 'projet';
  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const where = excludeId
      ? and(eq(schema.projects.slug, candidate), ne(schema.projects.id, excludeId))
      : eq(schema.projects.slug, candidate);
    const found = await db.select({ id: schema.projects.id }).from(schema.projects).where(where).limit(1);
    if (!found.length) return candidate;
  }
  return `${root}-${crypto.randomUUID().slice(0, 6)}`;
}

/** Échange la position d’un élément avec son voisin (listes ordonnées : FAQ, témoignages, catégories). */
export function moveInList<T extends { id: string }>(list: T[], id: string, dir: 'up' | 'down') {
  const i = list.findIndex((x) => x.id === id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

/** Redirection après connexion : uniquement vers une page interne de l’admin (anti open-redirect). */
export const isSafeNext = (next: string | null) =>
  Boolean(next && next.length < 300 && /^\/admin(\/|$|\?)/.test(next) && !next.startsWith('//') && !/[\\\s\x00-\x1f]/.test(next));

export const clientIp = (request: Request, fallback = 'local') =>
  (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || fallback).trim().slice(0, 64);
