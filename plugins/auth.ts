import { defineNuxtPlugin } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.client) {
    const { checkAuth } = useAuth()
    await checkAuth()
  }
}) 