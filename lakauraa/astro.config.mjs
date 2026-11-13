// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://lakauraa.vercel.app',
  output: 'server',
  adapter: vercel({ maxDuration: 30 }),
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/admin') })],
  security: { checkOrigin: true },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
  vite: { ssr: { external: ['sharp', '@electric-sql/pglite'] } },
});
