<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">รายการชำระเงิน</h1>
      <button class="btn btn-primary text-sm">สร้างการชำระเงินใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select v-model="statusFilter" class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="">ทุกสถานะ</option>
            <option value="completed">สำเร็จ</option>
            <option value="refunded">คืนเงินแล้ว</option>
            <option value="failed">ล้มเหลว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลา</label>
          <select v-model="timeFilter" class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="7">7 วันที่ผ่านมา</option>
            <option value="30">30 วันที่ผ่านมา</option>
            <option value="90">90 วันที่ผ่านมา</option>
            <option value="365">1 ปีที่ผ่านมา</option>
            <option value="custom">กำหนดเอง</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาการชำระเงิน..." class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
        </div>
      </div>
    </div>
    
    <!-- Charges Table -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div class="overflow-x-auto responsive-table">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสผู้ซื้อ</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="charge in paginatedCharges" :key="charge.id">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{{ charge.id }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ charge.shopper_id || '-' }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ charge.description || '-' }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{{ formatAmount(charge.amount) }} {{ charge.currency }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(charge.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(charge.status) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ formatDate(charge.created_at) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                <button @click="openChargeDetails(charge.id)" class="text-primary-600 hover:text-primary-900 mr-2">ดู</button>
                <button class="text-primary-600 hover:text-primary-900">แก้ไข</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-center justify-between mt-6">
        <div class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-0">
          แสดง {{ (currentPage - 1) * itemsPerPage + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, totalItems) }} จาก {{ totalItems }} รายการ
        </div>
        <div class="flex items-center">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2 disabled:opacity-50 disabled:cursor-not-allowed">
            ก่อนหน้า
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium mr-2',
              currentPage === page 
                ? 'text-white bg-primary-500 hover:bg-primary-600' 
                : 'text-gray-700 bg-white hover:bg-gray-50'
            ]">
            {{ page }}
          </button>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            ถัดไป
          </button>
        </div>
      </div>
    </div>

    <!-- Charge Details Modal -->
    <ChargeDetailsModal
      :is-open="isModalOpen"
      :charge-id="selectedChargeId"
      @close="closeChargeDetails"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '../composables/useApi'
import ChargeDetailsModal from '~/components/ChargeDetailsModal.vue'

const api = useApi()

const charges = ref([])
const statusFilter = ref('')
const timeFilter = ref('7')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const error = ref(null)
const isModalOpen = ref(false)
const selectedChargeId = ref('')

const filteredCharges = computed(() => {
  let filtered = [...charges.value]

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(charge => charge.status === statusFilter.value)
  }

  // Filter by time range
  if (timeFilter.value && timeFilter.value !== 'custom') {
    const days = parseInt(timeFilter.value)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filtered = filtered.filter(charge => new Date(charge.created_at) >= cutoffDate)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(charge => 
      charge.id.toLowerCase().includes(query) ||
      charge.description?.toLowerCase().includes(query) ||
      charge.shopper_id?.toLowerCase().includes(query) ||
      charge.amount.toString().includes(query)
    )
  }

  return filtered
})

const paginatedCharges = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCharges.value.slice(start, end)
})

const updatePagination = () => {
  totalItems.value = filteredCharges.value.length
  totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value)
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
}

// Watch filters to update pagination
watch([statusFilter, timeFilter, searchQuery], () => {
  currentPage.value = 1 // Reset to first page when filters change
  updatePagination()
})

const fetchCharges = async () => {
  try {
    loading.value = true
    const data = await api.get('/charges?skip=0&limit=100')
    charges.value = data
  } catch (error) {
    console.error('Error fetching charges:', error)
    error.value = error instanceof Error ? error.message : 'Failed to fetch charges'
  } finally {
    loading.value = false
  }
}

const formatAmount = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    case 'refunded':
      return 'bg-purple-100 text-purple-800'
    case 'pending':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'สำเร็จ'
    case 'processing':
      return 'กำลังดำเนินการ'
    case 'failed':
      return 'ล้มเหลว'
    case 'cancelled':
      return 'ยกเลิก'
    case 'refunded':
      return 'คืนเงิน'
    case 'pending':
      return 'รอดำเนินการ'
    default:
      return status
  }
}

const openChargeDetails = (chargeId) => {
  selectedChargeId.value = chargeId
  isModalOpen.value = true
}

const closeChargeDetails = () => {
  isModalOpen.value = false
  selectedChargeId.value = ''
}

onMounted(() => {
  fetchCharges()
})
</script> 