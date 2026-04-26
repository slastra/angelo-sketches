export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  modules: ['@nuxt/ui', '@nuxt/icon'],
  css: ['~/assets/css/gallery.css'],
  app: {
    head: {
      title: "Angelo's Sketches",
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
  runtimeConfig: {
    appPassword: process.env.APP_PASSWORD || '',
    sessionSecret: process.env.SESSION_SECRET || '',
  },
  nitro: {
    storage: {},
  },
  typescript: {
    strict: true,
  },
})
