/// <reference types="node" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'
import { agentFilesPlugin } from './tooling/agent-files/vitePlugin.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    agentFilesPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pokeapi-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      manifest: {
        name: 'Pokédex',
        short_name: 'Pokédex',
        description: 'Pokédex React - Busca Pokémon, tipos y evoluciones',
        theme_color: '#ef4444',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pokeball.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pokeball.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React, TanStack Query and Headless UI change only on upgrades, so their chunks stay cached across deploys.
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'query-vendor',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 15,
            },
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    expect: { requireAssertions: true },
    allowOnly: false,
    // A test is a .test.ts or .test.tsx file, the one suffix the lint reads as a test, and eslint.config.js
    // refuses one that no include here takes: a new include goes into its VITEST_TESTS too.
    projects: [
      {
        extends: true,
        test: {
          name: 'app',
          include: ['src/**/*.test.{ts,tsx}', 'eslint.config.test.ts'],
          environment: 'jsdom',
          setupFiles: ['src/shared/test/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'tooling',
          include: ['tooling/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
})
