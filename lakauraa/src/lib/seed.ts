// Contenu de départ : uniquement des informations authentiques déjà présentes sur l’ancien site.
import { count, eq } from 'drizzle-orm';
import { getDb, schema } from './db';
import { processImage } from './images';
import { defaultSettings } from './content';
import type { ImageVariant, ProjectKind } from './db/schema';

type Loader = (file: string) => Promise<Buffer>; // file = nom dans public/seed/

export const seedCategories = [
  { slug: 'sites-vitrines', name: 'Sites vitrines', description: 'Sites d’une ou plusieurs pages pour présenter un commerce et faire appeler les clients.' },
  { slug: 'e-commerce', name: 'Sites e-commerce', description: 'Boutiques en ligne : catalogue, panier, commande et gestion des produits.' },
  { slug: 'applications-web', name: 'Applications web', description: 'Outils et plateformes sur mesure accessibles depuis un navigateur.' },
  { slug: 'applications-mobiles', name: 'Applications mobiles', description: 'Applications pour iPhone et Android.' },
  { slug: 'autres', name: 'Autres réalisations', description: 'Projets qui ne rentrent dans aucune autre catégorie.' },
];

export const seedServices = [
  { id: 'vitrine', title: 'Site vitrine une page', text: 'Tout ce qu’un client veut savoir, au même endroit : services, prix, heures, photos et un bouton pour vous appeler.', price: 'À partir de 600 $', points: ['Prêt en 1 à 2 semaines', 'Parfait sur cellulaire', 'Bouton appel et itinéraire'] },
  { id: 'pro', title: 'Site complet multi-pages', text: 'Pour les commerces qui veulent être trouvés sur Google et convaincre : galerie, avis, réservation en ligne.', price: 'Sur devis', points: ['Jusqu’à 5 pages', 'Référencement local', 'Fiche Google Business'] },
  { id: 'boutique', title: 'Boutique en ligne sur mesure', text: 'Catalogue, panier, espace administrateur, commande sur WhatsApp : conçue autour de la façon dont vos clients achètent.', price: 'Sur devis', points: ['Catalogue et recherche', 'Espace admin simple', 'Paiement adapté à vos clients'] },
  { id: 'entretien', title: 'Entretien et mises à jour', text: 'Un message suffit : je change vos prix, vos heures ou vos photos. Hébergement, sauvegardes et sécurité inclus.', price: 'Sur devis', points: ['Sans contrat', 'Hébergement inclus', 'Changements rapides'] },
];

