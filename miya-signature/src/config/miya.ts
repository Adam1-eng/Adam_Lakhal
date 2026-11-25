/**
 * ============================================================
 *  MIYA SIGNATURE : SOURCE DE VÉRITÉ UNIQUE
 * ============================================================
 *  Toutes les informations affichées sur le site viennent d'ici.
 *  Règle : on n'invente rien. Une info inconnue vaut `null`
 *  (ou un tableau vide) et le site la masque automatiquement.
 *
 *  Sources : Instagram @miya.signature et Acuity
 *  (https://miyasignature.as.me/), relevé du 24 nov. 2026.
 *  Prix en dollars canadiens, durées en minutes.
 * ============================================================
 */

// ------------------------------------------------------------
// 1. Statut du site
// ------------------------------------------------------------
export const status = {
  /** true = maquette : bandeau visible, noindex, robots.txt bloquant. */
  demo: true,
  demoBanner:
    "Maquette de démonstration préparée par Adam Lakhal. Ce n'est pas le site officiel de Miya Signature.",
};

// ------------------------------------------------------------
// 2. Identité et coordonnées
// ------------------------------------------------------------
export const identity = {
  /** Domaine supposé d'après le courriel (infos@miyasignature.com) : à confirmer. */
  siteUrl: 'https://miyasignature.com',
  name: 'Miya Signature',
  brand: 'Miya signature',
  firstName: 'Miya',
  role: 'Lash Master & Formatrice',
  bio: ['Extensions de cils', 'Lash Lift', 'Brow Lift', 'Tooth Gems'],
  yearsExperience: 5,
  email: 'infos@miyasignature.com',
  bookingUrl: 'https://miyasignature.as.me/',
  instagram: {
    handle: 'miya.signature',
    url: 'https://www.instagram.com/miya.signature/',
    dmUrl: 'https://ig.me/m/miya.signature',
    followers: 1535,
    followersDate: '2026-11-24',
  },
  location: {
    city: 'Laval',
    region: 'QC',
    regionName: 'Québec',
    country: 'CA',
    landmark: 'à 2 min du Centropolis',
    /** Adresse exacte inconnue : aucun plan d'accès tant que null. */
    streetAddress: null as string | null,
    postalCode: null as string | null,
  },
  /** Inconnu : masqué partout tant que null. */
  phone: null as string | null,
  /** Inconnu : masqué partout tant que vide. Ex. { day: 'Lundi', hours: '9 h à 17 h' } */
  hours: [] as { day: string; hours: string }[],
  timezone: 'America/Toronto',
};

// ------------------------------------------------------------
// 3. Médias (photos et vidéo fournies par Miya UNIQUEMENT)
//    Mettre le chemin d'un fichier placé dans /public/photos/.
//    Tant que c'est null, le site affiche une illustration.
// ------------------------------------------------------------
export const media = {
  heroPhoto: null as string | null,
  portrait: null as string | null,
  studioPhoto: null as string | null,
  /** Vidéo de présentation « I'm Miya » (mp4 dans /public/videos/). */
  introVideo: null as string | null,
  introVideoPoster: null as string | null,
  logo: null as string | null,
};

// ------------------------------------------------------------
// 4. Services et prix (Acuity, 24 nov. 2026)
// ------------------------------------------------------------
export type Service = {
  name: string;
  minutes: number;
  price: number;
  notes?: string[];
  featured?: boolean;
};

export type ServiceCategory = {
  id: string;
  title: string;
  subtitle?: string;
  isNew?: boolean;
  intro?: string;
  conditions?: string[];
  services: Service[];
};

