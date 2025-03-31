<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'

definePageMeta({
  layout: 'qr'
})

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const partnerId = route.params.partner_id as string
const amount = Number(route.query.amount) || 10000 // Default to 10000 if not provided
const currency = (route.query.currency as string) || 'THB' // Default to THB if not provided
const shopperId = (route.query.shopper_id as string) || 'shp_1057e5d4-b6b2-4b53-ae63-93ca74e763ba' // Default shopper ID if not provided

const isLoading = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const chargeId = ref<string | null>(null)
const chargeStatus = ref<string>('pending')
const statusCheckInterval = ref<number | null>(null)
const showQRCode = ref<boolean>(false)
const timeLeft = ref<number>(45 * 60) // 45 minutes in seconds
const timerInterval = ref<number | null>(null)

const checkChargeStatus = async (id: string) => {
  try {
    const response = await fetch(`${apiBase}/charges/${id}`, {
      headers: {
        'accept': 'application/json',
        'x-partner-id': partnerId,
      },
    })

    if (!response.ok) {
      throw new Error('ไม่สามารถตรวจสอบสถานะการชำระเงินได้')
    }

    const data = await response.json()
    chargeStatus.value = data.status

    // If charge is completed or cancelled, stop checking
    if (data.status === 'completed' || data.status === 'cancelled') {
      if (statusCheckInterval.value) {
        clearInterval(statusCheckInterval.value)
        statusCheckInterval.value = null
      }
    }
  } catch (err) {
    console.error('Error checking charge status:', err)
  }
}

const startStatusCheck = (id: string) => {
  // Check immediately
  checkChargeStatus(id)
  // Then check every 5 seconds
  statusCheckInterval.value = window.setInterval(() => {
    checkChargeStatus(id)
  }, 5000)
}

const cancelCharge = async (id: string) => {
  try {
    isLoading.value = true
    errorMessage.value = null

    const response = await fetch(`${apiBase}/charges/${id}/cancel`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-partner-id': partnerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'ไม่สามารถยกเลิกการชำระเงินได้')
    }

    const data = await response.json()
    console.log('Charge cancelled successfully:', data)
    alert('ยกเลิกการชำระเงินเรียบร้อยแล้ว\nกรุณาปิดแท็บนี้')
    // Show a message in the UI
    errorMessage.value = 'การชำระเงินถูกยกเลิกเรียบร้อยแล้ว กรุณาปิดแท็บนี้'
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิกการชำระเงิน'
    console.error('Charge cancellation error:', err)
  } finally {
    isLoading.value = false
  }
}

const createCharge = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null

    const response = await fetch(`${apiBase}/charges`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-partner-id': partnerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        description: 'QR Code Payment',
        charge_metadata: {},
        shopper_id: shopperId
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'ไม่สามารถสร้างการชำระเงินได้')
    }

    const data = await response.json()
    chargeId.value = data.id
    chargeStatus.value = data.status
    console.log('Charge created successfully:', data)
    // Start checking status
    startStatusCheck(data.id)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน'
    console.error('Charge creation error:', err)
  } finally {
    isLoading.value = false
  }
}

// Handle tab close or navigation
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (chargeId.value) {
    // Use sendBeacon for more reliable sending during page unload
    const data = new FormData()
    data.append('charge_id', chargeId.value)
    navigator.sendBeacon(`${apiBase}/charges/${chargeId.value}/cancel`, data)
  }
}

// Add timer function
const startTimer = () => {
  // Update timer every second
  timerInterval.value = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      // Time's up, close the page
      if (chargeId.value) {
        cancelCharge(chargeId.value)
      }
      window.close()
    }
  }, 1000)
}

// Format time for display
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Create charge and handle QR page setup when mounted
onMounted(() => {
  if (route.path.startsWith('/qr/')) {
    // Clear any stored redirect URL
    localStorage.removeItem('redirect')
    createCharge()
    
    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Start the timer
    startTimer()
  }
})

