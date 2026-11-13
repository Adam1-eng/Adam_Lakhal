// Ajout d’une image à un projet (multipart : file, variant).
import type { APIRoute } from 'astro';
import { eq, max } from 'drizzle-orm';
import { getDb, schema } from '../../../../../lib/db';
import { denied, json } from '../../../../../lib/admin';
import { processImage, UploadError } from '../../../../../lib/images';

const MAX_BODY = 4_500_000; // limite des fonctions Vercel

export const POST: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const id = ctx.params.id ?? '';
  const db = await getDb();
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
  if (!project) return json({ error: 'Projet introuvable.' }, 404);

  const len = Number(ctx.request.headers.get('content-length') ?? 0);
  if (len > MAX_BODY) return json({ error: 'Image trop lourde (4 Mo maximum après compression).' }, 413);

  let fd: FormData;
  try { fd = await ctx.request.formData(); } catch { return json({ error: 'Envoi invalide.' }, 400); }
  const file = fd.get('file');
  if (!(file instanceof File)) return json({ error: 'Aucun fichier reçu.' }, 400);
  const variantRaw = String(fd.get('variant') ?? 'desktop');
  const variant = (['desktop', 'mobile', 'autre'].includes(variantRaw) ? variantRaw : 'desktop') as 'desktop' | 'mobile' | 'autre';

  try {
    const processed = await processImage(Buffer.from(await file.arrayBuffer()), `${project.slug}-${Date.now().toString(36)}`);
    const [{ m }] = await db.select({ m: max(schema.projectImages.sort) }).from(schema.projectImages).where(eq(schema.projectImages.projectId, id));
    const [img] = await db
      .insert(schema.projectImages)
      .values({ projectId: id, ...processed, variant, caption: '', sort: (m ?? -1) + 1 })
      .returning();
    // Première image « ordinateur » = image principale par défaut
    let cover = project.coverImageId;
    if (!cover && variant !== 'mobile') {
      cover = img.id;
      await db.update(schema.projects).set({ coverImageId: img.id, updatedAt: new Date() }).where(eq(schema.projects.id, id));
    }
    return json({ ...img, cover }, 201);
  } catch (e) {
    if (e instanceof UploadError) return json({ error: e.message }, 422);
    console.error('[upload]', e);
    return json({ error: 'Impossible d’enregistrer l’image. Réessayez.' }, 500);
  }
};