export const seedFaqs = [
  { question: 'Combien coûte la création d’un site web ?', answer: 'Les sites web commencent à partir de 600 $ (avant taxes) pour une page complète. Pour un site plus grand, une boutique en ligne ou une application, le prix dépend du travail demandé : je vous prépare un devis gratuit et détaillé. La maquette est toujours gratuite.' },
  { question: 'Combien de temps prend le développement ?', answer: 'Pour un site vitrine, comptez une à deux semaines, selon la rapidité à recevoir vos textes et vos photos. Pour une boutique en ligne ou une application, je vous donne un échéancier précis dans le devis, étape par étape.' },
  { question: 'Proposez-vous des sites e-commerce ?', answer: 'Oui. J’ai notamment réalisé AutoRefaatArt, une boutique de pièces auto avec catalogue, recherche, panier, espace administrateur et commande envoyée sur WhatsApp avec paiement à la livraison. Le parcours d’achat est pensé selon la façon dont vos clients paient réellement.' },
  { question: 'Développez-vous des applications mobiles ?', answer: 'Je me concentre sur les sites et les applications web, tous conçus d’abord pour le cellulaire : la plupart des commerces n’ont pas besoin d’une application à télécharger. Si votre projet en demande vraiment une, parlons-en : je vous dirai honnêtement quelle option est la plus adaptée à votre budget.' },
  { question: 'Est-ce que mon site sera adapté aux téléphones ?', answer: 'Oui, toujours. Chaque site est conçu d’abord pour le cellulaire puis adapté à la tablette et à l’ordinateur, avec des boutons d’appel et de contact faciles à toucher et un chargement rapide.' },
  { question: 'Proposez-vous la maintenance après la livraison ?', answer: 'Oui, avec le forfait Entretien (sur devis), sans contrat : hébergement, nom de domaine, sauvegardes, sécurité et changements de prix, d’heures ou de photos sur simple message. Vous pouvez l’annuler en tout temps.' },
  { question: 'Comment se déroulent le paiement et la collaboration ?', answer: 'On se parle 15 minutes, je vous prépare une maquette gratuite, puis on signe une entente écrite. Le paiement se fait en deux temps : 40 % au départ, le reste à la mise en ligne. Vous avez un seul interlocuteur, joignable par téléphone, WhatsApp ou courriel.' },
  { question: 'Travaillez-vous avec des clients au Maroc et au Canada ?', answer: 'Oui. Je suis basé à Montréal et je peux rencontrer les clients d’ici en personne. Je travaille aussi à distance : ma boutique AutoRefaatArt a été réalisée pour un commerce de Zemamra, au Maroc. Les échanges se font facilement par WhatsApp et en visioconférence.' },
  { question: 'Et si la maquette ne me plaît pas ?', answer: 'La maquette est gratuite et sans engagement. Si elle ne vous convient pas, vous ne payez rien. Sinon, on l’ajuste ensemble avant de commencer.' },
  { question: 'Je n’ai pas de photos ni de textes. Est-ce un problème ?', answer: 'Non. Je peux rédiger les textes avec vous et utiliser vos photos Facebook ou Instagram, avec votre accord.' },
  { question: 'Le site m’appartient-il ?', answer: 'Oui. Le nom de domaine et le contenu sont à vous, même si vous arrêtez l’entretien.' },
  { question: 'Vous êtes étudiant : est-ce sérieux ?', answer: 'Oui. J’étudie en développement web au Cégep du Vieux Montréal, ce qui me permet d’offrir des prix accessibles. Vous voyez la maquette avant de payer quoi que ce soit, et chaque projet fait l’objet d’une entente écrite.' },
];

type SeedImage = { file: string; variant: ImageVariant; caption: string; cover?: boolean };
type SeedProject = {
  slug: string; title: string; client?: string; category: string; kind: ProjectKind; location: string;
  summary: string; body?: string; challenge?: string; solution?: string; features?: { title: string; text: string }[];
  technologies: string[]; completedOn: string; liveUrl: string; videoUrl?: string; videoPoster?: string; featured: boolean; images: SeedImage[];
};

const maquette = (slug: string, title: string, sector: string, place: string, featured: boolean): SeedProject => ({
  slug: `maquette-${slug}`,
  title,
  category: 'sites-vitrines',
  kind: 'maquette',
  location: place,
  summary: `Maquette de site vitrine pour ${sector.toLowerCase()} à ${place}, préparée gratuitement avant toute commande.`,
  body: `Cette maquette de démonstration montre à quoi pourrait ressembler le site du commerce : une page claire, pensée pour le cellulaire, qui présente les services, les réalisations et un bouton d’appel toujours visible. Elle porte la mention « Maquette de démonstration » : ce n’est pas le site officiel de l’entreprise.`,
  features: [
    { title: 'Accueil qui accroche', text: 'Un titre clair, une belle photo et deux boutons : appeler ou voir les services.' },
    { title: 'Services et réalisations', text: 'Les prestations et les plus belles réalisations, mises en valeur.' },
    { title: 'Contact en un geste', text: 'Bouton d’appel, adresse et heures, faciles à trouver sur cellulaire.' },
  ],
  technologies: ['HTML', 'CSS', 'Adapté au cellulaire'],
  completedOn: '2026',
  liveUrl: `https://maquette-${slug}.vercel.app`,
  featured,
  images: [
    { file: `${slug}-d.webp`, variant: 'desktop', caption: 'Accueil', cover: true },
    { file: `${slug}-m.webp`, variant: 'mobile', caption: 'Version cellulaire' },
    { file: `${slug}-s0.webp`, variant: 'desktop', caption: 'Section services' },
    { file: `${slug}-s1.webp`, variant: 'desktop', caption: 'Section réalisations' },
  ],
});

