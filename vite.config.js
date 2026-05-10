import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8888'
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'DigiTape',
        short_name: 'DigiTape',
        description: 'Turn your old mixtapes into Spotify playlists',
        theme_color: '#0f0f13',
        background_color: '#0f0f13',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/i\.scdn\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spotify-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      }
    })
  ]
})
