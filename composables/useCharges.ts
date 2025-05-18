import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useAuth } from '~/composables/useAuth'

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

export interface PaginatedCharges {
  charges: Charge[];
  next_cursor: string | null;
  has_more: boolean;
  total: number | null;
  filtered_total: number | null;
  page: number | null;
  page_size: number | null;
  total_pages: number | null;
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
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'amount' | 'status';
  sort_order?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  currency?: string;
  status?: string;
  search?: string;
  search_term?: string;
  shopper_search_term?: string;
  include_filtered_total?: boolean;
}

export const useCharges = () => {
  const config = useRuntimeConfig()
  const { partnerId } = useAuth()
  const apiBase = config.public.apiBase as string
  const charges = ref<Charge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  const maxRetries = 3
  
  // Pagination state
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalItems = ref<number | null>(null)
  const totalFilteredItems = ref<number | null>(null)
  const totalPages = ref<number | null>(null)

  const fetchCharges = async (options: FetchChargesOptions = {}): Promise<PaginatedCharges> => {
    try {
      loading.value = true
      error.value = null
      
      // Build query parameters
      const params = new URLSearchParams()
      
      // Page-based pagination
      if (options.page) params.append('page', options.page.toString())
      if (options.page_size) params.append('page_size', options.page_size.toString())
      
      // Filter parameters
      if (options.sort_by) params.append('sort_by', options.sort_by)
      if (options.sort_order) params.append('sort_order', options.sort_order)
      if (options.start_date) params.append('start_date', options.start_date)
      if (options.end_date) params.append('end_date', options.end_date)
      if (options.min_amount !== undefined) params.append('min_amount', options.min_amount.toString())
      if (options.max_amount !== undefined) params.append('max_amount', options.max_amount.toString())
      if (options.currency) params.append('currency', options.currency)
      if (options.status) params.append('status', options.status)
      
      // Handle search parameters - prefer search_term over search for consistency with backend
      if (options.search_term) {
        params.append('search_term', options.search_term)
      } else if (options.search) {
        params.append('search_term', options.search)
      }
      
      // Handle shopper search parameter
      if (options.shopper_search_term) {
        params.append('shopper_search_term', options.shopper_search_term)
      }
      
      // Always include filtered total for better UX
      params.append('include_filtered_total', 'true')
      
      // Fetch charges
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
      
      // Add authentication headers
      const token = localStorage.getItem('token')
      if (token) {
        headers['access-token'] = token
      }
      if (partnerId.value) {
        headers['x-partner-id'] = partnerId.value
      }
      
      const response = await fetch(
        `${apiBase}/charges?${params.toString()}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PaginatedCharges = await response.json()
      retryCount.value = 0 // Reset retry count on success
      
      // Update pagination state
      if (data.page !== null) {
        currentPage.value = data.page
      }
      if (data.page_size !== null) {
        pageSize.value = data.page_size
      }
      totalItems.value = data.total
      totalFilteredItems.value = data.filtered_total
      totalPages.value = data.total_pages
      
      return data
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
      
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
      
      // Add authentication headers
      const token = localStorage.getItem('token')
      if (token) {
        headers['access-token'] = token
      }
      if (partnerId.value) {
        headers['x-partner-id'] = partnerId.value
      }
      
      const response = await fetch(`${apiBase}/charges/${chargeId}`, { headers })

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
      
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
      
      // Add authentication headers
      const token = localStorage.getItem('token')
      if (token) {
        headers['access-token'] = token
      }
      if (partnerId.value) {
        headers['x-partner-id'] = partnerId.value
      }
      
      const response = await fetch(`${apiBase}/charges/${chargeId}/cancel`, {
        method: 'POST',
        headers
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

  // Helper for page-based pagination
  const changePage = async (page: number, options: Omit<FetchChargesOptions, 'page'> = {}) => {
    if (page <= 0 || (totalPages.value !== null && page > totalPages.value)) {
      return
    }
    
    currentPage.value = page
    const result = await fetchCharges({
      page,
      page_size: pageSize.value,
      ...options
    })
    
    charges.value = result.charges
    return result
  }

  // Helper for changing page size
  const changePageSize = async (size: number, options: Omit<FetchChargesOptions, 'page_size'> = {}) => {
    if (size <= 0) {
      console.warn('Invalid page size:', size);
      return;
    }
    pageSize.value = size;
    return changePage(1, options); // Reset to first page when changing page size
  }

  // Helper for applying filters
  const applyFilters = async (options: FetchChargesOptions = {}) => {
    return changePage(1, options) // Reset to first page when applying filters
  }

  return {
    charges,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalFilteredItems,
    totalPages,
    fetchCharges,
    getCharge,
    cancelCharge,
    changePage,
    changePageSize,
    applyFilters
  }
} 