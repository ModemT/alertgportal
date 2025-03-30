<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">ลูกค้า</h1>
      <button @click="openCreateModal" class="btn btn-primary text-sm">เพิ่มลูกค้าใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เข้าร่วม</label>
          <select class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="7">7 วันที่ผ่านมา</option>
            <option value="30">30 วันที่ผ่านมา</option>
            <option value="90">90 วันที่ผ่านมา</option>
            <option value="365">1 ปีที่ผ่านมา</option>
            <option value="custom">กำหนดเอง</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
          <input type="text" placeholder="ค้นหาลูกค้า..." class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
        </div>
      </div>
    </div>
    
    <!-- Loading and Error States -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    
    <!-- Customers Table -->
    <div v-else class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div class="overflow-x-auto responsive-table">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เบอร์โทร</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เข้าร่วม</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การชำระเงินทั้งหมด</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">มูลค่ารวม</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in shoppers" :key="customer.id">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ getInitials(customer.name) }}
                  </div>
                  <div class="ml-3 sm:ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                    <div class="text-sm text-gray-500">เลขบัญชี: {{ customer.account }}</div>
                    <div class="text-xs text-gray-400">รหัส: {{ customer.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ customer.email }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ customer.phone }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ formatDate(customer.created_at) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ customer.total_completed_charges?.THB || '0.00' }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">฿{{ formatCurrency(customer.total_completed_charges?.THB || '0.00') }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(customer.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ customer.status }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                <button @click="openShopperDetails(customer.id)" class="text-primary-600 hover:text-primary-900 mr-2">ดู</button>
                <button class="text-primary-600 hover:text-primary-900">แก้ไข</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-center justify-between mt-6">
        <div class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-0">
          แสดง {{ ((currentPage - 1) * itemsPerPage) + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, totalItems) }} จาก {{ totalItems }} รายการ
        </div>
        <div class="flex items-center">
          <button 
            @click="prevPage"
            :disabled="currentPage === 1"
            :class="{'opacity-50 cursor-not-allowed': currentPage === 1}"
            class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
          >
            ก่อนหน้า
          </button>
          <button 
            v-for="page in Math.ceil(totalItems / itemsPerPage)" 
            :key="page"
            @click="goToPage(page)"
            :class="{
              'bg-primary-500 text-white hover:bg-primary-600': currentPage === page,
              'text-gray-700 bg-white hover:bg-gray-50': currentPage !== page
            }"
            class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium mr-2"
          >
            {{ page }}
          </button>
          <button 
            @click="nextPage"
            :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage)"
            :class="{'opacity-50 cursor-not-allowed': currentPage >= Math.ceil(totalItems / itemsPerPage)}"
            class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>

    <!-- Shopper Details Modal -->
    <ShopperDetailsModal
      :is-open="isModalOpen"
      :shopper-id="selectedShopperId"
      @close="closeShopperDetails"
    />

    <!-- Create Customer Modal -->
    <CreateCustomerModal
      :is-open="isCreateModalOpen"
      @close="closeCreateModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShoppers } from '~/composables/useShoppers'
import ShopperDetailsModal from '~/components/ShopperDetailsModal.vue'
import CreateCustomerModal from '~/components/CreateCustomerModal.vue'

const { shoppers, loading, error, fetchShoppers } = useShoppers()

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const isModalOpen = ref(false)
const selectedShopperId = ref('')
const isCreateModalOpen = ref(false)

const fetchPage = async () => {
  const skip = (currentPage.value - 1) * itemsPerPage.value
  await fetchShoppers(skip, itemsPerPage.value)
}

const nextPage = () => {
  if ((currentPage.value * itemsPerPage.value) < totalItems.value) {
    currentPage.value++
    fetchPage()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchPage()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchPage()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const getInitials = (name) => {
  if (!name) return ''
  return name.split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseFloat(value))
}

const openShopperDetails = (shopperId) => {
  selectedShopperId.value = shopperId
  isModalOpen.value = true
}

const closeShopperDetails = () => {
  isModalOpen.value = false
  selectedShopperId.value = ''
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
  fetchPage() // Refresh the list after creating a new customer
}

onMounted(() => {
  fetchPage()
})
</script> 