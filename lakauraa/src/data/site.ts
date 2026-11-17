// Données fixes du site (textes de sections). Les contenus modifiables — projets, FAQ, services,
// témoignages, coordonnées, WhatsApp, réseaux — sont gérés dans l’admin (/admin) et stockés en base.

import { SITE, money, madShort } from '../config/site';

/** Prix d’un forfait depuis la configuration : montant + « CAD, avant taxes », ou « Sur devis ». */
const offerPrice = (key: keyof typeof SITE.prices) => {
  const p = SITE.prices[key];
  // Prix au Maroc (MAD) : affiché à côté du prix CAD seulement s'il est fixé dans la config (jamais converti)
  const mad = key in SITE.pricesMad ? madShort(key as keyof typeof SITE.pricesMad) : null;
  return p == null
    ? { price: 'Sur devis', unit: 'Devis gratuit, selon votre projet', mad }
    : { from: 'À partir de', price: money(p).replace(` ${SITE.currency}`, ''), unit: `${SITE.currency}, ${SITE.taxesNote}`, mad };
};

/** Alias historique : toutes les valeurs viennent de src/config/site.ts. */
export const site = {
  name: SITE.name,
  owner: SITE.owner,
  city: SITE.city,
  tagline: 'Sites web pour commerces locaux',
  description:
    "Lakauraa crée des sites web rapides, élégants et abordables pour les commerces de Montréal : salons, restos, garages, spas, photographes et travailleurs autonomes. Maquette gratuite avant de payer.",
  url: SITE.url,
  school: SITE.school,
  responseTime: SITE.responseTime,
  delay: SITE.delay,
};

export const nav = [
  { label: 'Accueil', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Réalisations', href: '/projets' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
];

export type Offer = {
  id: string;
  name: string;
  price: string;
  /** Petit texte au-dessus du prix (ex. « À partir de ») */
  from?: string;
  unit?: string;
  /** Prix au Maroc (« Dès … MAD »), seulement s'il est fixé dans la config */
  mad?: string | null;
  pitch: string;
  features: string[];
  featured?: boolean;
  cta: string;
};

export const offers: Offer[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    ...offerPrice('essentiel'),
    pitch: 'Une page complète pour être présent en ligne, sans complication.',
    features: [
      "Site d'une page, adapté au cellulaire",
      'Services, prix, heures et carte',
      "Bouton d'appel et liens réseaux sociaux",
      '2 séries de révisions',
    ],
    cta: 'Choisir Essentiel',
  },
  {
    id: 'pro',
    name: 'Pro',
    ...offerPrice('pro'),
    pitch: 'Pour se démarquer et attirer de nouveaux clients chaque semaine.',
    features: [
      "Jusqu'à 5 pages",
      'Galerie photos et avis clients',
      'Lien de réservation en ligne',
      'Référencement Google de base',
      'Fiche Google Business optimisée',
    ],
    featured: true,
    cta: 'Choisir Pro',
  },
  {
    id: 'entretien',
    name: 'Entretien',
    ...offerPrice('entretien'),
    pitch: "Je m'occupe de tout, vous vous occupez de vos clients.",
    features: [
      'Hébergement et nom de domaine',
      'Changements de prix, heures, photos',
      'Sauvegardes et sécurité',
      'Sans contrat, annulable en tout temps',
    ],
    cta: 'Ajouter l’entretien',
  },
];

export const problems = [
  {
    kind: 'google',
    title: 'Invisible sur Google',
    text: 'Vos futurs clients tapent « coiffeur Rosemont » ou « garage près de moi »… et tombent sur vos concurrents.',
  },
  {
    kind: 'facebook',
    title: 'Une page Facebook, ce n’est plus assez',
    text: 'Prix, heures, services : tout est éparpillé. Le client pose la question en message… ou va voir ailleurs.',
  },
  {
    kind: 'slow',
    title: 'Un vieux site qui fait fuir',
    text: 'Lent, illisible sur cellulaire, « non sécurisé » : en 5 secondes, le client a déjà fermé la page.',
  },
];

export const capabilities = [
  'Design sur mesure',
  'Adapté au cellulaire',
  'Référencement local',
  'Fiche Google Business',
  'Réservation en ligne',
  'Commande WhatsApp',
  'Hébergement',
  'Nom de domaine',
];

export const engagements = [
  {
    icon: 'eye',
    title: 'Maquette gratuite',
    text: 'Vous voyez votre site avant de payer quoi que ce soit. Il ne vous plaît pas ? Vous ne devez rien.',
  },
  {
    icon: 'user',
    title: 'Un seul interlocuteur',
    text: 'Vous parlez directement à la personne qui code votre site. Pas d’agence, pas d’intermédiaire.',
  },
  {
    icon: 'tag',
    title: 'Des prix clairs',
    text: 'Un prix de départ clair, un devis gratuit selon votre projet et une entente écrite. Aucune mauvaise surprise.',
  },
  {
    icon: 'split',
    title: 'Paiement en deux temps',
    text: `${SITE.depositPercent} % au départ, le reste seulement quand votre site est en ligne et qu’il vous plaît.`,
  },
  {
    icon: 'clock',
    title: 'En ligne en 1 à 2 semaines',
    text: 'Un échéancier simple, des étapes claires et des nouvelles régulières jusqu’à la mise en ligne.',
  },
  {
    icon: 'key',
    title: 'Le site vous appartient',
    text: 'Le nom de domaine et le contenu sont à vous, même si vous arrêtez l’entretien.',
  },
];

/** Chiffres affichés (À propos) : aucune statistique inventée. Le nombre de projets est calculé
 *  depuis les projets publiés (voir Stats.astro), les autres valeurs viennent de la configuration. */
export const stats = [
  { value: SITE.delay, label: 'pour mettre votre site en ligne' },
  { value: SITE.responseTime.replace('moins de ', '< '), label: 'pour recevoir une réponse' },
  { value: '0 $', label: 'pour voir votre maquette' },
];

export const process = [
  {
    title: 'On se parle',
    text: '15 minutes au téléphone ou en personne pour comprendre votre commerce, vos clients et vos objectifs.',
    meta: 'Jour 1',
  },
  {
    title: 'Maquette gratuite',
    text: 'Je vous montre une ébauche de votre site, sans engagement. Vous décidez ensuite.',
    meta: '2 à 4 jours',
  },
  {
    title: 'Ajustements',
    text: 'On peaufine ensemble les textes, les photos et les couleurs jusqu’à ce que ce soit parfait.',
    meta: 'Semaine 1–2',
  },
  {
    title: 'Mise en ligne',
    text: 'Votre site est en ligne, sur votre nom de domaine. Je vous montre comment le partager.',
    meta: 'Lancement',
  },
];

export const audiences = [
  'Salons de coiffure',
  'Barbiers',
  'Restaurants',
  'Traiteurs',
  'Garages',
  'Spas et massothérapie',
  'Esthétique et cils',
  'Salons d’ongles',
  'Toilettage',
  'Photographes',
  'Rénovation',
  'Événements',
];
