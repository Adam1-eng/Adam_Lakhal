import type { APIRoute } from 'astro';

// Adresse classique « /sitemap.xml » (celle que Google, Bing et la plupart des outils essaient en premier) :
// même contenu complet que /sitemap-0.xml (toutes les pages publiques), une seule source dans lib/seo.ts.
export { GET } from './sitemap-0.xml';
export type { APIRoute };
