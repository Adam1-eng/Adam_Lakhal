import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

// Fichier de validation Google Search Console (méthode « Fichier HTML »).
// Ne répond QUE pour le nom exact configuré dans SITE.googleVerification.file ; toute autre adresse « /….html » → 404.
export const GET: APIRoute = ({ params }) => {
  const name = `${params.gsc}.html`;
  const expected = SITE.googleVerification.file.trim();
  if (!expected || name !== expected || !/^google[a-z0-9]+\.html$/i.test(expected)) return new Response('Introuvable', { status: 404 });
  return new Response(`google-site-verification: ${expected}`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0' } });
};
