<template>
  <div v-if="isAuthenticated">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-primary-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">รายได้ทั้งหมด</h3>
            <p class="text-xl sm:text-2xl font-bold text-gray-800">฿{{ Number(totalRevenue).toFixed(2) }}</p>
            <p class="text-sm text-green-500 mt-1">
              <span class="font-medium">+{{ revenueChange }}%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-secondary-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">ลูกค้า</h3>
            <p class="text-xl sm:text-2xl font-bold text-gray-800">{{ totalCustomers }}</p>
            <p class="text-sm text-green-500 mt-1">
              <span class="font-medium">+{{ customerChange }}%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-yellow-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">รอดำเนินการ</h3>
            <p class="text-xl sm:text-2xl font-bold text-gray-800">฿{{ Number(pendingAmount).toFixed(2) }}</p>
            <p class="text-sm text-red-500 mt-1">
              <span class="font-medium">+{{ pendingChange }}%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">ภาพรวมรายได้</h3>
        <div class="h-60 sm:h-80">
          <RevenueChart />
        </div>
      </div>
      
      <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">วิธีการชำระเงิน</h3>
        <div class="h-60 sm:h-80">
          <PaymentMethodsChart />
        </div>
      </div>
    </div>
    
    <!-- Recent Transactions -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">ธุรกรรมล่าสุด</h3>
        <button class="btn btn-primary text-sm">ดูทั้งหมด</button>
      </div>
      
      <div class="overflow-x-auto responsive-table">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีการชำระเงิน</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(transaction, index) in recentTransactions" :key="index">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ transaction.customer.initials }}
                  </div>
                  <div class="ml-3 sm:ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ transaction.customer.name }}</div>
                    <div class="text-xs sm:text-sm text-gray-500">{{ transaction.customer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ transaction.date }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                {{ transaction.currency === 'THB' ? '฿' : '$' }}{{ transaction.amount }}
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(transaction.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusLabel(transaction.status) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ transaction.method }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'
import RevenueChart from '~/components/RevenueChart.vue'
import PaymentMethodsChart from '~/components/PaymentMethodsChart.vue'

const { isAuthenticated, checkAuth } = useAuth()
const api = useApi()

// Dashboard stats
const totalRevenue = ref(0)
const totalCustomers = ref(0)
const pendingAmount = ref(0)
const revenueChange = ref(0)
const customerChange = ref(0)
const pendingChange = ref(0)

// Recent transactions
const recentTransactions = ref([])
const loading = ref(false)
const error = ref(null)

// Function to fetch all charges with pagination
const fetchAllCharges = async () => {
  const allCharges = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const charges = await api.get(`/charges?skip=${skip}&limit=${limit}`);
      if (!charges || charges.length === 0) {
        hasMore = false;
        break;
      }
      allCharges.push(...charges);
      if (charges.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    } catch (error) {
      console.error('Error fetching charges:', error);
      hasMore = false;
    }
  }

  return allCharges;
};

