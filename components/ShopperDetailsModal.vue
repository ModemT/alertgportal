<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
          </div>

          <!-- Content -->
          <div v-else>
            <!-- Shopper Info -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                    {{ getInitials(shopper?.name || '') }}
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">{{ shopper?.name }}</h3>
                    <div class="mt-1 text-sm text-gray-500">
                      <p>{{ shopper?.email }}</p>
                      <p>{{ shopper?.phone }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">เข้าร่วมเมื่อ</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDate(shopper?.created_at) }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">เลขบัญชี</p>
                  <p class="text-sm font-medium text-gray-900">{{ shopper?.account }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">รหัสลูกค้า</p>
                  <p class="text-sm font-medium text-gray-900">{{ shopper?.id }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">มูลค่าการชำระเงินทั้งหมด</p>
                  <p class="text-sm font-medium text-gray-900">฿{{ formatCurrency(shopper?.total_completed_charges?.THB || '0') }}</p>
                </div>
              </div>

              <!-- Refund Form -->
              <div class="mt-6">
                <button 
                  @click="showRefundForm = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  สร้างการคืนเงิน
                </button>
              </div>

              <!-- Refund Modal -->
              <div v-if="showRefundForm" class="fixed inset-0 z-[60] overflow-y-auto">
                <div class="flex items-center justify-center min-h-full p-4">
                  <div class="fixed inset-0 transition-opacity">
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <div class="relative inline-block w-full bg-white rounded-lg text-left shadow-xl transform transition-all max-w-[90%] sm:max-w-lg sm:my-8">
                    <div class="bg-white px-3 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
                      <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">สร้างการคืนเงิน</h3>
                      <form @submit.prevent="handleRefund" class="space-y-4">
                        <div class="mb-3 sm:mb-4">
                          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">จำนวนเงิน</label>
                          <div class="mt-1 relative rounded-md shadow-sm">
                            <div class="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                              <span class="text-gray-500 text-xs sm:text-sm">฿</span>
                            </div>
                            <input
                              type="number"
                              v-model="refundForm.amount"
                              class="focus:ring-primary-500 focus:border-primary-500 block w-full pl-6 sm:pl-7 pr-10 sm:pr-12 text-xs sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              required
                            />
                            <div class="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                              <span class="text-gray-500 text-xs sm:text-sm">THB</span>
                            </div>
                          </div>
                        </div>
                        <div class="mb-3 sm:mb-4">
                          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                          <textarea
                            v-model="refundForm.description"
                            rows="3"
                            class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full text-xs sm:text-sm border-gray-300 rounded-md"
                            placeholder="ระบุรายละเอียดการคืนเงิน"
                            required
                          ></textarea>
                        </div>
                        <div class="bg-gray-50 px-3 py-3 sm:px-6 mt-4">
                          <div class="flex flex-col-reverse sm:grid sm:grid-cols-2 sm:gap-3">
                            <button
                              type="button"
                              @click="showRefundForm = false"
                              class="mt-2 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 sm:px-4 py-2 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              ยกเลิก
                            </button>
                            <button
                              type="submit"
                              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-red-600 text-xs sm:text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              :disabled="loading"
                            >
                              ยืนยันการคืนเงิน
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
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
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="charge in charges" :key="charge.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{{ charge.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(charge.created_at) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">฿{{ formatCurrency(charge.amount) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="getStatusClass(charge.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {{ getStatusText(charge.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ charge.description || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            @click="close"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useShopperDetails } from '~/composables/useShopperDetails'

const props = defineProps<{
  isOpen: boolean
  shopperId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { shopper, charges, loading, error, fetchShopperDetails, fetchShopperCharges, createRefund } = useShopperDetails()

const showRefundForm = ref(false)
const refundForm = ref({
  amount: '',
  description: '',
  currency: 'THB',
  charge_metadata: {}
})

const close = () => {
  emit('close')
}

const handleRefund = async () => {
  try {
    await createRefund(props.shopperId, {
      amount: Number(refundForm.value.amount),
      description: refundForm.value.description,
      currency: refundForm.value.currency,
      charge_metadata: refundForm.value.charge_metadata
    })
    showRefundForm.value = false
    refundForm.value = {
      amount: '',
      description: '',
      currency: 'THB',
      charge_metadata: {}
    }
  } catch (err) {
    // Error is already handled in createRefund
    console.error('Failed to create refund:', err)
  }
}

const getInitials = (name: string) => {
  if (!name) return ''
  return name.split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseFloat(value.toString()))
}

const getStatusClass = (status: string) => {
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
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
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
    default:
      return status
  }
}

watch(() => props.isOpen, async (newValue) => {
  if (newValue && props.shopperId) {
    await Promise.all([
      fetchShopperDetails(props.shopperId),
      fetchShopperCharges(props.shopperId)
    ])
  }
})
</script> 