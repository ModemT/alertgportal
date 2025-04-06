<template>
  <Modal :is-open="isOpen" @close="handleClose" size="xl">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-gray-900">รายละเอียดลูกค้า</h3>
    </template>
    
    <template #body>
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
      </div>
      
      <div v-else>
        <!-- Shopper Information -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                {{ getInitials(shopper?.name || '') }}
              </div>
              <div class="ml-4">
                <h4 class="text-lg font-medium text-gray-900">{{ shopper?.name }}</h4>
                <p class="text-sm text-gray-500">{{ shopper?.thai_name }}</p>
                <p class="text-sm text-gray-500">รหัส: {{ shopper?.id }}</p>
              </div>
            </div>
            <button
              @click="openWithdrawalModal()"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ถอนเงิน
            </button>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">อีเมล</p>
              <p class="mt-1">{{ shopper?.email }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">เบอร์โทร</p>
              <p class="mt-1">{{ shopper?.phone }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">เลขบัญชี</p>
              <p class="mt-1">{{ shopper?.account }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">ธนาคาร</p>
              <p class="mt-1">{{ shopper?.bank }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">วันที่เข้าร่วม</p>
              <p class="mt-1">{{ formatDate(shopper?.created_at) }}</p>
            </div>
          </div>

          <!-- Total Value Card -->
          <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-800">มูลค่ารวม</p>
                <p class="mt-1 text-2xl font-bold text-blue-900">{{ formatCurrency(shopper?.total_completed_charges?.THB || 0) }}</p>
              </div>
              <div class="bg-blue-100 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Charges Table -->
        <div class="mt-8">
          <h4 class="text-lg font-medium text-gray-900 mb-4">ประวัติการชำระเงิน</h4>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสการชำระเงิน</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="charge in charges" :key="charge.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(charge.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ charge.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ charge.description }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatCurrency(charge.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(charge.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatusText(charge.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Load More Button -->
          <div class="flex justify-center mt-6">
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
    </template>
  </Modal>

  <!-- Refund Modal -->
  <RefundModal
    :is-open="isRefundModalOpen"
    :shopper-id="props.shopperId"
    :charge="selectedCharge"
    @close="closeRefundModal"
    @refunded="handleRefunded"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import Modal from './Modal.vue'
import RefundModal from './RefundModal.vue'
import { useShopperDetails } from '~/composables/useShopperDetails'
import { useShopperCharges } from '~/composables/useShopperCharges'

const props = defineProps<{
  isOpen: boolean
  shopperId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { shopper, loading: shopperLoading, error: shopperError, fetchShopperDetails } = useShopperDetails()
const { charges, loading: chargesLoading, error: chargesError, hasMore, nextCursor, loadCharges, reset } = useShopperCharges()

const loading = computed(() => shopperLoading.value || chargesLoading.value)
const error = computed(() => shopperError.value || chargesError.value)

const isRefundModalOpen = ref(false)
const selectedCharge = ref<any>(null)

const handleClose = () => {
  emit('close')
  reset()
}

const openWithdrawalModal = () => {
  selectedCharge.value = {
    id: null,
    amount: 0,
    currency: 'THB',
    description: '',
    status: 'pending'
  }
  isRefundModalOpen.value = true
}

const closeRefundModal = () => {
  isRefundModalOpen.value = false
  selectedCharge.value = null
}

const handleRefunded = async () => {
  await loadCharges(props.shopperId)
}

const loadMore = async () => {
  if (!hasMore.value || loading.value) return
  await loadCharges(props.shopperId, nextCursor.value || undefined)
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
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

const formatCurrency = (value: number): string => {
  return '฿' + new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    case 'refunded':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'สำเร็จ'
    case 'pending':
      return 'รอดำเนินการ'
    case 'failed':
      return 'ล้มเหลว'
    case 'cancelled':
      return 'ยกเลิก'
    case 'refunded':
      return 'คืนเงิน'
    default:
      return status
  }
}

const openRefundModal = (charge: any) => {
  selectedCharge.value = charge
  isRefundModalOpen.value = true
}

watch(() => props.isOpen, async (newValue) => {
  if (newValue && props.shopperId) {
    reset()
    await Promise.all([
      fetchShopperDetails(props.shopperId),
      loadCharges(props.shopperId)
    ])
  }
})
</script> 