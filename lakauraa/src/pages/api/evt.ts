import type { APIRoute } from 'astro';
import { isStatEvent, cleanPath, recordStat } from '../../lib/stats';

// Réception d'une action de contact (anonyme). Toujours 204 ou une erreur sans détail.
export const POST: APIRoute = async ({ request, url }) => {
  const res = (status: number) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
  if (request.headers.get('origin') !== url.origin) return res(403);
  const raw = await request.text();
  if (raw.length > 300) return res(413);
  let body: { e?: unknown; p?: unknown };
  try { body = JSON.parse(raw); } catch { return res(400); }
  const path = cleanPath(body.p);
  if (!isStatEvent(body.e) || !path) return res(400);
  try { await recordStat(body.e, path); } catch (e) { console.error('[stats]', e instanceof Error ? e.message : 'erreur'); }
  return res(204);
};
