import { ref } from 'vue'

interface Charge {
  id: string
  partner_id: string
  shopper_id: string
  amount: number
  currency: string
  status: string
  description: string
  charge_metadata: {
    payment_method?: string
    fee?: number
    tax?: number
    approved_by?: string
  }
  created_at: string
  updated_at: string
}

export function useChargeDetails() {
  const charge = ref<Charge | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchChargeDetails = async (chargeId: string) => {
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
        `${apiBase}/charges/${chargeId}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': token
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch charge details')
      }

      const data = await response.json()
      charge.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching charge details:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    charge,
    loading,
    error,
    fetchChargeDetails
  }
} 