// ════════════════════════════════════════════════════════════════════════════
//  SOURCE UNIQUE DE VÉRITÉ DU SITE LAKAURAA
//  Toute valeur affichée publiquement (prix, acompte, délai, courriel, domaine…)
//  doit venir d’ici. Aucune page ne doit réécrire ces chiffres en dur.
//
//  Règle : on n’invente rien. Une information inconnue reste vide ('') et la
//  partie du site qui en dépend est masquée proprement (jamais « [À compléter] »).
// ════════════════════════════════════════════════════════════════════════════

/** Témoignage réel fourni par le propriétaire (aucun texte inventé). */
export type Testimonial = { name: string; business?: string; text: string; rating?: number; projectSlug?: string };

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

  /* ---------- Google Search Console ----------
     Codes fournis par Google (jamais inventés). Remplir UN des deux, puis redéployer :
     - meta : le texte entre les guillemets de content="…" de la balise <meta name="google-site-verification">
     - file : le nom du fichier proposé par Google, ex. 'google1234abcd5678.html'
     (Méthode recommandée : propriété « Domaine » validée par un enregistrement TXT dans le DNS Vercel.) */
  googleVerification: {
    meta: '', // ← À FOURNIR (Search Console → Balise HTML)
    file: '', // ← À FOURNIR (Search Console → Fichier HTML)
  },

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

  /* ---------- Prix au Maroc (MAD) ----------
     Prix « à partir de » en dirhams, fixés par le propriétaire (JAMAIS convertis automatiquement).
     null = « tarif au Maroc confirmé en MAD dans le devis ». */
  pricesMad: {
    essentiel: null as number | null, // ← À FOURNIR : prix de départ Essentiel en MAD
    pro: null as number | null,
    entretien: null as number | null,
  },

  /* ---------- Photo du propriétaire ----------
     Chemin d’une vraie photo déposée dans /public (ex. '/adam-lakhal.jpg'), idéalement carrée.
     Vide = monogramme « AL ». Ne jamais mettre de photo de banque d’images ni d’avatar généré. */
  ownerPhoto: '/adam-lakhal.webp', // vraie photo du fondateur (fournie le 17/11/2026, 352×352, sans métadonnées)

  /* ---------- Témoignages fournis par le propriétaire ----------
     Texte EXACT d’un vrai client, avec son accord. Vide = section « Témoignages » masquée.
     (Les avis laissés par les clients via le lien personnel de l’admin s’y ajoutent automatiquement.)
     Format : { name: 'Prénom Nom', business: 'Entreprise', text: '…', rating: 5 } (rating facultatif, 1 à 5). */
  testimonials: [] as Testimonial[], // ← À FOURNIR : témoignages réels
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
    .replace(/(\d(?:[\d\u202f\u00a0 ]*\d)?)\s?\$(?!\s?CAD)/g, `$1 $ ${SITE.currency}`);

/** Prix au Maroc pour un forfait : « Dès 3 000 MAD » ou null (= confirmé dans le devis). */
export const madShort = (key: keyof typeof SITE.pricesMad) => {
  const p = SITE.pricesMad[key];
  return p == null ? null : `Dès ${p.toLocaleString('fr-CA')} MAD`;
};
/** Phrase unique sur la devise au Maroc, reprise par la FAQ, les tarifs et les conditions de vente. */
export const madNote = () => {
  const p = SITE.pricesMad.essentiel;
  return p == null
    ? 'Au Maroc : tarif confirmé en dirhams (MAD) dans votre devis.'
    : `Au Maroc : à partir de ${p.toLocaleString('fr-CA')} MAD pour l’Essentiel ; le montant exact est confirmé dans votre devis.`;
};
