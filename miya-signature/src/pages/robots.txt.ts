import type { APIRoute } from 'astro';
import { identity, status } from '../config/miya';

export const GET: APIRoute = () => {
  const body = status.demo
    ? `# Maquette de démonstration : indexation bloquée.\nUser-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${identity.siteUrl}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
