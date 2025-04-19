import { ref, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#app'
import type { Charge } from './useCharges'
import type { Shopper } from './useShoppers'

export interface MonthlyData {
  month: string
  completed_amount: string
  refunded_amount: string
}

export interface DashboardStats {
  totalCustomers: number
  totalAmountCurrentMonth: string
  refundedAmountCurrentMonth: string
  pendingAmountCurrentMonth: string
  date: string
  monthlyData: MonthlyData[]
}

interface RecentTransaction {
  customer: {
    name: string
    email: string
    initials: string
  }
  date: string
  amount: string
  currency: string
  status: string
  method: string
}

interface PaginatedResponse<T> {
  data: T[]
  next_cursor: string | null
  has_more: boolean
}

export const useDashboard = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const stats = ref<DashboardStats>({
    totalCustomers: 0,
    totalAmountCurrentMonth: "0.00",
    refundedAmountCurrentMonth: "0.00",
    pendingAmountCurrentMonth: "0.00",
    date: new Date().toISOString(),
    monthlyData: []
  })
  const recentTransactions = ref<RecentTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let pollingInterval: NodeJS.Timeout | null = null

  const fetchCharges = async (cursor?: string, limit: number = 10): Promise<PaginatedResponse<Charge>> => {
    const formattedCursor = cursor ? new Date(cursor).toISOString() : undefined
    const response = await fetch(
      `${apiBase}/charges?limit=${limit}${formattedCursor ? `&cursor=${formattedCursor}` : ''}`,
      {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch charges')
    }

    const data = await response.json()
    return {
      data: data.charges || [],
      next_cursor: data.next_cursor || null,
      has_more: data.has_more || false
    }
  }

  const fetchShoppers = async (cursor?: string, limit: number = 10): Promise<PaginatedResponse<Shopper>> => {
    const formattedCursor = cursor ? new Date(cursor).toISOString() : undefined
    const response = await fetch(
      `${apiBase}/shoppers?limit=${limit}${formattedCursor ? `&cursor=${formattedCursor}` : ''}`,
      {
        headers: {
          'accept': 'application/json',
          'access-token': localStorage.getItem('token') || '',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch shoppers')
    }

    const data = await response.json()
    return {
      data: data.shoppers || [],
      next_cursor: data.next_cursor || null,
      has_more: data.has_more || false
    }
  }

  const fetchDashboardData = async (forceRefresh: boolean = false) => {
    try {
      loading.value = true
      error.value = null

      console.log('Fetching dashboard data from:', `${apiBase}/report/${new Date().toISOString()}`)

      const response = await fetch(
        `${apiBase}/report/${new Date().toISOString()}`,
        {
          headers: {
            'accept': 'application/json',
            'access-token': localStorage.getItem('token') || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      console.log('Received dashboard data:', data)

      // Ensure monthly_data is an array and has the correct format
      const monthlyData = Array.isArray(data.monthly_data) ? data.monthly_data.map((item: { month: string; completed_amount?: string; refunded_amount?: string }) => ({
        month: item.month,
        completed_amount: item.completed_amount || "0.00",
        refunded_amount: item.refunded_amount || "0.00"
      })) : []

      stats.value = {
        totalCustomers: data.total_customers || 0,
        totalAmountCurrentMonth: data.total_amount_current_month || "0.00",
        refundedAmountCurrentMonth: data.refunded_amount_current_month || "0.00",
        pendingAmountCurrentMonth: data.pending_amount_current_month || "0.00",
        date: data.date || new Date().toISOString(),
        monthlyData
      }
      console.log('Updated stats value:', stats.value)

      // Get recent transactions with shopper details
      const [chargesResult, shoppersResult] = await Promise.all([
        fetchCharges(undefined, 5),
        fetchShoppers(undefined, 100)
      ])

      const recentCharges = chargesResult.data
      const shoppers = shoppersResult.data

      // Create a map of shopper IDs to shopper details for faster lookup
      const shopperMap = new Map(shoppers?.map(shopper => [shopper.id, shopper]) || [])

      // Map recent transactions with shopper details
      recentTransactions.value = recentCharges.map(charge => {
        const shopper = shopperMap.get(charge.shopper_id)
        return {
          customer: {
            name: shopper?.name || charge.shopper_id,
            email: shopper?.email || '',
            initials: shopper?.name
              ? shopper.name.split(' ').map(n => n?.[0] || '').join('').toUpperCase()
              : (charge.shopper_id?.slice(0, 2) || '').toUpperCase()
          },
          date: new Date(charge.created_at).toLocaleDateString('th-TH'),
          amount: Number(charge.amount).toFixed(2),
          currency: charge.currency,
          status: charge.status,
          method: charge.charge_metadata?.payment_method || 'พร้อมเพย์'
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error fetching dashboard data:', err)
    } finally {
      loading.value = false
    }
  }

  // Start polling for updates
  const startPolling = () => {
    if (pollingInterval) return
    pollingInterval = setInterval(() => {
      fetchDashboardData(true)
    }, 30000) // Poll every 30 seconds
  }

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Clean up on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return {
    stats,
    recentTransactions,
    loading,
    error,
    fetchDashboardData,
    startPolling,
    stopPolling
  }
} 