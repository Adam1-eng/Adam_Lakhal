import type { ImageMetadata } from 'astro';

import refaatAccueil from '../assets/projets/refaat-home.webp';
import refaatMobile from '../assets/projets/refaat-m-home.webp';
import refaatCarro from '../assets/projets/refaat-carro.webp';
import refaatProd from '../assets/projets/refaat-prod.webp';
import refaatHuile from '../assets/projets/refaat-huile.webp';
import refaatCat from '../assets/projets/refaat-cat.webp';
import salonD from '../assets/projets/salon-d.webp';
import salonM from '../assets/projets/salon-m.webp';

export type Category = 'client' | 'exemple' | 'maquette';

export const categoryLabel: Record<Category, string> = {
  client: 'Projet client',
  exemple: 'Exemple',
  maquette: 'Maquette',
};

export type CaseStudy = {
  slug: string;
  category: Category;
  name: string;
  sector: string;
  place: string;
  year: string;
  status: string;
  url?: string;
  urlLabel?: string;
  summary: string;
  challenge: string;
  solution: string;
  features: { title: string; text: string }[];
  stack: string[];
  cover: ImageMetadata;
  mobile: ImageMetadata;
  gallery: { img: ImageMetadata; caption: string }[];
  accent: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'autorefaatart',
    category: 'client',
    name: 'AutoRefaatArt',
    sector: 'Boutique en ligne · Pièces auto',
    place: 'Zemamra, Maroc',
    year: '2026',
    status: 'En ligne',
    url: 'https://www.autorefaatart.com',
    urlLabel: 'autorefaatart.com',
    summary:
      'Une boutique en ligne complète de pièces auto et d’accessoires, faite sur mesure de A à Z : catalogue, recherche, panier, espace administrateur et commande sur WhatsApp.',
    challenge:
      'Au Maroc, peu de clients paient en ligne. Le commerçant recevait les mêmes questions en boucle sur WhatsApp et devait tout gérer à la main, sans vitrine pour présenter ses produits.',
    solution:
      'J’ai conçu un parcours où la commande part toute rédigée sur WhatsApp, avec le total, et se paie en espèces à la livraison. Le propriétaire gère seul ses produits, prix et stock depuis son téléphone.',
    features: [
      { title: 'Catalogue par rayons', text: 'Rayons, recherche instantanée, tri, filtres et recherche par marque de véhicule.' },
      { title: 'Commande WhatsApp', text: 'Panier et commande envoyée toute rédigée sur WhatsApp, paiement à la livraison.' },
      { title: 'Espace administrateur', text: 'Prix, stock, ajout de produits avec photo, géré depuis le cellulaire.' },
      { title: 'Conseiller huile', text: 'Le client choisit sa voiture et trouve la bonne huile moteur en 3 clics.' },
      { title: 'Jante 3D interactive', text: 'Une page d’accueil marquante, avec une jante en 3D légère sur cellulaire.' },
      { title: 'Français et arabe', text: 'Une boutique bilingue, pensée pour les clients de la région.' },
    ],
    stack: ['Next.js', 'Three.js (3D)', 'WhatsApp', 'Espace admin', 'Serveur privé (Docker)', 'Français / arabe'],
    cover: refaatAccueil,
    mobile: refaatMobile,
    gallery: [
      { img: refaatAccueil, caption: 'Accueil avec jante 3D interactive' },
      { img: refaatCarro, caption: 'Rayon Pièces carrosserie' },
      { img: refaatProd, caption: 'Fiche produit et commande' },
      { img: refaatCat, caption: 'Rayon Autoradio & cockpit' },
      { img: refaatHuile, caption: 'Conseiller huile en 3 clics' },
    ],
    accent: '#e0b14a',
  },
  {
    slug: 'elan-coiffure',
    category: 'exemple',
    name: 'Élan Coiffure',
    sector: 'Site vitrine · Salon de coiffure',
    place: 'Exemple fictif',
    year: '2026',
    status: 'Exemple de forfait Pro',
    url: '/exemples/salon/index.html',
    urlLabel: 'Voir l’exemple en plein écran',
    summary:
      'Un exemple fictif qui montre à quoi ressemble un site de salon fait avec le forfait Pro : clair, chaleureux et pensé pour faire appeler le client.',
    challenge:
      'Un salon de quartier vit du bouche-à-oreille, mais les nouveaux clients comparent sur Google avant de réserver. Sans site, ils choisissent le salon d’à côté.',
    solution:
      'Une page qui répond à toutes les questions en quelques secondes : services et prix, réalisations, avis, heures, carte et un bouton d’appel toujours visible.',
    features: [
      { title: 'Services et prix clairs', text: 'Le client sait combien ça coûte avant d’appeler.' },
      { title: 'Galerie de réalisations', text: 'Les plus belles coupes mises en valeur.' },
      { title: 'Avis de clients', text: 'Une section prête à accueillir les vrais avis Google.' },
      { title: 'Heures, carte et appel', text: 'Toutes les infos pratiques, et un bouton d’appel fixe sur cellulaire.' },
    ],
    stack: ['HTML', 'CSS', 'Adapté au cellulaire', 'Référencement local'],
    cover: salonD,
    mobile: salonM,
    gallery: [{ img: salonD, caption: 'Accueil du salon (exemple fictif)' }],
    accent: '#a0674a',
  },
];

