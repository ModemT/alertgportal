import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

export interface Charge {
  id: string
  partner_id: string
  shopper_id: string
  amount: number
  currency: string
  status: string
  description?: string
  charge_metadata?: {
    payment_method?: string
    fee?: number
    tax?: number
  }
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  next_cursor: string | null
  has_more: boolean
}

// Debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

interface FetchChargesOptions {
  cursor?: string;
  limit?: number;
  status?: string;
  search?: string;
}

export const useCharges = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const charges = ref<Charge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  const maxRetries = 3

  const fetchCharges = async (options: FetchChargesOptions = {}): Promise<PaginatedResponse<Charge>> => {
    const { cursor, limit = 50, status, search } = options
    const formattedCursor = cursor ? new Date(cursor).toISOString() : undefined
    
    try {
      loading.value = true
      error.value = null
      
      // Build query parameters
      const params = new URLSearchParams()
      if (formattedCursor) params.append('cursor', formattedCursor)
      if (limit) params.append('limit', limit.toString())
      if (status) params.append('status', status)
      if (search) params.append('search', search)
      
      const response = await fetch(
        `${apiBase}/charges?${params.toString()}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': localStorage.getItem('token') || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      retryCount.value = 0 // Reset retry count on success
      
      return {
        data: data.charges || [],
        next_cursor: data.next_cursor || null,
        has_more: data.has_more || false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch charges'
      console.error('Error fetching charges:', err)
      
      // Implement retry logic
      if (retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`Retrying request (${retryCount.value}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.value)) // Exponential backoff
        return fetchCharges(options)
      }
      
      throw err
    } finally {
      loading.value = false
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