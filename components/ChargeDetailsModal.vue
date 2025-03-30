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
            <!-- Charge Info -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                    ฿
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900">รายละเอียดการชำระเงิน</h3>
                    <div class="mt-1 text-sm text-gray-500">
                      <p>รหัส: {{ charge?.id }}</p>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">วันที่สร้าง</p>
                  <p class="text-sm font-medium text-gray-900">{{ formatDate(charge?.created_at) }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">จำนวนเงิน</p>
                  <p class="text-sm font-medium text-gray-900">฿{{ formatCurrency(charge?.amount || '0') }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">รหัสลูกค้า</p>
                  <p class="text-sm font-medium text-gray-900">{{ charge?.shopper_id }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">สถานะ</p>
                  <span :class="getStatusClass(charge?.status || '')" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(charge?.status || '') }}
                  </span>
                </div>
              </div>

              <div class="mt-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">รายละเอียด</p>
                  <p class="text-sm font-medium text-gray-900">{{ charge?.description || '-' }}</p>
                </div>
              </div>

              <div v-if="charge?.charge_metadata && Object.keys(charge.charge_metadata).length > 0" class="mt-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500">ข้อมูลเพิ่มเติม</p>
                  <pre class="text-sm font-medium text-gray-900 mt-2">{{ JSON.stringify(charge.charge_metadata, null, 2) }}</pre>
                </div>
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
import { useChargeDetails } from '~/composables/useChargeDetails'

const props = defineProps<{
  isOpen: boolean
  chargeId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { charge, loading, error, fetchChargeDetails } = useChargeDetails()

const close = () => {
  emit('close')
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
  if (newValue && props.chargeId) {
    await fetchChargeDetails(props.chargeId)
  }
})
</script> 