import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' : le site fonctionne aussi bien en local que sur GitHub Pages (sous-dossier du dépôt).
export default defineConfig({
  base: './',
  plugins: [svelte()],
  build: { chunkSizeWarningLimit: 2600 },
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
  },
});
