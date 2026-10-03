// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.fwbbowl.com',
  // The audit script builds the launch version into its own folder; normal builds go to dist/.
  outDir: process.env.FWB_OUT_DIR ?? './dist',
  trailingSlash: 'ignore',
  compressHTML: false,
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/parties/thanks') })],
  vite: {
    // FWB_PREVIEW=false lets the audit script check the launch version without editing src/data/site.ts.
    define: { __FWB_PREVIEW_OVERRIDE__: JSON.stringify(process.env.FWB_PREVIEW ?? '') },
  },
});
