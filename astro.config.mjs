// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://byronequipment.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [mdx(), tailwind()],
  i18n: {
    defaultLocale: 'en-US',
    locales: [
      'en-US',
      {
        path: 'uk',
        codes: ['en-GB'],
      },
      'pl',
    ],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