export const services: ServiceCategory[] = [
  {
    id: 'soft-touch',
    title: 'Soft Touch',
    subtitle: 'Demi-pose',
    isNew: true,
    intro:
      '50 % des cils couverts, effet naturel, pour celles qui sont pressées. Remplissages plus rapprochés (1 à 2 semaines max).',
    services: [
      { name: 'Soft Touch – Demi pose', minutes: 90, price: 80 },
      { name: 'Soft Touch – Remplissage 1 semaine', minutes: 35, price: 35, notes: ['Refresh express'] },
      {
        name: 'Soft Touch – Remplissage 2 semaines',
        minutes: 50,
        price: 50,
        notes: ['Après 2 semaines : pose complète obligatoire'],
      },
    ],
  },
  {
    id: 'signature-lash-sets',
    title: 'Signature Lash Sets',
    subtitle: 'Poses complètes',
    services: [
      { name: 'Cil à cil – Classic', minutes: 120, price: 110, notes: ['Effet mascara ou naturel'] },
      { name: 'Lash Addict – Hybride', minutes: 120, price: 110, notes: ['Effet mascara ou naturel'] },
      { name: 'Drama Queen – Volume', minutes: 150, price: 120 },
      {
        name: 'Wet look – Wispy wet look',
        minutes: 150,
        price: 130,
        notes: ['Le look iconique de Miya'],
        featured: true,
      },
      { name: 'Wispy volume', minutes: 150, price: 130 },
      { name: 'Mega volume', minutes: 180, price: 150, notes: ['Effet mascara ou naturel'] },
    ],
  },
  {
    id: 'remplissages',
    title: 'Remplissages',
    conditions: [
      'Minimum 50 % des extensions restantes, sinon pose complète',
      'Pas de caféine 2 h avant',
      'Venir démaquillée',
    ],
    services: [
      { name: 'Remplissage 1 semaine', minutes: 60, price: 40 },
      { name: 'Remplissage 2 semaines', minutes: 75, price: 65 },
      { name: 'Remplissage 3 semaines', minutes: 75, price: 80 },
      { name: 'Almost New Set (4 semaines)', minutes: 90, price: 100 },
    ],
  },
  {
    id: 'depose',
    title: 'Dépose et remplissage d’ailleurs',
    services: [
      { name: 'Dépose – Removal', minutes: 45, price: 35 },
      { name: 'Remplissage d’ailleurs (foreign fill)', minutes: 90, price: 90 },
    ],
  },
  {
    id: 'lift',
    title: 'Lash lift et Brow lift',
    services: [
      { name: 'Brow lift', minutes: 60, price: 80, notes: ['Tient jusqu’à 6 semaines'] },
      { name: 'Lash lift', minutes: 60, price: 80, notes: ['Tient jusqu’à 6 semaines'] },
      { name: 'Combo Lash lift + Brow lamination', minutes: 90, price: 140 },
    ],
  },
  {
    id: 'sourire',
    title: 'Tooth Gems et sourire',
    services: [
      {
        name: 'Swarovski crystal (tooth gem)',
        minutes: 30,
        price: 50,
        notes: [
          '1 cristal ; 10 $ chaque cristal supplémentaire',
          'À retirer par un professionnel dentaire : Miya ne les retire pas',
        ],
      },
      { name: 'Design – Butterfly (tooth gem)', minutes: 30, price: 80 },
      // Acuity : nom « 1H », durée affichée 1 h 30. On affiche la durée Acuity (à confirmer avec Miya).
      { name: 'Blanchiment dentaire', minutes: 90, price: 100 },
    ],
  },
];

// ------------------------------------------------------------
// 5. Styles (galerie)
// ------------------------------------------------------------
export type LashShape = 'natural' | 'doll' | 'cat';
export type LashArtKind = 'lashes' | 'lift' | 'brow' | 'gem';

export type Style = {
  name: string;
  description: string;
  eye?: string;
  curls?: string[];
  lengths?: string;
  durations?: string[];
  /** Chemin d'une photo fournie par Miya (/public/photos/...). null = illustration. */
  photo: string | null;
  art: {
    kind: LashArtKind;
    shape?: LashShape;
    density?: 1 | 2 | 3 | 4;
    wet?: boolean;
    spiky?: boolean;
    wispy?: boolean;
    textured?: boolean;
    short?: boolean;
    color?: 'black' | 'brown' | 'burgundy' | 'red';
  };
};

export type StyleGroup = { id: string; title: string; styles: Style[] };

