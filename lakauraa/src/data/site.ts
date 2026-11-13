// Données fixes du site (textes de sections). Les contenus modifiables — projets, FAQ, services,
// témoignages, coordonnées, WhatsApp, réseaux — sont gérés dans l’admin (/admin) et stockés en base.

export const site = {
  name: 'Lakauraa',
  owner: 'Adam Lakhal',
  city: 'Montréal',
  tagline: 'Sites web pour commerces locaux',
  description:
    "Lakauraa crée des sites web rapides, élégants et abordables pour les commerces de Montréal : salons, restos, garages, spas, photographes et travailleurs autonomes. Maquette gratuite avant de payer.",
  url: 'https://lakauraa.vercel.app',
  phone: '438-528-0259',
  phoneHref: 'tel:+14385280259',
  smsHref: 'sms:+14385280259',
  email: 'adamlakhal800@gmail.com',
  school: 'Cégep du Vieux Montréal',
  responseTime: 'moins de 24 h',
  delay: '1 à 2 semaines',
  maquettesCount: 48,
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
  pitch: string;
  features: string[];
  featured?: boolean;
  cta: string;
};

export const offers: Offer[] = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    from: 'À partir de',
    price: '600 $',
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
    price: 'Sur devis',
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
    price: 'Sur devis',
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
    text: '40 % au départ, le reste seulement quand votre site est en ligne et qu’il vous plaît.',
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

export const stats = [
  { value: 48, suffix: '', label: 'maquettes réalisées pour des commerces' },
  { value: 2, prefix: '1–', suffix: ' sem.', label: 'pour mettre votre site en ligne' },
  { value: 24, prefix: '< ', suffix: ' h', label: 'pour recevoir une réponse' },
  { value: 0, suffix: ' $', label: 'pour voir votre maquette' },
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
