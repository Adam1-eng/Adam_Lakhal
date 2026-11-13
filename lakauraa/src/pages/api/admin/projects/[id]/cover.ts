import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { getDb, schema } from '../../../../../lib/db';
import { denied, json } from '../../../../../lib/admin';

const body = z.object({ imageId: z.string().max(60) });

export const POST: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const parsed = body.safeParse(await ctx.request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Requête invalide.' }, 400);
  const id = ctx.params.id ?? '';
  const db = await getDb();
  const [img] = await db
    .select({ id: schema.projectImages.id })
    .from(schema.projectImages)
    .where(and(eq(schema.projectImages.id, parsed.data.imageId), eq(schema.projectImages.projectId, id)))
    .limit(1);
  if (!img) return json({ error: 'Image introuvable pour ce projet.' }, 404);
  await db.update(schema.projects).set({ coverImageId: img.id, updatedAt: new Date() }).where(eq(schema.projects.id, id));
  return json({ ok: true });
};
