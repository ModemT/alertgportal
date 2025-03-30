import { ref } from 'vue'

interface Shopper {
  name: string
  email: string
  phone: string
  account: string
  id: string
  partner_id: string
  created_at: string
  updated_at: string | null
  total_completed_charges: {
    THB: string
  }
}

export function useShoppers() {
  const shoppers = ref<Shopper[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchShoppers = async (skip = 0, limit = 100) => {
    loading.value = true
    error.value = null
    
    try {
      const config = useRuntimeConfig()
      const apiBase = config.public.apiBase as string
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(
        `${apiBase}/shoppers?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': token
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch shoppers')
      }

      const data = await response.json()
      shoppers.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching shoppers:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    shoppers,
    loading,
    error,
    fetchShoppers
  }
} 