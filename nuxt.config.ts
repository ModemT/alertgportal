// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],

  app: {
    head: {
      title: 'AlertG Payment Portal',
      meta: [
        { name: 'description', content: 'A modern payment portal dashboard' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-03-12',

  // Add runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "https://aspera.railway.internal",
      qrCodeTimeout: Number(process.env.NUXT_PUBLIC_QR_CODE_TIMEOUT) || 20
    }
  },

  // Performance optimizations
  nitro: {
    compressPublicAssets: true,
    minify: true,
    timing: false,
    storage: {
      cache: {
        driver: 'fs',
        base: './.cache'
      }
    }
  },

  // Route rules for caching
  routeRules: {
    '/**': { 
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    },
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*'
      }
    }
  }
})