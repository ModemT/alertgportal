import { ref } from 'vue'

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

interface Shopper {
  id: string
  partner_id: string
  name: string
  thai_name: string
  email: string
  phone: string
  account: string
  created_at: string
  updated_at: string | null
  total_completed_charges: {
    THB: string
  }
}

interface RefundRequest {
  amount: number
  currency: string
  description: string
  charge_metadata: Record<string, any>
}

export function useShopperDetails() {
  const shopper = ref<Shopper | null>(null)
  const charges = ref<Charge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchShopperDetails = async (shopperId: string) => {
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
        `${apiBase}/shoppers/${shopperId}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': token
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch shopper details')
      }

      const data = await response.json()
      shopper.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching shopper details:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchShopperCharges = async (shopperId: string, skip = 0, limit = 100) => {
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
        `${apiBase}/shoppers/${shopperId}/charges?skip=${skip}&limit=${limit}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': token
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch shopper charges')
      }

      const data = await response.json()
      charges.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching shopper charges:', err)
    } finally {
      loading.value = false
    }
  }

  const createRefund = async (shopperId: string, refundData: RefundRequest) => {
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
        `${apiBase}/shoppers/${shopperId}/refunds`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'access-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(refundData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create refund')
      }

      const data = await response.json()
      // Refresh charges list after successful refund
      await fetchShopperCharges(shopperId)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error creating refund:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    shopper,
    charges,
    loading,
    error,
    fetchShopperDetails,
    fetchShopperCharges,
    createRefund
  }
} 