export const seedProjects: SeedProject[] = [
  {
    slug: 'autorefaatart',
    title: 'AutoRefaatArt',
    client: 'AutoRefaatArt',
    category: 'e-commerce',
    kind: 'client',
    location: 'Zemamra, Maroc',
    summary: 'Une boutique en ligne complète de pièces auto et d’accessoires, faite sur mesure de A à Z : catalogue, recherche, panier, espace administrateur et commande sur WhatsApp.',
    challenge: 'Au Maroc, peu de clients paient en ligne. Le commerçant recevait les mêmes questions en boucle sur WhatsApp et devait tout gérer à la main, sans vitrine pour présenter ses produits.',
    solution: 'J’ai conçu un parcours où la commande part toute rédigée sur WhatsApp, avec le total, et se paie en espèces à la livraison. Le propriétaire gère seul ses produits, prix et stock depuis son téléphone.',
    features: [
      { title: 'Catalogue par rayons', text: 'Rayons, recherche instantanée, tri, filtres et recherche par marque de véhicule.' },
      { title: 'Commande WhatsApp', text: 'Panier et commande envoyée toute rédigée sur WhatsApp, paiement à la livraison.' },
      { title: 'Espace administrateur', text: 'Prix, stock, ajout de produits avec photo, géré depuis le cellulaire.' },
      { title: 'Conseiller huile', text: 'Le client choisit sa voiture et trouve la bonne huile moteur en 3 clics.' },
      { title: 'Jante 3D interactive', text: 'Une page d’accueil marquante, avec une jante en 3D légère sur cellulaire.' },
      { title: 'Français et arabe', text: 'Une boutique bilingue, pensée pour les clients de la région.' },
    ],
    technologies: ['Next.js', 'Three.js (3D)', 'WhatsApp', 'Espace admin', 'Serveur privé (Docker)', 'Français / arabe'],
    completedOn: '2026',
    liveUrl: 'https://www.autorefaatart.com',
    videoUrl: '/videos/autorefaatart-3d.mp4',
    videoPoster: '/videos/autorefaatart-3d.webp',
    featured: true,
    images: [
      { file: 'refaat-home.webp', variant: 'desktop', caption: 'Accueil avec jante 3D interactive', cover: true },
      { file: 'refaat-m-home.webp', variant: 'mobile', caption: 'Accueil sur cellulaire' },
      { file: 'refaat-carro.webp', variant: 'desktop', caption: 'Rayon Pièces carrosserie' },
      { file: 'refaat-prod.webp', variant: 'desktop', caption: 'Fiche produit et commande' },
      { file: 'refaat-cat.webp', variant: 'desktop', caption: 'Rayon Autoradio & cockpit' },
      { file: 'refaat-huile.webp', variant: 'desktop', caption: 'Conseiller huile en 3 clics' },
    ],
  },
  {
    slug: 'elan-coiffure',
    title: 'Élan Coiffure',
    category: 'sites-vitrines',
    kind: 'exemple',
    location: 'Exemple fictif',
    summary: 'Un exemple fictif qui montre à quoi ressemble un site de salon fait avec le forfait Pro : clair, chaleureux et pensé pour faire appeler le client.',
    challenge: 'Un salon de quartier vit du bouche-à-oreille, mais les nouveaux clients comparent sur Google avant de réserver. Sans site, ils choisissent le salon d’à côté.',
    solution: 'Une page qui répond à toutes les questions en quelques secondes : services et prix, réalisations, avis, heures, carte et un bouton d’appel toujours visible.',
    features: [
      { title: 'Services et prix clairs', text: 'Le client sait combien ça coûte avant d’appeler.' },
      { title: 'Galerie de réalisations', text: 'Les plus belles coupes mises en valeur.' },
      { title: 'Avis de clients', text: 'Une section prête à accueillir les vrais avis Google.' },
      { title: 'Heures, carte et appel', text: 'Toutes les infos pratiques, et un bouton d’appel fixe sur cellulaire.' },
    ],
    technologies: ['HTML', 'CSS', 'Adapté au cellulaire', 'Référencement local'],
    completedOn: '2026',
    liveUrl: '/exemples/salon/index.html',
    featured: true,
    images: [
      { file: 'salon-d.webp', variant: 'desktop', caption: 'Accueil du salon (exemple fictif)', cover: true },
      { file: 'salon-m.webp', variant: 'mobile', caption: 'Version cellulaire' },
    ],
  },
  maquette('garage-city-line', 'Garage City Line', 'Garage', 'Montréal-Nord', true),
  maquette('bosscut', 'BossCut', 'Barbier', 'Saint-Hubert', true),
  maquette('plaisirs-gourmets', 'Plaisirs Gourmets', 'Traiteur', 'Montréal', true),
  maquette('lily-photo', 'Lily Photo & Vidéo', 'Photographe', 'Saint-Laurent', false),
  maquette('joyeuses-celebrations', 'Joyeuses Célébrations', 'Décoration d’événements', 'Montréal', false),
  maquette('mtlnails', 'MTLNails', 'Salon d’ongles', 'Cartierville', false),
  maquette('beyoutiful-luxe', 'BeYoutiful Luxe', 'Extensions de cils', 'Saint-Hubert', false),
  maquette('masso-tomizawa', 'Massothérapie Tomizawa', 'Massothérapie', 'Saint-Hubert', false),
];