export const styleGroups: StyleGroup[] = [
  {
    id: 'techniques',
    title: 'Les techniques',
    styles: [
      {
        name: 'Classique',
        description: 'Une extension posée sur chaque cil naturel.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 1 },
      },
      {
        name: 'Hybride',
        description: 'Un mélange de cil à cil et de volume.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 2 },
      },
      {
        name: 'Volume',
        description: 'De petits bouquets légers sur chaque cil, pour plus de densité.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 3 },
      },
      {
        name: 'Light volume',
        description: 'Un volume tout en légèreté.',
        eye: 'Doll eye',
        lengths: '8–14 mm',
        curls: ['C'],
        durations: ['Pose : 2 h', 'Remplissage : 1 h 30'],
        photo: null,
        art: { kind: 'lashes', shape: 'doll', density: 2 },
      },
      {
        name: 'Wispy volume',
        description: 'Des pointes plus longues réparties dans la pose, pour un effet aérien.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 3, wispy: true },
      },
      {
        name: 'Mega volume',
        description: 'Les bouquets les plus fournis, pour un regard intense.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 4 },
      },
      {
        name: 'Short mega volume',
        description: 'Toute la densité du mega volume, en version courte.',
        eye: 'Cat eye',
        lengths: '8–13 mm',
        photo: null,
        art: { kind: 'lashes', shape: 'cat', density: 4, short: true },
      },
    ],
  },
  {
    id: 'effets',
    title: 'Les effets',
    styles: [
      {
        name: 'Wet look / Wet set',
        description: 'Des pointes fines et définies, comme des cils tout juste mouillés. Le look iconique de Miya.',
        eye: 'Doll eye',
        lengths: '9–13 mm',
        curls: ['M'],
        durations: ['Pose : 2 h 30'],
        photo: null,
        art: { kind: 'lashes', shape: 'doll', density: 3, wet: true },
      },
      {
        name: 'Short wet look',
        description: 'Le wet look en version courte et étirée.',
        eye: 'Cat eye',
        lengths: '7–11 mm',
        curls: ['C', 'CC'],
        photo: null,
        art: { kind: 'lashes', shape: 'cat', density: 3, wet: true, short: true },
      },
      {
        name: 'Doll eye',
        description: 'Les cils les plus longs au centre, pour un regard grand ouvert.',
        photo: null,
        art: { kind: 'lashes', shape: 'doll', density: 2 },
      },
      {
        name: 'Cat eye',
        description: 'Les cils s’allongent vers le coin externe, pour un regard étiré.',
        photo: null,
        art: { kind: 'lashes', shape: 'cat', density: 2 },
      },
      {
        name: 'Textured cat eye',
        description: 'Un cat eye aux longueurs alternées, pour plus de relief.',
        photo: null,
        art: { kind: 'lashes', shape: 'cat', density: 3, textured: true },
      },
      {
        name: 'Spiky',
        description: 'Des pointes bien définies réparties sur toute la pose.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 2, spiky: true },
      },
    ],
  },
  {
    id: 'couleurs',
    title: 'Les couleurs',
    styles: [
      {
        name: 'Brown lashes',
        description: 'Des extensions brunes, pour un rendu plus doux.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 2, color: 'brown' },
      },
      {
        name: 'Brown light volume',
        description: 'Le light volume en brun, étiré vers l’extérieur.',
        eye: 'Cat eye',
        lengths: '9–14 mm',
        curls: ['CC'],
        photo: null,
        art: { kind: 'lashes', shape: 'cat', density: 2, color: 'brown' },
      },
      {
        name: 'Burgundy spiky',
        description: 'Des pointes définies teintées bourgogne.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 2, spiky: true, color: 'burgundy' },
      },
      {
        name: 'Red lashes',
        description: 'Une touche de rouge pour oser la couleur.',
        photo: null,
        art: { kind: 'lashes', shape: 'natural', density: 2, color: 'red' },
      },
    ],
  },
  {
    id: 'lift-sourire',
    title: 'Lift et sourire',
    styles: [
      {
        name: 'Lash Lift',
        description: 'Tes cils naturels, rehaussés et recourbés.',
        photo: null,
        art: { kind: 'lift' },
      },
      {
        name: 'Brow Lift & tint',
        description: 'Des sourcils disciplinés, structurés et teintés.',
        photo: null,
        art: { kind: 'brow' },
      },
      {
        name: 'Tooth Gems',
        description: 'Cristaux Swarovski et design papillon.',
        photo: null,
        art: { kind: 'gem' },
      },
    ],
  },
];

