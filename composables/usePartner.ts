import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

interface Partner {
  id: string
  name: string
  email: string
  username: string
  phone: string
  account: string
  is_active: boolean
}

export const usePartner = () => {
  const partner = ref<Partner | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPartner = async (partnerId: string) => {
    if (!partnerId) return

    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const response = await fetch(`${config.public.apiBase}/partners/${partnerId}`, {
        headers: {
          'accept': 'application/json',
          'x-partner-id': partnerId,
          'access-token': localStorage.getItem('token') || ''
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch partner data')
      }

      const data = await response.json()
      partner.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch partner data'
      console.error('Error fetching partner:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    partner,
    loading,
    error,
    fetchPartner
  }
} 