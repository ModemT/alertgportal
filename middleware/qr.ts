export default defineNuxtRouteMiddleware((to) => {
  // This middleware will prevent any authentication checks for QR pages
  if (to.path.startsWith('/qr/')) {
    return
  }
}) 