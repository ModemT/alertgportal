import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useAuth()
  
  // Skip auth check for login and register pages
  if (to.path === '/login' || to.path === '/register') {
    return
  }

  try {
    const isAuthenticated = await checkAuth()
    
    if (!isAuthenticated) {
      // Redirect to login with the current path as redirect
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } catch (error) {
    // Create a proper error object
    const errorObj = {
      statusCode: 401,
      message: 'Authentication failed. Please log in again.',
      statusText: error instanceof Error ? error.message : 'Unknown error'
    }
    return createError(errorObj)
  }
}) 