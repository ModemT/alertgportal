<template>
  <Modal :is-open="isOpen" @close="handleClose" size="default">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-gray-900">{{ isWithdrawal ? 'ถอนเงิน' : 'คืนเงิน' }}</h3>
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
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Original Charge Info - Only show for refunds -->
          <div v-if="!isWithdrawal" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-2">ข้อมูลการชำระเงินเดิม</h4>
            <div class="space-y-2 text-sm">
              <p><span class="font-medium">รหัส:</span> {{ charge?.id }}</p>
              <p><span class="font-medium">จำนวนเงิน:</span> ฿{{ formatCurrency(charge?.amount || 0) }}</p>
              <p><span class="font-medium">รายละเอียด:</span> {{ charge?.description }}</p>
              <p><span class="font-medium">สถานะ:</span> <span :class="getStatusClass(charge?.status || '')">{{ getStatusText(charge?.status || '') }}</span></p>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700">
              {{ isWithdrawal ? 'จำนวนเงินที่ต้องการถอน' : 'จำนวนเงินที่ต้องการคืน' }}
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">THB</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                :value="amount"
                @input="handleAmountChange"
                class="focus:ring-primary-500 focus:border-primary-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
                :max="isWithdrawal ? undefined : charge?.amount"
                step="0.01"
                required
              />
            </div>
            <p v-if="!isWithdrawal" class="mt-1 text-sm text-gray-500">
              จำนวนเงินสูงสุดที่สามารถคืนได้: ฿{{ formatCurrency(charge?.amount || 0) }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              {{ isWithdrawal ? 'เหตุผลในการถอนเงิน' : 'เหตุผลในการคืนเงิน' }}
            </label>
            <div class="mt-1">
              <textarea
                id="description"
                name="description"
                v-model="description"
                rows="3"
                class="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
              ></textarea>
            </div>
          </div>

          <!-- Submit and Cancel Buttons -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="loading || !isValid"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'กำลังดำเนินการ...' : (isWithdrawal ? 'ถอนเงิน' : 'คืนเงิน') }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './Modal.vue'
import { useRuntimeConfig } from '#app'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const props = defineProps<{
  isOpen: boolean
  shopperId: string
  charge: {
    id: string | null
    amount: number
    currency: string
    description: string
    status: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'refunded'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const amount = ref(0)
const description = ref('')

// Add input sanitization function
const sanitizeAmount = (value: string): number => {
  // Remove any whitespace and convert to number
  const sanitized = value.toString().replace(/\s/g, '')
  return parseFloat(sanitized) || 0
}

// Add input handler
const handleAmountChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  amount.value = sanitizeAmount(input.value)
}

const isWithdrawal = computed(() => !props.charge?.id)

const isValid = computed(() => {
  if (isWithdrawal.value) {
    return amount.value > 0 && description.value.trim().length > 0
  } else {
    return amount.value > 0 && 
           amount.value <= (props.charge?.amount || 0) && 
           description.value.trim().length > 0
  }
})

const handleClose = () => {
  emit('close')
  error.value = null
  amount.value = 0
  description.value = ''
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-800'
    case 'pending':
      return 'text-yellow-800'
    case 'failed':
      return 'text-red-800'
    case 'cancelled':
      return 'text-gray-800'
    case 'refunded':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
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

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (!isValid.value) return

  try {
    loading.value = true
    error.value = null
    
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${apiBase}/shoppers/${props.shopperId}/refunds`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount.value,
        currency: props.charge?.currency || 'THB',
        description: description.value,
        charge_metadata: props.charge?.id ? {
          original_charge_id: props.charge.id
        } : {
          type: 'withdrawal'
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to process refund')
    }

    const data = await response.json()
    if (data.status !== 'refunded') {
      throw new Error('Refund was not successful')
    }
    
    emit('refunded')
    handleClose()
  } catch (err) {
    console.error('Error creating refund:', err)
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script> 