// Cleanup when component is unmounted
onBeforeUnmount(() => {
  if (chargeId.value) {
    cancelCharge(chargeId.value)
  }
  if (statusCheckInterval.value) {
    clearInterval(statusCheckInterval.value)
  }
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleSaveQRCode = () => {
  try {
    isLoading.value = true
    errorMessage.value = null

    // Create a link element
    const link = document.createElement('a')
    link.href = '/assets/image/qr  interfood_page-0001.jpg'
    link.download = `qr_${partnerId}_${amount}_${currency}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก QR Code'
  } finally {
    isLoading.value = false
  }
}

const handleRetry = () => {
  createCharge()
}

const handleCancel = () => {
  if (chargeId.value) {
    if (confirm('คุณต้องการยกเลิกการชำระเงินนี้ใช่หรือไม่?')) {
      cancelCharge(chargeId.value)
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
    <div v-if="errorMessage !== null" class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-300 hover:shadow-2xl">
      <div class="mb-6">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">ข้อผิดพลาด</h1>
      <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
      <button
        @click="handleRetry"
        class="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
    <div v-else class="max-w-md w-full space-y-6">
      <div class="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-6 text-gray-800">QR Code ชำระเงิน</h1>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span class="text-gray-600">เวลาที่เหลือ:</span>
              <span class="font-medium text-gray-800">{{ formatTime(timeLeft) }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span class="text-gray-600">รหัสพาร์ทเนอร์:</span>
              <span class="font-medium text-gray-800">{{ partnerId }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span class="text-gray-600">จำนวนเงิน:</span>
              <span class="font-medium text-gray-800">{{ amount }} {{ currency }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span class="text-gray-600">รหัสผู้ซื้อ:</span>
              <span class="font-medium text-gray-800">{{ shopperId }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span class="text-gray-600">สถานะ:</span>
              <span :class="{
                'px-3 py-1 rounded-full text-sm font-medium': true,
                'bg-yellow-100 text-yellow-800': chargeStatus === 'pending',
                'bg-green-100 text-green-800': chargeStatus === 'completed',
                'bg-red-100 text-red-800': chargeStatus === 'cancelled'
              }">
                {{ 
                  chargeStatus === 'pending' ? 'รอดำเนินการ' :
                  chargeStatus === 'completed' ? 'ชำระเงินสำเร็จ' :
                  chargeStatus === 'cancelled' ? 'ยกเลิกแล้ว' :
                  chargeStatus
                }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="chargeStatus === 'pending'" class="mt-8">
          <div class="relative w-full aspect-square max-w-md mx-auto bg-white rounded-xl shadow-lg p-4 transform transition-all duration-300 hover:scale-105">
            <img
              src="/assets/image/qr  interfood_page-0001.jpg"
              alt="QR Code ชำระเงิน"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <div v-else-if="chargeStatus === 'completed'" class="mt-8 text-center">
          <div class="h-64 bg-green-50 rounded-xl mb-4 flex items-center justify-center">
            <svg class="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-green-600 text-lg font-medium">ชำระเงินสำเร็จ</p>
          <p class="text-gray-600 mt-2">กรุณาปิดแท็บนี้</p>
        </div>

        <div v-else-if="chargeStatus === 'cancelled'" class="mt-8 text-center">
          <div class="h-64 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
            <svg class="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-gray-600">การชำระเงินถูกยกเลิก</p>
        </div>
      </div>

      <div class="flex flex-col items-center space-y-4">
        <div class="flex space-x-4">
          <button
            @click="handleSaveQRCode"
            v-if="chargeStatus === 'pending'"
            :disabled="isLoading"
            :class="[
              'px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105',
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            ]"
          >
            {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก QR Code' }}
          </button>
          <button
            @click="handleCancel"
            v-if="chargeStatus === 'pending'"
            :disabled="isLoading || !chargeId"
            :class="[
              'px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105',
              isLoading || !chargeId ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            ]"
          >
            {{ isLoading ? 'กำลังยกเลิก...' : 'ยกเลิกการชำระเงิน' }}
          </button>
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template> 