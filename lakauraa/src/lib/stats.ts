// Mesure des contacts : compteurs anonymes et agrégés (jour × action × page).
// Aucune donnée personnelle : ni cookie, ni adresse IP, ni identifiant, ni contenu de message.
import { and, desc, gte, sql } from 'drizzle-orm';
import { getDb, schema } from './db';

/** Actions mesurées. Un clic n'est PAS un contact reçu : la personne peut ne jamais envoyer son message. */
export const statEvents = {
  whatsapp_ma: 'Ouverture de WhatsApp (Maroc)',
  whatsapp_ca: 'Ouverture de WhatsApp (Canada)',
  call: 'Clic sur « appeler »',
  sms: 'Clic sur « texto »',
  email: 'Clic sur le courriel',
  cta_contact: 'Clic vers la page Contact',
  form_ready: 'Demande préparée dans le formulaire',
} as const;
export type StatEvent = keyof typeof statEvents;

export const isStatEvent = (e: unknown): e is StatEvent => typeof e === 'string' && Object.hasOwn(statEvents, e);

/** Page d'origine : chemin public simple uniquement (pas de paramètres, pas de liens d'avis personnels). */
export function cleanPath(p: unknown) {
  if (typeof p !== 'string' || p.length > 100 || !/^\/[a-z0-9\-/]*$/.test(p)) return null;
  if (p.startsWith('/admin') || p.startsWith('/api') || p.startsWith('/avis/')) return null;
  return p.length > 1 ? p.replace(/\/+$/, '') : p;
}

export async function recordStat(event: StatEvent, path: string) {
  const db = await getDb();
  const day = new Date().toISOString().slice(0, 10);
  await db
    .insert(schema.contactStats)
    .values({ day, event, path, count: 1 })
    .onConflictDoUpdate({
      target: [schema.contactStats.day, schema.contactStats.event, schema.contactStats.path],
      set: { count: sql`${schema.contactStats.count} + 1` },
    });
}

/** Résumé pour le tableau de bord : totaux par action et pages qui génèrent le plus d'actions de contact. */
export async function statSummary(days = 30) {
  const db = await getDb();
  const since = new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10);
  const where = and(gte(schema.contactStats.day, since));
  const total = sql<number>`sum(${schema.contactStats.count})::int`;
  const [byEvent, byPath] = await Promise.all([
    db.select({ event: schema.contactStats.event, n: total }).from(schema.contactStats).where(where).groupBy(schema.contactStats.event),
    db.select({ path: schema.contactStats.path, n: total }).from(schema.contactStats)
      .where(and(where, sql`${schema.contactStats.event} <> 'cta_contact'`))
      .groupBy(schema.contactStats.path).orderBy(desc(total)).limit(6),
  ]);
  const count = (e: StatEvent) => byEvent.find((x) => x.event === e)?.n ?? 0;
  return {
    days,
    rows: (Object.keys(statEvents) as StatEvent[]).map((e) => ({ event: e, label: statEvents[e], n: count(e) })),
    direct: count('whatsapp_ma') + count('whatsapp_ca') + count('call') + count('sms') + count('email'),
    topPages: byPath,
  };
}
