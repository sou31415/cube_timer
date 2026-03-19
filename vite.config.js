import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,js,webmanifest}'],
      },
    }),
  ],
});
