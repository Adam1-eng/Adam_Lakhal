import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

// Index des sitemaps (adresse déjà déclarée dans robots.txt et dans <head>).
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? SITE.url).replace(/\/$/, '');
  const body = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${base}/sitemap-0.xml</loc></sitemap></sitemapindex>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=600' } });
};
