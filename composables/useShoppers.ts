import { ref } from 'vue'
import { useApi } from './useApi'

interface Shopper {
  id: string
  name: string
  thai_name: string
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
  thai_name: string
  email: string
  phone: string
  account: string
}

export interface UpdateShopperData {
  name?: string
  thai_name?: string
  email?: string
  phone?: string
  is_active?: boolean
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
      const response = await api.get(`/shoppers?skip=${skip}&limit=${limit}`)
      const data = response as Shopper[]
      shoppers.value = Array.isArray(data) ? data : []
      return {
        data: shoppers.value,
        total: shoppers.value.length // Since we're getting the full array, use its length
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      shoppers.value = [] // Reset to empty array on error
      throw err
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

  const updateShopper = async (shopperId: string, data: UpdateShopperData) => {
    try {
      loading.value = true
      error.value = null
      return await api.patch(`/shoppers/${shopperId}`, data)
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
    createShopper,
    updateShopper
  }
} 