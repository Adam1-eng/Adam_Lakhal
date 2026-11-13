import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { env } from './db';

/**
 * Stockage des images.
 * Production : Vercel Blob (BLOB_READ_WRITE_TOKEN).
 * Développement : dossier local .data/uploads, servi par la route /media/...
 */
export const LOCAL_DIR = path.resolve('.data/uploads');
const useBlob = () => Boolean(env('BLOB_READ_WRITE_TOKEN'));

export async function putFile(key: string, data: Buffer, contentType: string): Promise<{ url: string; key: string }> {
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const r = await put(key, data, { access: 'public', contentType, addRandomSuffix: true, token: env('BLOB_READ_WRITE_TOKEN') });
    return { url: r.url, key: r.url };
  }
  if (env('VERCEL')) throw new Error('BLOB_READ_WRITE_TOKEN manquant : configurez le stockage Vercel Blob.');
  const unique = key.replace(/(\.\w+)$/, `-${crypto.randomUUID().slice(0, 8)}$1`);
  const file = path.join(LOCAL_DIR, unique);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return { url: `/media/${unique}`, key: unique };
}

/** Retire un fichier du stockage (ne touche jamais en dehors du dossier d’images). */
export async function removeStoredFile(key: string) {
  if (!key) return;
  try {
    if (key.startsWith('http')) {
      const { del } = await import('@vercel/blob');
      await del(key, { token: env('BLOB_READ_WRITE_TOKEN') });
    } else {
      const file = path.join(LOCAL_DIR, key);
      if (file.startsWith(LOCAL_DIR + path.sep)) await rm(file, { force: true });
    }
  } catch (e) {
    console.warn('[storage] suppression impossible', key, e);
  }
}
