import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'prompt',

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['document', 'script', 'style', 'image', 'font']
                .includes(request.destination),

            handler: 'NetworkFirst',

            options: {
              cacheName: 'bacv3-cache',

              networkTimeoutSeconds: 5,

              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },

      manifest: {
        name: 'BidAsk Cathedral',
        short_name: 'BAC',
        description: 'Cryptocurrency trading platform with real-time data and advanced charting tools.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',

        icons: [
          {
            src: '/bac-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/bac-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    
    proxy: {
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },

  preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
})


