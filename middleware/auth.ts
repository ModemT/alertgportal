export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useAuth()

  // Skip auth check for public routes
  if (to.path === '/login' || to.path === '/register' || to.path.startsWith('/qr/')) {
    return
  }

  // Check authentication
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
}) 