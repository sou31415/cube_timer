import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      injectRegister: false,
      manifest: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,js,webmanifest}'],
        globIgnores: [
          '**/assets/puzzles-dynamic-4x4x4-*.js',
          '**/assets/puzzles-dynamic-megaminx-*.js',
          '**/assets/puzzles-dynamic-side-events-*.js',
          '**/assets/puzzles-dynamic-unofficial-*.js',
          '**/assets/search-dynamic-solve-4x4x4-*.js',
          '**/assets/search-dynamic-solve-fto-*.js',
          '**/assets/search-dynamic-solve-master_tetraminx-*.js',
          '**/assets/search-dynamic-sgs-side-events-*.js',
          '**/assets/search-dynamic-sgs-unofficial-*.js',
          '**/assets/twips*.js',
        ],
      },
    }),
  ],
});
