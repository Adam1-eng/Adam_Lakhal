// Modifier (PATCH), remplacer (POST multipart) ou supprimer (DELETE) une image.
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { asc, and, eq, ne } from 'drizzle-orm';
import { getDb, schema } from '../../../../lib/db';
import { denied, json } from '../../../../lib/admin';
import { processImage, UploadError } from '../../../../lib/images';
import { removeStoredFile } from '../../../../lib/storage';

const patchBody = z.object({
  caption: z.string().trim().max(160).optional(),
  variant: z.enum(['desktop', 'mobile', 'autre']).optional(),
  visible: z.boolean().optional(),
}).strict();

async function find(id: string) {
  const db = await getDb();
  const [img] = await db.select().from(schema.projectImages).where(eq(schema.projectImages.id, id)).limit(1);
  return { db, img };
}

export const PATCH: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const parsed = patchBody.safeParse(await ctx.request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Requête invalide.' }, 400);
  const { db, img } = await find(ctx.params.id ?? '');
  if (!img) return json({ error: 'Image introuvable.' }, 404);
  await db.update(schema.projectImages).set(parsed.data).where(eq(schema.projectImages.id, img.id));
  return json({ ok: true });
};

export const POST: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const { db, img } = await find(ctx.params.id ?? '');
  if (!img) return json({ error: 'Image introuvable.' }, 404);
  if (Number(ctx.request.headers.get('content-length') ?? 0) > 4_500_000) return json({ error: 'Image trop lourde.' }, 413);
  const fd = await ctx.request.formData().catch(() => null);
  const file = fd?.get('file');
  if (!(file instanceof File)) return json({ error: 'Aucun fichier reçu.' }, 400);
  try {
    const processed = await processImage(Buffer.from(await file.arrayBuffer()), `remplacement-${Date.now().toString(36)}`);
    const [updated] = await db.update(schema.projectImages).set(processed).where(eq(schema.projectImages.id, img.id)).returning();
    await Promise.all([removeStoredFile(img.storageKey), removeStoredFile(img.thumbKey)]);
    return json(updated);
  } catch (e) {
    if (e instanceof UploadError) return json({ error: e.message }, 422);
    console.error('[replace]', e);
    return json({ error: 'Remplacement impossible.' }, 500);
  }
};

export const DELETE: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const { db, img } = await find(ctx.params.id ?? '');
  if (!img) return json({ error: 'Image introuvable.' }, 404);
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, img.projectId)).limit(1);
  await db.delete(schema.projectImages).where(eq(schema.projectImages.id, img.id));
  await Promise.all([removeStoredFile(img.storageKey), removeStoredFile(img.thumbKey)]);
  let cover = project?.coverImageId ?? null;
  if (project && cover === img.id) {
    // Nouvelle image principale : la première capture « ordinateur » restante
    const [nextImg] = await db
      .select()
      .from(schema.projectImages)
      .where(and(eq(schema.projectImages.projectId, project.id), ne(schema.projectImages.variant, 'mobile')))
      .orderBy(asc(schema.projectImages.sort))
      .limit(1);
    cover = nextImg?.id ?? null;
    await db.update(schema.projects).set({ coverImageId: cover, updatedAt: new Date() }).where(eq(schema.projects.id, project.id));
  }
  return json({ ok: true, cover });
};
