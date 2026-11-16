import type { APIRoute } from 'astro';
import { sitemapEntries, xmlEscape } from '../lib/seo';

// Sitemap dynamique : un projet publié dans l’admin y apparaît automatiquement (cache CDN de 10 min).
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://lakauraa.vercel.app/').replace(/\/$/, '');
  const urls = (await sitemapEntries()).map((e) =>
    `<url><loc>${xmlEscape(base + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}<changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`,
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=600' } });
};
