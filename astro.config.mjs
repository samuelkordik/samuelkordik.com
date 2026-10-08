// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import redirects from './src/redirects.json' with { type: 'json' };

// Unlinked pages kept only so old URLs (and Samuel's email signature) keep working.
const UNLISTED = ['/headsooth/', '/blood-check-character-calculator'];

export default defineConfig({
  site: 'https://samuelkordik.com',
  trailingSlash: 'ignore',
  // Every old WordPress URL → its new home (meta-refresh pages, since GitHub Pages has no server redirects).
  redirects,
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !UNLISTED.some((p) => page.includes(p)) }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
  image: { layout: 'constrained' },
});