const SEED_KEY = 'seedState';

export async function isSeedDone() {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, SEED_KEY)).limit(1);
  return Boolean((row?.value as { done?: boolean } | undefined)?.done);
}

/**
 * Importe le contenu de départ, projet par projet, en reprenant là où il s’est arrêté.
 * `deadline` (horodatage ms) : s’arrête avant de commencer un projet si le temps est écoulé
 * (utile sur Vercel, où une requête est limitée à 30 s). Ne crée jamais de doublon.
 */
export async function seedDatabase(load: Loader, log: (m: string) => void = console.log, opts: { deadline?: number } = {}) {
  const db = await getDb();
  if (await isSeedDone()) {
    log('Contenu de départ déjà importé.');
    return { imported: 0, remaining: 0 };
  }

  const catIds: Record<string, string> = {};
  for (const [i, c] of seedCategories.entries()) {
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, c.slug)).limit(1);
    if (existing[0]) catIds[c.slug] = existing[0].id;
    else {
      const [row] = await db.insert(schema.categories).values({ ...c, sort: i }).returning();
      catIds[c.slug] = row.id;
    }
  }

  const [{ n: nServices }] = await db.select({ n: count() }).from(schema.services);
  if (!nServices) await db.insert(schema.services).values(seedServices.map((s, i) => ({ ...s, sort: i })));

  const [{ n: nFaq }] = await db.select({ n: count() }).from(schema.faqs);
  if (!nFaq) await db.insert(schema.faqs).values(seedFaqs.map((f, i) => ({ ...f, sort: i })));

  for (const key of Object.keys(defaultSettings) as (keyof typeof defaultSettings)[]) {
    await db.insert(schema.settings).values({ key, value: defaultSettings[key] }).onConflictDoNothing();
  }

  let imported = 0;
  let remaining = 0;
  for (const [i, p] of seedProjects.entries()) {
    const exists = await db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.slug, p.slug)).limit(1);
    if (exists.length) continue;
    if (opts.deadline && Date.now() > opts.deadline) { remaining++; continue; }

    // Images d’abord : le projet n’est créé que si toutes ses images sont prêtes (pas de projet à moitié importé)
    const { images, category, ...data } = p;
    const processed = [];
    for (const [k, img] of images.entries()) processed.push(await processImage(await load(img.file), `${p.slug}-${k}`));

    const [row] = await db
      .insert(schema.projects)
      .values({ ...data, client: data.client ?? '', categoryId: catIds[category], status: 'published', sort: i, publishedAt: new Date() })
      .returning();
    let coverId: string | null = null;
    for (const [k, img] of images.entries()) {
      const [im] = await db
        .insert(schema.projectImages)
        .values({ projectId: row.id, ...processed[k], variant: img.variant, caption: img.caption, sort: k })
        .returning();
      if (img.cover) coverId = im.id;
    }
    if (coverId) await db.update(schema.projects).set({ coverImageId: coverId }).where(eq(schema.projects.id, row.id));
    imported++;
    log(`✓ ${p.title} (${images.length} images)`);
  }

  if (remaining === 0) {
    await db.insert(schema.settings).values({ key: SEED_KEY, value: { done: true } })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: { done: true }, updatedAt: new Date() } });
  }
  return { imported, remaining };
}
