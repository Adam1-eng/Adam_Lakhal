// Outils SEO partagés : pages publiques indexables, sitemap, descriptions.
import { getPublishedProjects } from './content';
import { getReviewSummary } from './reviews';

/** Pages fixes indexables (les pages privées — admin, API, liens d’avis — n’y figurent jamais). */
export const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/services', priority: 0.9, changefreq: 'monthly' },
  { path: '/projets', priority: 0.9, changefreq: 'weekly' },
  { path: '/contact', priority: 0.8, changefreq: 'yearly' },
  { path: '/a-propos', priority: 0.6, changefreq: 'yearly' },
  { path: '/faq', priority: 0.6, changefreq: 'monthly' },
  { path: '/mentions-legales', priority: 0.2, changefreq: 'yearly' },
  { path: '/confidentialite', priority: 0.2, changefreq: 'yearly' },
  { path: '/conditions-utilisation', priority: 0.2, changefreq: 'yearly' },
  { path: '/conditions-vente', priority: 0.2, changefreq: 'yearly' },
  { path: '/politique-cookies', priority: 0.2, changefreq: 'yearly' },
];

export type SitemapEntry = { path: string; lastmod?: Date; priority: number; changefreq: string };

/** Toutes les URL publiques : pages fixes + projets publiés (jamais les brouillons) + mur d’avis s’il contient des avis. */
export async function sitemapEntries(): Promise<SitemapEntry[]> {
  const [projects, reviews] = await Promise.all([getPublishedProjects(), getReviewSummary()]);
  const entries: SitemapEntry[] = [...staticPages];
  if (reviews.count > 0) entries.push({ path: '/avis', priority: 0.6, changefreq: 'weekly' });
  for (const p of projects) entries.push({ path: `/projets/${p.slug}`, lastmod: p.updatedAt ?? undefined, priority: p.kind === 'maquette' ? 0.5 : 0.7, changefreq: 'monthly' });
  return entries;
}

/** Coupe proprement un texte à une longueur donnée (fin de mot + « … »). */
export function clip(text: string, max = 158) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[\s,;:.–-]+$/, '') + '…';
}

export const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
