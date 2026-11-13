// Pays approximatif du visiteur, déduit par Vercel à partir de l’adresse IP (aucun service tiers, aucun cookie).
// Sert uniquement à suggérer le bon numéro WhatsApp ; le visiteur peut toujours choisir.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  const raw = request.headers.get('x-vercel-ip-country') ?? '';
  const country = /^[A-Z]{2}$/.test(raw) ? raw : null;
  return new Response(JSON.stringify({ country }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', Vary: 'x-vercel-ip-country' },
  });
};
