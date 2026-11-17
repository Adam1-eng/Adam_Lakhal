// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';
import react from '@astrojs/react';
import { SITE } from './src/config/site.ts';

export default defineConfig({
  site: SITE.url, // domaine public : une seule variable, dans src/config/site.ts
  output: 'server',
  // LOCAL_NODE=1 : build Node local, uniquement pour mesurer les performances (Lighthouse) hors Vercel.
  adapter: process.env.LOCAL_NODE ? node({ mode: 'standalone' }) : vercel({ maxDuration: 30 }),
  integrations: [react()], // sitemap : généré dynamiquement (src/pages/sitemap-*.xml.ts)
  trailingSlash: 'ignore',
  security: { checkOrigin: true },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
  ...(process.env.LOCAL_NODE ? { outDir: './.data/node-build' } : {}),
  vite: { ssr: { external: ['sharp', '@electric-sql/pglite'] } },
});
