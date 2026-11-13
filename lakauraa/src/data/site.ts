// Informations authentiques de la marque. Une seule source de vérité pour tout le site.

export const site = {
  name: 'Lakauraa',
  owner: 'Adam Lakhal',
  city: 'Montréal',
  tagline: 'Sites web pour commerces locaux',
  description:
    "Lakauraa crée des sites web rapides, élégants et abordables pour les commerces de Montréal : salons, restos, garages, spas, photographes et travailleurs autonomes. Maquette gratuite avant de payer.",
  url: 'https://adam-lakhal-web.vercel.app',
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
    price: '1 200 $',
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
    price: '40 $',
    unit: '/ mois',
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

export type Service = {
  id: string;
  title: string;
  text: string;
  price: string;
  points: string[];
  icon: 'page' | 'pages' | 'shop' | 'care';
};

export const services: Service[] = [
  {
    id: 'vitrine',
    title: 'Site vitrine une page',
    text: 'Tout ce qu’un client veut savoir, au même endroit : services, prix, heures, photos et un bouton pour vous appeler.',
    price: 'Dès 600 $',
    points: ['Prêt en 1 à 2 semaines', 'Parfait sur cellulaire', 'Bouton appel et itinéraire'],
    icon: 'page',
  },
  {
    id: 'pro',
    title: 'Site complet multi-pages',
    text: 'Pour les commerces qui veulent être trouvés sur Google et convaincre : galerie, avis, réservation en ligne.',
    price: '1 200 $',
    points: ['Jusqu’à 5 pages', 'Référencement local', 'Fiche Google Business'],
    icon: 'pages',
  },
  {
    id: 'boutique',
    title: 'Boutique en ligne sur mesure',
    text: 'Catalogue, panier, espace administrateur, commande sur WhatsApp : conçue autour de la façon dont vos clients achètent.',
    price: 'Sur soumission',
    points: ['Catalogue et recherche', 'Espace admin simple', 'Paiement adapté à vos clients'],
    icon: 'shop',
  },
  {
    id: 'entretien',
    title: 'Entretien et mises à jour',
    text: 'Un texto suffit : je change vos prix, vos heures ou vos photos. Hébergement, sauvegardes et sécurité inclus.',
    price: '40 $ / mois',
    points: ['Sans contrat', 'Hébergement inclus', 'Changements rapides'],
    icon: 'care',
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
    text: 'Des forfaits affichés, une soumission gratuite et une entente écrite. Aucune mauvaise surprise.',
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

export const faq = [
  {
    q: 'Combien coûte un site web ?',
    a: 'Le forfait Essentiel (une page) est à 600 $ et le forfait Pro (jusqu’à 5 pages) à 1 200 $, avant taxes. Une boutique en ligne se fait sur soumission. La soumission est gratuite.',
  },
  {
    q: 'Combien de temps ça prend ?',
    a: 'Entre une et deux semaines en général, selon la rapidité à recevoir vos textes et vos photos.',
  },
  {
    q: 'Et si la maquette ne me plaît pas ?',
    a: 'La maquette est gratuite et sans engagement. Si elle ne vous convient pas, vous ne payez rien. Sinon, on l’ajuste ensemble.',
  },
  {
    q: 'Je n’ai pas de photos ni de textes. C’est un problème ?',
    a: 'Non. Je peux rédiger les textes avec vous et utiliser vos photos Facebook ou Instagram, avec votre accord.',
  },
  {
    q: 'Comment se passe le paiement ?',
    a: 'En deux temps : 40 % au départ, le reste à la mise en ligne. Chaque projet est encadré par une entente écrite.',
  },
  {
    q: 'Est-ce que je pourrai modifier mon site moi-même ?',
    a: 'Avec le forfait Entretien, vous m’envoyez un texto et je fais les changements. Si vous préférez gérer vous-même, on peut choisir une solution facile à modifier.',
  },
  {
    q: 'Le site m’appartient-il ?',
    a: 'Oui. Le nom de domaine et le contenu sont à vous, même si vous arrêtez l’entretien.',
  },
  {
    q: 'Vous êtes étudiant : est-ce sérieux ?',
    a: `Oui. J’étudie en développement web au ${site.school}, ce qui me permet d’offrir des prix accessibles. Vous voyez la maquette avant de payer quoi que ce soit, et chaque projet fait l’objet d’une entente écrite.`,
  },
  {
    q: 'Travaillez-vous seulement à Montréal ?',
    a: 'Je suis basé à Montréal et je peux vous rencontrer en personne, mais je travaille aussi à distance : ma boutique AutoRefaatArt a été réalisée pour un commerce au Maroc.',
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

// Témoignages : à remplir UNIQUEMENT avec de vrais avis clients.
// Tant que la liste est vide, la section ne s'affiche pas.
export const testimonials: { quote: string; name: string; business: string }[] = [];
