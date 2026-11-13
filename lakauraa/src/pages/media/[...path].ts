// Développement uniquement : sert les images stockées localement (.data/uploads).
// En production, les images sont servies directement par Vercel Blob.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_DIR } from '../../lib/storage';
import { env } from '../../lib/db';

const TYPES: Record<string, string> = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

export const GET: APIRoute = async ({ params }) => {
  if (env('BLOB_READ_WRITE_TOKEN') || env('VERCEL')) return new Response('Introuvable', { status: 404 });
  const file = path.join(LOCAL_DIR, params.path ?? '');
  if (!file.startsWith(LOCAL_DIR + path.sep)) return new Response('Interdit', { status: 403 });
  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Introuvable', { status: 404 });
  }
};
