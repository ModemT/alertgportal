// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  app: {
    head: {
      title: 'AlertG Payment Portal',
      meta: [
        { name: 'description', content: 'A modern payment portal dashboard' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-03-12'
})