import { useToast } from '~/composables/useToast'

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth, isSessionExpired } = useAuth()
  const { showToast } = useToast()

  // Skip auth check for public routes
  if (to.path === '/login' || to.path === '/register' || to.path.startsWith('/qr/')) {
    return
  }

  // Check authentication
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    // Show session expired notification if that was the case
    if (isSessionExpired.value) {
      showToast('เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง', 'warning')
    }
    
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}) 