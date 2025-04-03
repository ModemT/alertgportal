import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

export interface Shopper {
  id: string
  account: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  updated_at: string
  total_completed_charges?: Record<string, number>
}

export interface UpdateShopperData {
  name?: string
  thai_name?: string
  email?: string
  phone?: string
  account?: string
}

interface CreateShopperData {
  name: string
  email: string
  phone: string
  account: string
}

export const useShoppers = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const shoppers = ref<Shopper[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchShoppers = async (cursor?: string, limit: number = 10) => {
    try {
      loading.value = true
      error.value = null
      const formattedCursor = cursor ? new Date(cursor).toISOString() : undefined
      const response = await fetch(`${apiBase}/shoppers?limit=${limit}${formattedCursor ? `&cursor=${formattedCursor}` : ''}`, {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shoppers')
      }

      const data = await response.json()
      shoppers.value = data.shoppers || []
      
      return {
        data: data.shoppers || [],
        nextCursor: data.next_cursor || null,
        hasMore: data.has_more || false
      }
    } catch (error) {
      console.error('Error fetching shoppers:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getShopper = async (shopperId: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${apiBase}/shoppers/${shopperId}`, {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shopper details')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getShopperByAccount = async (account: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${apiBase}/shoppers/account/${account}`, {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shopper details')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createShopper = async (data: CreateShopperData) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${apiBase}/shoppers`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create shopper')
      }

      return await response.json()
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
      const response = await fetch(`${apiBase}/shoppers/${shopperId}`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update shopper')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteShopper = async (shopperId: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${apiBase}/shoppers/${shopperId}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete shopper')
      }

      return true
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
    getShopper,
    getShopperByAccount,
    createShopper,
    updateShopper,
    deleteShopper
  }
} 