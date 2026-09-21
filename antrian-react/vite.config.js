import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: 'KP/antrian_pendaftaran/',
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/*.png',
        'sounds_jelek/*.mp3',
      ],

      manifest: {
        name: 'Antrian Pendaftaran',
        short_name: 'Antrian',
        description: 'Sistem Informasi Antrian Pasien',
        theme_color: '#268e67',
        background_color: '#eef3f1',
        display: 'standalone',
        start_url: '/KP/antrian_pendaftaran/',

        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,mp3}'
        ],

        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/api/'),

            handler: 'NetworkFirst',

            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})