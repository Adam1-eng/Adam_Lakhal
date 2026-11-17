import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

// Règles d'exploration. Attention : robots.txt n'est pas une protection ; l'administration est
// protégée par mot de passe et envoie aussi « X-Robots-Tag: noindex ». Domaine lu depuis la configuration.
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? SITE.url).replace(/\/$/, '');
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', 'Disallow: /avis/', '', `Sitemap: ${base}/sitemap-index.xml`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' } });
};
