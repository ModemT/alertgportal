import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

interface SearchResult {
  type: 'charge' | 'customer'
  id: string
  title: string
  subtitle: string
  amount?: number
  status?: string
  created_at: string
}

export const useGlobalSearch = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isOpen = ref(false)

  const search = async (query: string) => {
    if (!query) {
      searchResults.value = []
      return
    }

    try {
      loading.value = true
      error.value = null

      // Search charges
      const chargesResponse = await fetch(
        `${apiBase}/charges?search=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': localStorage.getItem('token') || '',
          },
        }
      )

      if (!chargesResponse.ok) {
        throw new Error('Failed to fetch charges')
      }

      const chargesData = await chargesResponse.json()
      const charges = chargesData.charges || []

      // Search customers
      const customersResponse = await fetch(
        `${apiBase}/shoppers?search=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': localStorage.getItem('token') || '',
          },
        }
      )

      if (!customersResponse.ok) {
        throw new Error('Failed to fetch customers')
      }

      const customersData = await customersResponse.json()
      const customers = customersData.shoppers || []

      // Format results
      const chargeResults: SearchResult[] = charges.map((charge: any) => ({
        type: 'charge',
        id: charge.id,
        title: charge.description || 'ไม่มีรายละเอียด',
        subtitle: `รหัส: ${charge.id}`,
        amount: charge.amount,
        status: charge.status,
        created_at: charge.created_at
      }))

      const customerResults: SearchResult[] = customers.map((customer: any) => ({
        type: 'customer',
        id: customer.id,
        title: customer.name,
        subtitle: customer.email,
        created_at: customer.created_at
      }))

      // Combine and sort results by created_at
      searchResults.value = [...chargeResults, ...customerResults].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error performing global search:', err)
    } finally {
      loading.value = false
    }
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    error.value = null
  }

  return {
    searchQuery,
    searchResults,
    loading,
    error,
    isOpen,
    search,
    clearSearch
  }
} 