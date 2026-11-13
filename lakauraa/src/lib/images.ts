import sharp from 'sharp';
import { putFile } from './storage';

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(['jpeg', 'png', 'webp', 'avif', 'gif']);

export class UploadError extends Error {}

/** Valide le fichier (taille + vrai format lu dans le contenu), puis crée 2 versions WebP optimisées. */
export async function processImage(input: Buffer, baseName: string) {
  if (input.byteLength === 0) throw new UploadError('Fichier vide.');
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new UploadError('Image trop lourde (12 Mo maximum).');
  let meta;
  try {
    meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
  } catch {
    throw new UploadError('Ce fichier n’est pas une image valide.');
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new UploadError('Formats acceptés : JPG, PNG, WebP, AVIF, GIF.');

  const base = sharp(input, { limitInputPixels: 60_000_000 }).rotate();
  const full = await base.clone().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const thumb = await base.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();

  const slug =
    baseName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const a = await putFile(`projets/${slug}.webp`, full.data, 'image/webp');
  const b = await putFile(`projets/${slug}-mini.webp`, thumb, 'image/webp');
  return { url: a.url, storageKey: a.key, thumbUrl: b.url, thumbKey: b.key, width: full.info.width, height: full.info.height };
}
