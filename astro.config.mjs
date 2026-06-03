// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    build: {
      cssCodeSplit: false,
    }
  },

  adapter: vercel()
});