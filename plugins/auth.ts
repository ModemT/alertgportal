import { defineNuxtPlugin } from '#app'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { checkAuth } = useAuth()

  // Add navigation guard
  nuxtApp.vueApp.config.globalProperties.$router.beforeEach(async (to: any, from: any, next: any) => {
    // Always allow access to login, register, and QR pages
    if (to.path === '/login' || to.path === '/register' || to.path.startsWith('/qr/')) {
      next()
      return
    }

    try {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    } catch (error) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  })
}) 