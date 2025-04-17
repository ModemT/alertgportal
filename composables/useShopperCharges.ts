import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

interface Charge {
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

interface PaginatedChargesResponse {
  charges: Charge[]
  next_cursor: string | null
  has_more: boolean
}

export const useShopperCharges = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const charges = ref<Charge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const nextCursor = ref<string | null>(null)
  const hasMore = ref(true)

  const fetchCharges = async (shopperId: string, cursor?: string, limit: number = 10): Promise<PaginatedChargesResponse> => {
    try {
      const formattedCursor = cursor ? new Date(cursor).toISOString() : undefined
      const response = await fetch(
        `${apiBase}/shoppers/${shopperId}/charges?limit=${limit}${formattedCursor ? `&cursor=${formattedCursor}` : ''}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': localStorage.getItem('token') || '',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        if (Array.isArray(errorData.detail)) {
          throw new Error(errorData.detail[0].msg || 'Failed to fetch shopper charges')
        } else {
          throw new Error(errorData.detail || 'Failed to fetch shopper charges')
        }
      }

      const data = await response.json()
      return {
        charges: data.charges || [],
        next_cursor: data.next_cursor || null,
        has_more: data.has_more || false
      }
    } catch (error) {
      console.error('Error fetching shopper charges:', error)
      throw error
    }
  }

  const loadCharges = async (shopperId: string, cursor?: string, limit: number = 10): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      const result = await fetchCharges(shopperId, cursor, limit)
      
      if (!cursor) {
        // First page
        charges.value = result.charges
      } else {
        // Append to existing data
        charges.value = [...charges.value, ...result.charges]
      }
      
      nextCursor.value = result.next_cursor
      hasMore.value = result.has_more
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading shopper charges:', err)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    charges.value = []
    nextCursor.value = null
    hasMore.value = true
    error.value = null
  }

  return {
    charges,
    loading,
    error,
    nextCursor,
    hasMore,
    loadCharges,
    reset
  }
} 