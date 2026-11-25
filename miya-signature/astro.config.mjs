import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { identity } from './src/config/miya.ts';

export default defineConfig({
  site: identity.siteUrl,
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
});
