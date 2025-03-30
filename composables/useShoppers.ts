import { ref } from 'vue'
import { useApi } from './useApi'

interface Shopper {
  id: string
  name: string
  email: string
  phone: string
  account: string
  partner_id: string
  created_at: string
  updated_at: string | null
  total_completed_charges: Record<string, number>
}

interface CreateShopperData {
  name: string
  email: string
  phone: string
  account: string
}

export function useShoppers() {
  const api = useApi()
  const shoppers = ref<Shopper[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchShoppers = async (skip: number = 0, limit: number = 10) => {
    try {
      loading.value = true
      error.value = null
      const data = await api.get(`/shoppers?skip=${skip}&limit=${limit}`)
      shoppers.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const createShopper = async (data: CreateShopperData) => {
    try {
      loading.value = true
      error.value = null
      return await api.post('/shoppers', data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    shoppers,
    loading,
    error,
    fetchShoppers,
    createShopper
  }
} 