// ------------------------------------------------------------
// 6. Politique de rendez-vous : TEXTE OFFICIEL, MOT POUR MOT.
//    Ne rien reformuler (délais, frais, montants).
// ------------------------------------------------------------
export const policy = {
  intro:
    'Chez Miya signature, chaque rendez-vous est un engagement sérieux. Pour garantir une expérience respectueuse, professionnelle et équitable, voici les conditions applicables à toutes les réservations : xoxo',
  sections: [
    {
      title: 'Réservations',
      items: [
        "Nouveauté : aucun frais de réservation n'est requis. Toutefois, une carte de crédit est obligatoire pour garantir la réservation.",
      ],
    },
    {
      title: 'Annulations',
      items: [
        'Les annulations sont uniquement permises dans les 48 h suivant la prise de rendez-vous, avec des frais de transaction de 5 $ retenus.',
        'Toute annulation effectuée après les 48 h suivant la réservation, peu importe le motif ou le délai, entraîne le prélèvement automatique du montant total du service sur la carte enregistrée.',
      ],
    },
    {
      title: 'Déplacements (changement de date)',
      items: [
        "Il est possible de déplacer un rendez-vous une seule fois, en respectant un préavis d'au moins 48 h avant l'heure du rendez-vous.",
        'Tout déplacement demandé à moins de 48 h est considéré comme une annulation tardive et le montant total sera prélevé.',
      ],
    },
    {
      title: 'Absences',
      items: [
        'Une absence sans avis ou un oubli du rendez-vous est considéré comme une annulation tardive.',
        'Le montant total du service sera automatiquement débité.',
      ],
    },
    {
      title: 'Retards',
      items: ["Le service débute à l'heure prévue. Tout retard réduit le temps du service équivalent au retard."],
    },
  ],
  closingTitle: 'Respect et engagement',
  closing:
    "Miya signature s'engage à vous offrir une expérience de qualité, dans un cadre professionnel et bienveillant. En retour, je demande un respect total de mon temps, de mes règles et de mes engagements. Merci pour votre compréhension. xoxo",
  /**
   * Résumé affiché avant chaque bouton « Réserver ».
   * Ce sont des phrases EXTRAITES TELLES QUELLES de la politique ci-dessus
   * (vérifié par les tests) : aucune reformulation.
   */
  summary: [
    "Nouveauté : aucun frais de réservation n'est requis. Toutefois, une carte de crédit est obligatoire pour garantir la réservation.",
    'Les annulations sont uniquement permises dans les 48 h suivant la prise de rendez-vous, avec des frais de transaction de 5 $ retenus.',
    "Il est possible de déplacer un rendez-vous une seule fois, en respectant un préavis d'au moins 48 h avant l'heure du rendez-vous.",
    'Une absence sans avis ou un oubli du rendez-vous est considéré comme une annulation tardive.',
  ],
};

// ------------------------------------------------------------
// 7. Formations
// ------------------------------------------------------------
export const trainings = {
  pitch:
    'Le marché de la beauté explose. En 2026, les clientes chercheront toujours la rapidité, le confort et une mise en beauté durable.',
  location: 'Près du Centropolis, Laval',
  lashBoss: {
    name: 'Formation Lash Boss',
    days: 3,
    price: 1200,
    program: [
      {
        day: 'Jour 1',
        title: 'Théorie et pratique Classique',
        topics: ['Bases', 'Anatomie du cil', 'Isolation parfaite', 'Pose précise', 'Symétrie', 'Mapping personnalisé'],
      },
      {
        day: 'Jour 2',
        title: 'Hybride, Volume et Mega volume',
        topics: ['Mappings', 'Bouquets équilibrés', 'Rétention optimale'],
      },
      {
        day: 'Jour 3',
        title: 'Pratique sur modèle et Business',
        topics: ['Évaluation', 'Prix stratégiques', 'Attirer des clientes fidèles'],
      },
    ],
    included: [
      'Manuel détaillé',
      'Examen théorique et pratique',
      'Certification',
      'Suivi continu après la formation',
      'Kit professionnel complet',
    ],
    seats: 'Places limitées : écris-moi en DM sur Instagram pour connaître les dates.',
    /** Dates inconnues : la section « Prochaines dates » est masquée tant que vide. */
    nextDates: [] as string[],
  },
  refresher: {
    name: 'Refresher Training',
    subtitle: 'Perfectionnement',
    text: 'Pour reprendre tes bases ou corriger un point précis. Toutes les infos en DM.',
  },
};

// ------------------------------------------------------------
// 8. Avis clientes : UNIQUEMENT de vrais avis fournis par Miya.
//    Tableau vide = aucune section « Avis » sur le site.
// ------------------------------------------------------------
export const reviews: { author: string; text: string; service?: string }[] = [];

// ------------------------------------------------------------
// 9. Boutique : masquée tant que Miya n'a pas confirmé.
// ------------------------------------------------------------
export const shop = {
  enabled: false,
  tagline: 'Shoppe tes essentiels',
  products: [
    { name: 'Palettes Miya Signature JetBlack', price: 19.75 },
    { name: 'Pince de précision', price: 24.99 },
  ],
};

// ------------------------------------------------------------
// 10. Légal (Québec, Loi 25). Inconnu = masqué.
// ------------------------------------------------------------
export const legal = {
  /** Nom légal de l'entreprise ou de la propriétaire : inconnu. */
  legalName: null as string | null,
  /** Numéro d'entreprise du Québec (NEQ) : inconnu. */
  neq: null as string | null,
  /** Hébergeur du site : connu seulement une fois le site mis en ligne. */
  host: null as { name: string; address: string } | null,
  /** Responsable de la protection des renseignements personnels (Loi 25). */
  privacyOfficer: null as string | null,
  lastUpdated: '2026-11-25',
};
