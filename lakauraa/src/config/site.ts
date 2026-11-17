// ════════════════════════════════════════════════════════════════════════════
//  SOURCE UNIQUE DE VÉRITÉ DU SITE LAKAURAA
//  Toute valeur affichée publiquement (prix, acompte, délai, courriel, domaine…)
//  doit venir d’ici. Aucune page ne doit réécrire ces chiffres en dur.
//
//  Règle : on n’invente rien. Une information inconnue reste vide ('') et la
//  partie du site qui en dépend est masquée proprement (jamais « [À compléter] »).
// ════════════════════════════════════════════════════════════════════════════

export const SITE = {
  /* ---------- Entreprise ---------- */
  name: 'Lakauraa',
  owner: 'Adam Lakhal',
  city: 'Montréal',
  school: 'Cégep du Vieux Montréal',

  /* ---------- Domaine ----------
     Adresse publique du site (canoniques, Open Graph, sitemap, robots).
     Le jour où un domaine propre est branché dans Vercel, changer UNIQUEMENT cette ligne.
     Domaine lakauraa.com acheté le 17/11/2026 (Vercel) et branché sur le projet. */
  url: 'https://lakauraa.com',
  /** Anciennes adresses : redirigées en permanence (301) vers `url`, même chemin. */
  oldHosts: ['lakauraa.vercel.app', 'lakauraa-v3.vercel.app'] as readonly string[],

  /* ---------- Coordonnées ----------
     Courriel public : vide = tous les liens « courriel » sont masqués sur le site.
     info@lakauraa.com : redirection ImprovMX → Gmail (enregistrements MX/SPF dans le DNS Vercel).
     Le courriel personnel n’est volontairement JAMAIS affiché. */
  publicEmail: 'info@lakauraa.com',
  phone: '438-528-0259',
  /** WhatsApp, format international, chiffres seulement. Modifiables aussi dans l’admin. */
  whatsapp: { ma: '212621971718', ca: '14385280259' },
  /** Réseaux sociaux par défaut (modifiables dans l’admin). */
  socials: { instagram: '', tiktok: '', linkedin: '', github: '', facebook: '', youtube: '' },

  /* ---------- Engagements commerciaux ---------- */
  /** Délai de réponse promis (une seule promesse sur tout le site). */
  responseTime: 'moins de 24 h',
  /** Délai de mise en ligne d’un site vitrine. */
  delay: '1 à 2 semaines',
  /** Acompte demandé à la signature (en %). Le solde est payé à la mise en ligne. */
  depositPercent: 40,

  /* ---------- Prix ----------
     null = « sur devis » (aucun prix inventé). Montants en devise `currency`, avant taxes. */
  currency: 'CAD',
  currencySymbol: '$',
  taxesNote: 'avant taxes',
  prices: {
    essentiel: 600 as number | null,
    pro: null as number | null,
    entretien: null as number | null,
  },

  /* ---------- Photo du propriétaire ----------
     Chemin d’une vraie photo (ex. '/adam.jpg' dans /public). Vide = monogramme « AL ». */
  ownerPhoto: '',
} as const;

/* ---------- Formats réutilisables (jamais de texte de prix écrit ailleurs) ---------- */
export const money = (n: number) => `${n.toLocaleString('fr-CA')} ${SITE.currencySymbol} ${SITE.currency}`;
/** « À partir de 600 $ CAD, avant taxes » ou « Sur devis ». */
export const priceLabel = (key: keyof typeof SITE.prices) => {
  const p = SITE.prices[key];
  return p == null ? 'Sur devis' : `À partir de ${money(p)}, ${SITE.taxesNote}`;
};
/** Version courte : « Dès 600 $ CAD » ou « Sur devis ». */
export const priceShort = (key: keyof typeof SITE.prices) => {
  const p = SITE.prices[key];
  return p == null ? 'Sur devis' : `Dès ${money(p)}`;
};
/** Prix d’entrée le plus bas affiché (pour les résumés). */
export const entryPrice = () => {
  const list = Object.values(SITE.prices).filter((p): p is number => p != null);
  return list.length ? Math.min(...list) : null;
};
export const depositText = () => `${SITE.depositPercent} % au départ, le solde à la mise en ligne`;

/** Prix affiché pour un service (identifiants des services de l’admin). */
export const servicePrice = (serviceId: string) => {
  const map: Record<string, keyof typeof SITE.prices> = { vitrine: 'essentiel', pro: 'pro', entretien: 'entretien' };
  const key = map[serviceId];
  return key ? priceShort(key) : 'Sur devis';
};

/** Harmonise les textes saisis dans l’admin (FAQ) avec la configuration :
 *  acompte, délai de réponse et devise toujours identiques à ceux du reste du site. */
export const harmonize = (text: string) =>
  text
    .replace(/\b\d{1,2}\s?%(\s)(au départ|à la signature)/g, `${SITE.depositPercent} %$1$2`)
    .replace(/en moins de \d+\s?(h\b|heures?)/g, `en ${SITE.responseTime}`)
    .replace(/(\d[\d\u202f\u00a0 ]*)\s?\$(?!\s?CAD)/g, `$1 $ ${SITE.currency}`);
