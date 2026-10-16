import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/antrian_react/',

  server: {
    port: 5173,
    proxy: {
      '/react-api': {
        target: 'http://localhost/KP/antrian_pendaftaran',
        changeOrigin: true,
      },
      '/foto': {
        target: 'http://localhost/KP/antrian_pendaftaran',
        changeOrigin: true,
      },
    },
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/*.png',
        'sounds_jelek/*.mp3',
        'Bells.mp3',
      ],
      
      manifest: {
        name: 'Antrian Pendaftaran',
        short_name: 'Antrian',
        description: 'Sistem Informasi Antrian Pasien',
        theme_color: '#268e67',
        background_color: '#eef3f1',
        display: 'standalone',
        start_url: '/antrian_react/',
        icons: [
          {
            src: '/antrian_react/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/antrian_react/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})