// Maquettes de démonstration : préparées pour des commerces, chaque page en ligne
// porte la mention « Maquette de démonstration — ce n'est pas le site officiel ».
export type Maquette = {
  slug: string;
  name: string;
  sector: string;
  place: string;
  group: 'beaute' | 'auto' | 'resto' | 'services' | 'animaux' | 'photo';
  url: string;
  desktop: ImageMetadata;
  mobile: ImageMetadata;
};

const shots = import.meta.glob<{ default: ImageMetadata }>('../assets/maquettes/*.webp', { eager: true });
const shot = (slug: string, v: 'd' | 'm') => shots[`../assets/maquettes/${slug}-${v}.webp`].default;

const raw: Omit<Maquette, 'desktop' | 'mobile' | 'url'>[] = [
  { slug: 'garage-city-line', name: 'Garage City Line', sector: 'Garage', place: 'Montréal-Nord', group: 'auto' },
  { slug: 'bosscut', name: 'BossCut', sector: 'Barbier', place: 'Saint-Hubert', group: 'beaute' },
  { slug: 'plaisirs-gourmets', name: 'Plaisirs Gourmets', sector: 'Traiteur', place: 'Montréal', group: 'resto' },
  { slug: 'lily-photo', name: 'Lily Photo & Vidéo', sector: 'Photographe', place: 'Saint-Laurent', group: 'photo' },
  { slug: 'joyeuses-celebrations', name: 'Joyeuses Célébrations', sector: 'Décoration d’événements', place: 'Montréal', group: 'services' },
  { slug: 'chic-canin', name: 'Chic Canin', sector: 'Toilettage', place: 'Montréal-Nord', group: 'animaux' },
  { slug: 'masso-tomizawa', name: 'Massothérapie Tomizawa', sector: 'Massothérapie', place: 'Saint-Hubert', group: 'beaute' },
  { slug: 'atelier-peintres', name: 'L’Atelier des Peintres', sector: 'Peinture en bâtiment', place: 'Montréal', group: 'services' },
  { slug: 'metropolar', name: 'Salon Metropolar', sector: 'Barbier', place: 'Plateau-Mont-Royal', group: 'beaute' },
  { slug: 'les-maitres-traiteurs', name: 'Les Maîtres Traiteurs', sector: 'Traiteur', place: 'Notre-Dame-de-Grâce', group: 'resto' },
  { slug: 'renovation-paul-garneau', name: 'Rénovation Paul Garneau', sector: 'Rénovation', place: 'Sud-Ouest', group: 'services' },
  { slug: 'kalems-photo', name: 'KaLeM’S Photographe', sector: 'Photographe', place: 'Longueuil', group: 'photo' },
  { slug: 'the-powder-room', name: 'The Powder Room', sector: 'Salon de coiffure', place: 'Plateau-Mont-Royal', group: 'beaute' },
  { slug: 'spa-griffe', name: 'Spa Griffé', sector: 'Toilettage', place: 'Longueuil', group: 'animaux' },
  { slug: 'lashes-by-g', name: 'Lashes By G', sector: 'Extensions de cils', place: 'Longueuil', group: 'beaute' },
  { slug: 'mtlnails', name: 'MTLNails', sector: 'Salon d’ongles', place: 'Cartierville', group: 'beaute' },
  { slug: 'lorena-studio', name: 'Lorena Studio', sector: 'Salon de coiffure', place: 'Saint-Léonard', group: 'beaute' },
  { slug: 'peignes-et-poils', name: 'Peignes et Poils', sector: 'Toilettage', place: 'Boucherville', group: 'animaux' },
  { slug: 'beyoutiful-luxe', name: 'BeYoutiful Luxe', sector: 'Extensions de cils', place: 'Saint-Hubert', group: 'beaute' },
  { slug: 'salon-de-belle', name: 'Au salon de Belle', sector: 'Salon d’ongles', place: 'Verdun', group: 'beaute' },
];

export const maquettes: Maquette[] = raw.map((m) => ({
  ...m,
  url: `https://maquette-${m.slug}.vercel.app`,
  desktop: shot(m.slug, 'd'),
  mobile: shot(m.slug, 'm'),
}));

export const groupLabel: Record<Maquette['group'], string> = {
  beaute: 'Beauté et soins',
  auto: 'Automobile',
  resto: 'Restauration',
  services: 'Services et rénovation',
  animaux: 'Animaux',
  photo: 'Photographie',
};

