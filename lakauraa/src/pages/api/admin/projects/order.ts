import type { APIRoute } from 'astro';
import { z } from 'zod';
import { denied, json } from '../../../../lib/admin';
import { reorderProjects } from '../../../../lib/projects-admin';

const body = z.object({ ids: z.array(z.string().max(60)).max(500) });

export const POST: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const parsed = body.safeParse(await ctx.request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Requête invalide.' }, 400);
  await reorderProjects(parsed.data.ids);
  return json({ ok: true });
};
