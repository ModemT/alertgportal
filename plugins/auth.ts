export default defineNuxtPlugin((nuxtApp) => {
  // Run before any page is mounted
  nuxtApp.hook('app:beforeMount', async () => {
    const token = localStorage.getItem('token')
    const currentPath = window.location.pathname

    // If not authenticated and not on login page, redirect to login
    if (!token && currentPath !== '/login') {
      await navigateTo('/login')
    }
    // If authenticated, allow access to all pages
  })
}) 