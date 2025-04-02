import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

export interface Charge {
  id: string
  partner_id: string
  shopper_id: string
  amount: number
  currency: string
  status: string
  description: string
  charge_metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface FetchChargesResponse {
  data: Charge[]
  nextCursor: string | null
  hasMore: boolean
}

export const useCharges = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const charges = ref<Charge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCharges = async (cursor?: string, limit: number = 10): Promise<FetchChargesResponse> => {
    try {
      const formattedCursor = cursor ? new Date(cursor).toISOString() : undefined
      const response = await fetch(`${apiBase}/charges?limit=${limit}${formattedCursor ? `&cursor=${formattedCursor}` : ''}`, {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch charges')
      }

      const data = await response.json()
      return {
        data: data.charges || [],
        nextCursor: data.next_cursor || null,
        hasMore: data.has_more || false
      }
    } catch (error) {
      console.error('Error fetching charges:', error)
      throw error
    }
  }

  const getCharge = async (chargeId: string): Promise<Charge> => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${apiBase}/charges/${chargeId}`, {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch charge details')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelCharge = async (chargeId: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch(`${apiBase}/charges/${chargeId}/cancel`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel charge')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    charges,
    loading,
    error,
    fetchCharges,
    getCharge,
    cancelCharge
  }
} 