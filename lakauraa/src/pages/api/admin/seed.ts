// Importe le contenu de départ dans une base vide (bouton du tableau de bord).
import type { APIRoute } from 'astro';
import { seedDatabase } from '../../../lib/seed';
import { denied } from '../../../lib/admin';

export const POST: APIRoute = async (ctx) => {
  const no = denied(ctx);
  if (no) return no;
  const origin = ctx.url.origin;
  try {
    const r = await seedDatabase(async (file) => {
      const res = await fetch(`${origin}/seed/${encodeURIComponent(file)}`);
      if (!res.ok) throw new Error(`Image de départ introuvable : ${file}`);
      return Buffer.from(await res.arrayBuffer());
    }, () => {}, { deadline: Date.now() + 15_000 });
    if (r.remaining > 0) return ctx.redirect(`/admin?seed=continue&ok=${encodeURIComponent(`Import en cours… encore ${r.remaining} projet(s).`)}`, 303);
    return ctx.redirect('/admin?ok=' + encodeURIComponent('Contenu de départ importé.'), 303);
  } catch (e) {
    console.error('[seed]', e);
    return ctx.redirect('/admin?erreur=' + encodeURIComponent('Import impossible : ' + (e as Error).message), 303);
  }
};
