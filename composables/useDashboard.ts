import { ref, onUnmounted } from 'vue'
import { useRuntimeConfig } from '#app'

export interface MonthlyData {
  month: string
  completed_amount: string
  refunded_amount: string
}

export interface PaymentDetails {
  sender_name: string
  sender_account: string
  receiver_name: string
  receiver_account: string
  amount: number
  bank: string
}

export interface ChargeMetadata {
  transaction_reference?: string
  payment_details?: PaymentDetails
  refund_reason?: string
}

export interface LatestCharge {
  id: string
  amount: string
  currency: string
  status: string
  description: string
  charge_metadata: ChargeMetadata | null
  partner_id: string
  shopper_id: string
  created_at: string
  updated_at: string | null
}

export interface ShopperStats {
  total_shoppers: number
  shopper_growth_percent: number
}

export interface PaymentMethod {
  bank_name: string
  count: number
  percentage: number
}

export interface DashboardStats {
  totalCustomers: number
  totalAmountCurrentMonth: string
  refundedAmountCurrentMonth: string
  pendingAmountCurrentMonth: string
  date: string
  monthlyData: MonthlyData[]
  shoppers: ShopperStats
  latest_charges: LatestCharge[]
  payment_methods: PaymentMethod[]
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
    monthlyData: [],
    shoppers: {
      total_shoppers: 0,
      shopper_growth_percent: 0
    },
    latest_charges: [],
    payment_methods: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  let pollingInterval: NodeJS.Timeout | null = null

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
        monthlyData,
        shoppers: {
          total_shoppers: data.shoppers?.total_shoppers || 0,
          shopper_growth_percent: data.shoppers?.shopper_growth_percent || 0
        },
        latest_charges: data.latest_charges || [],
        payment_methods: data.payment_methods || []
      }
      console.log('Updated stats value:', stats.value)
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
    loading,
    error,
    fetchDashboardData,
    startPolling,
    stopPolling
  }
} 