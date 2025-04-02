<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">รายการชำระเงิน</h1>
      <button class="btn btn-primary text-sm">สร้างการชำระเงินใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div v-if="timeFilter === 'custom'" class="col-span-1 sm:col-span-2">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
              <input 
                type="date" 
                v-model="startDate" 
                class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input 
                type="date" 
                v-model="endDate" 
                class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาการชำระเงิน..." class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
        </div>
        <div class="flex items-end">
          <button 
            @click="exportToCSV" 
            class="btn btn-secondary text-sm w-full"
            :disabled="isExporting"
          >
            {{ isExporting ? 'กำลังส่งออก...' : 'ส่งออก CSV' }}
          </button>
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
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่อัปเดต</th>
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
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ formatDate(charge.updated_at) }}</td>
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
          แสดง {{ charges.length }} รายการ
        </div>
        <div class="flex items-center">
          <button 
            v-if="hasMore"
            @click="loadMore"
            :disabled="loading"
            :class="{'opacity-50 cursor-not-allowed': loading}"
            class="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม' }}
          </button>
          <span v-else class="text-sm text-gray-500">ไม่มีข้อมูลเพิ่มเติม</span>
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

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useCharges } from '~/composables/useCharges'
import ChargeDetailsModal from '~/components/ChargeDetailsModal.vue'

const { charges, loading, error, fetchCharges } = useCharges()

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)
const isModalOpen = ref(false)
const selectedChargeId = ref('')
const statusFilter = ref('')
const timeFilter = ref('')
const searchQuery = ref('')
const startDate = ref('')
const endDate = ref('')
const isExporting = ref(false)
const nextCursor = ref<string | null>(null)
const hasMore = ref(true)

const filteredCharges = computed(() => {
  let filtered = [...charges.value]

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(charge => charge.status === statusFilter.value)
  }

  // Filter by time range
  if (timeFilter.value === 'custom' && startDate.value && endDate.value) {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999) // Set to end of day
    
    filtered = filtered.filter(charge => {
      const chargeDate = new Date(charge.created_at)
      return chargeDate.getTime() >= start.getTime() && chargeDate.getTime() <= end.getTime()
    })
  } else if (timeFilter.value && timeFilter.value !== 'custom') {
    const days = parseInt(timeFilter.value)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    filtered = filtered.filter(charge => new Date(charge.created_at).getTime() >= cutoffDate.getTime())
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

  // Sort by created_at in descending order (newest first)
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const paginatedCharges = computed(() => {
  return filteredCharges.value
})

const updatePagination = () => {
  totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value)
  if (currentPage.value > totalPages.value) {
    currentPage.value = Math.max(1, totalPages.value)
  }
}

// Watch filters to update pagination
watch([statusFilter, timeFilter, searchQuery, startDate, endDate], () => {
  currentPage.value = 1 // Reset to first page when filters change
  nextCursor.value = null // Reset cursor when filters change
  fetchPage()
})

// Watch for timeFilter changes to reset date range
watch(timeFilter, (newValue) => {
  if (newValue !== 'custom') {
    startDate.value = ''
    endDate.value = ''
  }
})

const fetchPage = async (): Promise<void> => {
  try {
    loading.value = true
    const result = await fetchCharges(nextCursor.value || undefined, itemsPerPage.value)
    if (nextCursor.value === null) {
      // First page
      charges.value = result.data
    } else {
      // Append to existing data
      charges.value = [...charges.value, ...result.data]
    }
    nextCursor.value = result.nextCursor
    hasMore.value = result.hasMore
    totalItems.value = charges.value.length
    updatePagination()
  } catch (err) {
    console.error('Error fetching charges:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch charges'
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  await fetchPage()
}

// Load more when scrolling to bottom
const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
    loadMore()
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const result = await fetchCharges(undefined, itemsPerPage.value)
    charges.value = result.data
    nextCursor.value = result.nextCursor
    hasMore.value = result.hasMore
    totalItems.value = charges.value.length
    updatePagination()
  } catch (err) {
    console.error('Error fetching initial charges:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch charges'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getStatusClass = (status: string): string => {
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

const getStatusText = (status: string): string => {
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

const openChargeDetails = (chargeId: string): void => {
  selectedChargeId.value = chargeId
  isModalOpen.value = true
}

const closeChargeDetails = (): void => {
  isModalOpen.value = false
  selectedChargeId.value = ''
}

const exportToCSV = () => {
  try {
    isExporting.value = true
    
    // Get filtered charges based on date range
    let filteredData = [...charges.value]
    
    // Apply date range filter
    if (timeFilter.value === 'custom' && startDate.value && endDate.value) {
      const start = new Date(startDate.value)
      const end = new Date(endDate.value)
      end.setHours(23, 59, 59, 999) // Set to end of day
      
      filteredData = filteredData.filter(charge => {
        const chargeDate = new Date(charge.created_at)
        return chargeDate.getTime() >= start.getTime() && chargeDate.getTime() <= end.getTime()
      })
    } else if (timeFilter.value && timeFilter.value !== 'custom') {
      const days = parseInt(timeFilter.value)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      filteredData = filteredData.filter(charge => new Date(charge.created_at).getTime() >= cutoffDate.getTime())
    }

    // Apply status filter
    if (statusFilter.value) {
      filteredData = filteredData.filter(charge => charge.status === statusFilter.value)
    }

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filteredData = filteredData.filter(charge => 
        charge.id.toLowerCase().includes(query) ||
        charge.description?.toLowerCase().includes(query) ||
        charge.shopper_id?.toLowerCase().includes(query) ||
        charge.amount.toString().includes(query)
      )
    }

    // Sort by created_at in descending order
    filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Prepare CSV data
    const headers = [
      'รหัส',
      'รหัสผู้ซื้อ',
      'รายละเอียด',
      'จำนวนเงิน',
      'สกุลเงิน',
      'สถานะ',
      'วันที่สร้าง',
      'วันที่อัปเดต'
    ]

    const csvData = filteredData.map(charge => [
      charge.id,
      charge.shopper_id || '',
      charge.description || '',
      charge.amount,
      charge.currency,
      getStatusText(charge.status),
      formatDate(charge.created_at),
      formatDate(charge.updated_at)
    ])

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ CSV')
  } finally {
    isExporting.value = false
  }
}

const nextPage = (): void => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = (): void => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page: number): void => {
  currentPage.value = page
}
</script> 