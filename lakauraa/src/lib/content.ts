// Accès aux contenus du site public (lus dans la base de données).
import { and, asc, eq, inArray } from 'drizzle-orm';
import { getDb, schema } from './db';
import type { Project, ProjectImage, Category } from './db/schema';

/* ---------- Paramètres modifiables depuis l’admin ---------- */
export type ContactSettings = { email: string; phone: string; city: string; responseTime: string };
export type WhatsappSettings = { ma: string; ca: string; message: string };
export type SocialSettings = { instagram: string; tiktok: string; linkedin: string; github: string; facebook: string; youtube: string };
export type LegalSettings = {
  ownerName: string;
  businessName: string;
  legalStatus: string;
  registrationCa: string; // NEQ (Québec)
  registrationMa: string; // ICE / IF / RC (Maroc)
  address: string;
  privacyOfficer: string;
  privacyEmail: string;
  updatedOn: string;
};
export type SiteSettings = { contact: ContactSettings; whatsapp: WhatsappSettings; socials: SocialSettings; legal: LegalSettings };

export const defaultSettings: SiteSettings = {
  contact: { email: 'adamlakhal800@gmail.com', phone: '438-528-0259', city: 'Montréal', responseTime: 'moins de 24 h' },
  // Numéros WhatsApp au format international, chiffres seulement (ex. 212600000000 / 14385280259). Vides = masqués.
  whatsapp: {
    ma: '212621971718',
    ca: '',
    message: 'Bonjour Adam, je vous contacte depuis le site Lakauraa. J’aimerais en savoir plus pour un site web.',
  },
  socials: { instagram: '', tiktok: '', linkedin: '', github: '', facebook: '', youtube: '' },
  legal: {
    ownerName: 'Adam Lakhal',
    businessName: 'Lakauraa',
    legalStatus: '',
    registrationCa: '',
    registrationMa: '',
    address: '',
    privacyOfficer: 'Adam Lakhal',
    privacyEmail: 'adamlakhal800@gmail.com',
    updatedOn: '',
  },
};

export const socialLabels: Record<keyof SocialSettings, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[content] ${label} indisponible :`, e);
    return fallback;
  }
}

export async function getSettings(): Promise<SiteSettings> {
  return safe(async () => {
    const db = await getDb();
    const rows = await db.select().from(schema.settings);
    const out = structuredClone(defaultSettings) as SiteSettings;
    for (const r of rows) {
      if (r.key in out) Object.assign((out as any)[r.key], r.value as object);
    }
    return out;
  }, defaultSettings, 'paramètres');
}

export async function saveSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}

export const activeSocials = (s: SocialSettings) =>
  (Object.keys(socialLabels) as (keyof SocialSettings)[]).filter((k) => s[k]?.trim()).map((k) => ({ id: k, label: socialLabels[k], url: s[k].trim() }));

/* ---------- FAQ, services, témoignages ---------- */
export const getFaqs = () =>
  safe(async () => {
    const db = await getDb();
    return db.select().from(schema.faqs).where(eq(schema.faqs.published, true)).orderBy(asc(schema.faqs.sort), asc(schema.faqs.createdAt));
  }, [], 'FAQ');

export const getServices = () =>
  safe(async () => {
    const db = await getDb();
    return db.select().from(schema.services).orderBy(asc(schema.services.sort));
  }, [], 'services');

export const getTestimonials = () =>
  safe(async () => {
    const db = await getDb();
    return db.select().from(schema.testimonials).where(eq(schema.testimonials.published, true)).orderBy(asc(schema.testimonials.sort));
  }, [], 'témoignages');

/* ---------- Portfolio ---------- */
export type ProjectCard = Project & { category: Category | null; cover: ProjectImage | null; mobile: ProjectImage | null };
export type ProjectFull = ProjectCard & { images: ProjectImage[] };

export const kindLabel: Record<Project['kind'], string> = {
  client: 'Projet client',
  personnel: 'Projet personnel',
  exemple: 'Exemple',
  maquette: 'Maquette',
};

async function hydrate(list: Project[]): Promise<ProjectCard[]> {
  if (!list.length) return [];
  const db = await getDb();
  const ids = list.map((p) => p.id);
  const [imgs, cats] = await Promise.all([
    db.select().from(schema.projectImages).where(inArray(schema.projectImages.projectId, ids)).orderBy(asc(schema.projectImages.sort)),
    db.select().from(schema.categories),
  ]);
  return list.map((p) => {
    const mine = imgs.filter((i) => i.projectId === p.id);
    const cover = mine.find((i) => i.id === p.coverImageId) ?? mine.find((i) => i.variant === 'desktop') ?? mine[0] ?? null;
    const mobile = mine.find((i) => i.variant === 'mobile') ?? null;
    return { ...p, category: cats.find((c) => c.id === p.categoryId) ?? null, cover, mobile };
  });
}

export const getPublishedProjects = (opts: { featured?: boolean } = {}) =>
  safe(async () => {
    const db = await getDb();
    const where = opts.featured
      ? and(eq(schema.projects.status, 'published'), eq(schema.projects.featured, true))
      : eq(schema.projects.status, 'published');
    const list = await db.select().from(schema.projects).where(where).orderBy(asc(schema.projects.sort), asc(schema.projects.createdAt));
    return hydrate(list);
  }, [] as ProjectCard[], 'projets');

/** Catégories qui contiennent au moins un projet publié, dans l’ordre défini. */
export const categoriesFor = (projects: ProjectCard[]) => {
  const map = new Map<string, Category & { count: number }>();
  for (const p of projects) {
    if (!p.category) continue;
    const c = map.get(p.category.id) ?? { ...p.category, count: 0 };
    c.count++;
    map.set(c.id, c);
  }
  return [...map.values()].sort((a, b) => a.sort - b.sort);
};

export async function getProjectBySlug(slug: string, { includeDrafts = false } = {}): Promise<ProjectFull | null> {
  return safe(async () => {
    const db = await getDb();
    const where = includeDrafts ? eq(schema.projects.slug, slug) : and(eq(schema.projects.slug, slug), eq(schema.projects.status, 'published'));
    const [p] = await db.select().from(schema.projects).where(where).limit(1);
    if (!p) return null;
    const [card] = await hydrate([p]);
    const images = await db.select().from(schema.projectImages).where(eq(schema.projectImages.projectId, p.id)).orderBy(asc(schema.projectImages.sort));
    return { ...card, images };
  }, null, 'projet');
}

export function imageSrcset(img: ProjectImage) {
  return `${img.thumbUrl} 900w, ${img.url} ${img.width}w`;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

/** Lien WhatsApp avec message prérempli. */
export const waLink = (number: string, message: string) => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

/** Lien tel: — un numéro à 10 chiffres est considéré nord-américain (+1). */
export function telHref(phone: string) {
  const d = phone.replace(/\D/g, '');
  return `tel:+${d.length === 10 ? '1' + d : d}`;
}
export const smsHref = (phone: string) => telHref(phone).replace('tel:', 'sms:');
