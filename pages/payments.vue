<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">รายการชำระเงิน</h1>
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
            <option value="pending">รอดำเนินการ</option>
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
                <div class="flex justify-end space-x-2">
                  <button @click="openChargeDetails(charge.id)" class="text-primary-600 hover:text-primary-900">ดู</button>
                  <button 
                    v-if="charge.status === 'pending'"
                    @click="openCancelConfirm(charge.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    ยกเลิก
                  </button>
                </div>
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

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelConfirm" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  ยืนยันการยกเลิกการชำระเงิน
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    คุณแน่ใจหรือไม่ที่จะยกเลิกการชำระเงินนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleCancelCharge"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ loading ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก' }}
            </button>
            <button
              type="button"
              @click="closeCancelConfirm"
              :disabled="loading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useCharges } from '~/composables/useCharges'
import ChargeDetailsModal from '~/components/ChargeDetailsModal.vue'
import { debounce } from 'lodash'

const { charges, loading, error, fetchCharges, cancelCharge } = useCharges()

const currentPage = ref(1)
const itemsPerPage = ref(50)
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
const showCancelConfirm = ref(false)
const chargeToCancel = ref<string | null>(null)

// Add debounced search function
const debouncedSearch = debounce(async () => {
  currentPage.value = 1 // Reset to first page when search changes
  nextCursor.value = null // Reset cursor when search changes
  charges.value = [] // Clear existing charges
  await fetchPage()
}, 300) // 300ms delay

// Watch searchQuery with debouncing
watch(searchQuery, (newValue) => {
  if (newValue === '') {
    // Reset and fetch immediately when search is cleared
    currentPage.value = 1
    nextCursor.value = null
    charges.value = []
    fetchPage()
  } else {
    debouncedSearch()
  }
})

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
  charges.value = [] // Clear existing charges
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
    
    // Build options for the API call
    const options = {
      cursor: nextCursor.value || undefined,
      limit: itemsPerPage.value,
      status: statusFilter.value || undefined,
      search: searchQuery.value || undefined
    }
    
    const result = await fetchCharges(options)
    
    if (nextCursor.value === null) {
      // First page
      charges.value = result.data
    } else {
      // Append to existing data
      charges.value = [...charges.value, ...result.data]
    }
    nextCursor.value = result.next_cursor
    hasMore.value = result.has_more
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
  await fetchPage()
  window.addEventListener('scroll', handleScroll)
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

const openCancelConfirm = (chargeId: string) => {
  chargeToCancel.value = chargeId
  showCancelConfirm.value = true
}

const handleCancelCharge = async () => {
  if (!chargeToCancel.value) return
  
  try {
    loading.value = true
    await cancelCharge(chargeToCancel.value)
    
    // Reset pagination and filters
    currentPage.value = 1
    nextCursor.value = null
    hasMore.value = true
    charges.value = []
    
    // Fetch fresh data
    const options = {
      limit: itemsPerPage.value,
      status: statusFilter.value || undefined,
      search: searchQuery.value || undefined
    }
    const result = await fetchCharges(options)
    charges.value = result.data
    nextCursor.value = result.next_cursor
    hasMore.value = result.has_more
    totalItems.value = charges.value.length
    updatePagination()
    
    // Close modal and reset state
    showCancelConfirm.value = false
    chargeToCancel.value = null
    
    // Show success notification
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm z-50'
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">ยกเลิกการชำระเงินสำเร็จ</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex text-green-400 hover:text-green-500">
            <span class="sr-only">ปิด</span>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    `
    document.body.appendChild(toast)
    
    // Add click handler to close button
    const closeButton = toast.querySelector('button')
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        toast.remove()
      })
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove()
    }, 5000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to cancel charge'
    // Show error notification
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm z-50'
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">ไม่สามารถยกเลิกการชำระเงินได้</p>
          <p class="mt-1 text-sm text-red-700">${error.value}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="inline-flex text-red-400 hover:text-red-500">
            <span class="sr-only">ปิด</span>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    `
    document.body.appendChild(toast)
    
    // Add click handler to close button
    const closeButton = toast.querySelector('button')
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        toast.remove()
      })
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove()
    }, 5000)
  } finally {
    loading.value = false
  }
}

const closeCancelConfirm = () => {
  showCancelConfirm.value = false
  chargeToCancel.value = null
}
</script> 