const NBSP = ' ';

/** 90 -> « 1 h 30 », 45 -> « 45 min », 120 -> « 2 h » */
export function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}${NBSP}min`;
  if (m === 0) return `${h}${NBSP}h`;
  return `${h}${NBSP}h${NBSP}${String(m).padStart(2, '0')}`;
}

/** 80 -> « 80 $ », 19.75 -> « 19,75 $ », 1200 -> « 1 200 $ » */
export function price(amount: number): string {
  const s = new Intl.NumberFormat('fr-CA', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${s.replace(/\s/g, NBSP)}${NBSP}$`;
}

export function number(n: number): string {
  return new Intl.NumberFormat('fr-CA').format(n).replace(/\s/g, NBSP);
}

/** ISO 8601 pour schema.org : 90 -> PT1H30M */
export function isoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}`;
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Met « Miya signature » en italique dans un texte (HTML échappé). */
export function brandItalic(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/Miya signature/g, '<em class="brand-em">Miya signature</em>');
}
