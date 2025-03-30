export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => {
    const router = useRouter()
    
    router.beforeEach((to, from, next) => {
      if (to.path.startsWith('/qr/')) {
        // Skip auth check for QR pages
        next()
      } else {
        next()
      }
    })
  })
}) 