// Function to fetch all shoppers with pagination
const fetchAllShoppers = async () => {
  const allShoppers = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const shoppers = await api.get(`/shoppers?skip=${skip}&limit=${limit}`);
      if (!shoppers || shoppers.length === 0) {
        hasMore = false;
        break;
      }
      allShoppers.push(...shoppers);
      if (shoppers.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    } catch (error) {
      console.error('Error fetching shoppers:', error);
      hasMore = false;
    }
  }

  return allShoppers;
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch all charges and shoppers with pagination
    const [charges, shoppers] = await Promise.all([
      fetchAllCharges(),
      fetchAllShoppers()
    ]);
    
    // Calculate total revenue from shopper's total_completed_charges
    totalRevenue.value = shoppers.reduce((sum, shopper) => {
      return sum + Number(shopper.total_completed_charges?.THB || 0);
    }, 0);
    
    // Calculate pending amount from charges
    pendingAmount.value = charges.reduce((sum, charge) => {
      if (charge.status === 'pending') {
        const totalPaymentValue = Number(charge.amount) + 
          (Number(charge.charge_metadata?.fee || 0)) + 
          (Number(charge.charge_metadata?.tax || 0));
        return sum + totalPaymentValue;
      }
      return sum;
    }, 0);

    // Set total customers
    totalCustomers.value = shoppers.length;

    // Calculate changes by comparing with previous month
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthShoppers = shoppers.filter(shopper => {
      const shopperDate = new Date(shopper.created_at);
      return shopperDate >= currentMonth;
    });

    const previousMonthShoppers = shoppers.filter(shopper => {
      const shopperDate = new Date(shopper.created_at);
      return shopperDate >= previousMonth && shopperDate < currentMonth;
    });

    // Calculate current month revenue from current month shoppers
    const currentMonthRevenue = currentMonthShoppers.reduce((sum, shopper) => {
      return sum + Number(shopper.total_completed_charges?.THB || 0);
    }, 0);

    // Calculate previous month revenue from previous month shoppers
    const previousMonthRevenue = previousMonthShoppers.reduce((sum, shopper) => {
      return sum + Number(shopper.total_completed_charges?.THB || 0);
    }, 0);

    revenueChange.value = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Calculate customer growth
    customerChange.value = previousMonthShoppers.length > 0
      ? ((currentMonthShoppers.length - previousMonthShoppers.length) / previousMonthShoppers.length) * 100
      : 0;

    // Calculate pending amount change
    const currentMonthPending = currentMonthCharges.reduce((sum, charge) => {
      if (charge.status === 'pending') {
        const totalPaymentValue = Number(charge.amount) + 
          (Number(charge.charge_metadata?.fee || 0)) + 
          (Number(charge.charge_metadata?.tax || 0));
        return sum + totalPaymentValue;
      }
      return sum;
    }, 0);

    const previousMonthPending = previousMonthCharges.reduce((sum, charge) => {
      if (charge.status === 'pending') {
        const totalPaymentValue = Number(charge.amount) + 
          (Number(charge.charge_metadata?.fee || 0)) + 
          (Number(charge.charge_metadata?.tax || 0));
        return sum + totalPaymentValue;
      }
      return sum;
    }, 0);

    pendingChange.value = previousMonthPending > 0
      ? ((currentMonthPending - previousMonthPending) / previousMonthPending) * 100
      : 0;

    // Get recent transactions with shopper details
    const recentCharges = charges
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Create a map of shopper IDs to shopper details for faster lookup
    const shopperMap = new Map(shoppers.map(shopper => [shopper.id, shopper]));

    // Map recent transactions with shopper details
    recentTransactions.value = recentCharges.map(charge => {
      const shopper = shopperMap.get(charge.shopper_id);
      return {
        customer: {
          name: shopper?.name || charge.shopper_id,
          email: shopper?.email || '',
          initials: shopper?.name 
            ? shopper.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : charge.shopper_id.slice(0, 2).toUpperCase()
        },
        date: new Date(charge.created_at).toLocaleDateString('th-TH'),
        amount: Number(charge.amount).toFixed(2),
        currency: charge.currency,
        status: charge.status,
        method: charge.charge_metadata?.payment_method || 'พร้อมเพย์'
      };
    });

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
    console.error('Error fetching dashboard data:', err);
  } finally {
    loading.value = false;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'completed':
      return 'สำเร็จ';
    case 'pending':
      return 'รอดำเนินการ';
    case 'failed':
      return 'ล้มเหลว';
    case 'cancelled':
      return 'ยกเลิก';
    case 'refunded':
      return 'คืนเงิน';
    default:
      return status;
  }
};

onBeforeMount(async () => {
  const authenticated = await checkAuth();
  if (!authenticated) {
    navigateTo('/login');
  } else {
    await fetchDashboardData();
  }
});
</script> 