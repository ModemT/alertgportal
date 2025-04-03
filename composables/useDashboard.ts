import { ref, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#app'
import type { Charge } from './useCharges'
import type { Shopper } from './useShoppers'

interface DashboardStats {
  totalRevenue: number
  totalCustomers: number
  pendingAmount: number
  revenueChange: number
  customerChange: number
  pendingChange: number
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
    totalRevenue: 0,
    totalCustomers: 0,
    pendingAmount: 0,
    revenueChange: 0,
    customerChange: 0,
    pendingChange: 0
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

      // Fetch initial data
      const [chargesResult, shoppersResult] = await Promise.all([
        fetchCharges(undefined, 100),
        fetchShoppers(undefined, 100)
      ])

      const charges = chargesResult.data
      const shoppers = shoppersResult.data

      // Calculate total revenue from shopper's total_completed_charges
      stats.value.totalRevenue = shoppers.reduce((sum, shopper) => {
        return sum + Number(shopper.total_completed_charges?.THB || 0)
      }, 0)

      // Calculate pending amount from charges
      stats.value.pendingAmount = charges.reduce((sum, charge) => {
        if (charge.status === 'pending') {
          const totalPaymentValue = Number(charge.amount) +
            (Number(charge.charge_metadata?.fee || 0)) +
            (Number(charge.charge_metadata?.tax || 0))
          return sum + totalPaymentValue
        }
        return sum
      }, 0)

      // Set total customers
      stats.value.totalCustomers = shoppers.length

      // Calculate changes by comparing with previous month
      const currentDate = new Date()
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)

      const currentMonthShoppers = shoppers.filter(shopper => {
        const shopperDate = new Date(shopper.created_at)
        return shopperDate >= currentMonth
      })

      const previousMonthShoppers = shoppers.filter(shopper => {
        const shopperDate = new Date(shopper.created_at)
        return shopperDate >= previousMonth && shopperDate < currentMonth
      })

      // Calculate current month revenue from current month shoppers
      const currentMonthRevenue = currentMonthShoppers.reduce((sum, shopper) => {
        return sum + Number(shopper.total_completed_charges?.THB || 0)
      }, 0)

      // Calculate previous month revenue from previous month shoppers
      const previousMonthRevenue = previousMonthShoppers.reduce((sum, shopper) => {
        return sum + Number(shopper.total_completed_charges?.THB || 0)
      }, 0)

      stats.value.revenueChange = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0

      // Calculate customer growth
      stats.value.customerChange = previousMonthShoppers.length > 0
        ? ((currentMonthShoppers.length - previousMonthShoppers.length) / previousMonthShoppers.length) * 100
        : 0

      // Filter charges by month for pending amount calculations
      const currentMonthCharges = charges.filter(charge => {
        const chargeDate = new Date(charge.created_at)
        return chargeDate >= currentMonth
      })

      const previousMonthCharges = charges.filter(charge => {
        const chargeDate = new Date(charge.created_at)
        return chargeDate >= previousMonth && chargeDate < currentMonth
      })

      // Calculate pending amount change
      const currentMonthPending = currentMonthCharges.reduce((sum, charge) => {
        if (charge.status === 'pending') {
          const totalPaymentValue = Number(charge.amount) +
            (Number(charge.charge_metadata?.fee || 0)) +
            (Number(charge.charge_metadata?.tax || 0))
          return sum + totalPaymentValue
        }
        return sum
      }, 0)

      const previousMonthPending = previousMonthCharges.reduce((sum, charge) => {
        if (charge.status === 'pending') {
          const totalPaymentValue = Number(charge.amount) +
            (Number(charge.charge_metadata?.fee || 0)) +
            (Number(charge.charge_metadata?.tax || 0))
          return sum + totalPaymentValue
        }
        return sum
      }, 0)

      stats.value.pendingChange = previousMonthPending > 0
        ? ((currentMonthPending - previousMonthPending) / previousMonthPending) * 100
        : 0

      // Get recent transactions with shopper details
      const recentCharges = charges
        ? charges
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        : []

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