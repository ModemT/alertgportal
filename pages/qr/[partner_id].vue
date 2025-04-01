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
const shopperAccount = ref<string>('')
const shopperId = ref<string>((route.query.shopper_id as string) || '')

const isLoading = ref<boolean>(false)
const errorMessage = ref<string | null>(null)
const chargeId = ref<string | null>(null)
const chargeStatus = ref<string>('pending')
const chargeDescription = ref<string>('')
const previousDescription = ref<string>('')
const statusCheckInterval = ref<number | null>(null)
const showQRCode = ref<boolean>(false)
const timeLeft = ref<number>(45 * 60) // 45 minutes in seconds
const timerInterval = ref<number | null>(null)

// Validate that either shopper_id or shopper_account is provided
if (!shopperId.value && !shopperAccount) {
  errorMessage.value = 'กรุณาระบุรหัสผู้ซื้อหรือเลขบัญชีผู้ซื้อ'
}

// Fetch shopper details if account is provided
const fetchShopperByAccount = async () => {
  if (!shopperAccount) return

  try {
    const response = await fetch(`${apiBase}/shoppers/account/${shopperAccount}`, {
      headers: {
        'accept': 'application/json',
        'access-token': localStorage.getItem('token') || ''
      }
    })

    if (!response.ok) {
      throw new Error('ไม่พบข้อมูลผู้ซื้อ')
    }

    const data = await response.json()
    shopperId.value = data.id
    shopperAccount.value = data.account
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ซื้อ'
    console.error('Error fetching shopper:', err)
  }
}

// Fetch shopper details by ID
const fetchShopperById = async (id: string) => {
  try {
    const response = await fetch(`${apiBase}/shoppers/${id}`, {
      headers: {
        'accept': 'application/json',
        'access-token': localStorage.getItem('token') || ''
      }
    })

    if (!response.ok) {
      throw new Error('ไม่พบข้อมูลผู้ซื้อ')
    }

    const data = await response.json()
    shopperAccount.value = data.account
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ซื้อ'
    console.error('Error fetching shopper:', err)
  }
}

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
    // Check if description has changed in pending state
    if (chargeStatus.value === 'pending' && data.description !== previousDescription.value && previousDescription.value !== '') {
      // Show toast message
      const toast = document.createElement('div')
      toast.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-gray-200'
      toast.innerHTML = `
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">รายละเอียดการชำระเงินมีการเปลี่ยนแปลง</p>
            <p class="mt-1 text-sm text-gray-500">${data.description}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="inline-flex text-gray-400 hover:text-gray-500">
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
    }
    chargeDescription.value = data.description
    previousDescription.value = data.description

    // If charge is completed or cancelled, stop checking
    if (data.status === 'completed' || data.status === 'cancelled') {
      if (statusCheckInterval.value) {
        clearInterval(statusCheckInterval.value)
        statusCheckInterval.value = null
      }
      // Stop the timer when charge is completed or cancelled
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
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
    // Stop the timer when charge is cancelled
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
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

    // If only shopper_account is provided, make sure we have fetched the shopper_id
    if (!shopperId.value && shopperAccount) {
      await fetchShopperByAccount()
    } else if (shopperId.value) {
      // If we have shopper ID, fetch the account number
      await fetchShopperById(shopperId.value)
    }

    if (!shopperId.value) {
      throw new Error('ไม่พบข้อมูลผู้ซื้อ')
    }

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
        shopper_id: shopperId.value
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'ไม่สามารถสร้างการชำระเงินได้')
    }

    const data = await response.json()
    chargeId.value = data.id
    chargeStatus.value = data.status
    chargeDescription.value = data.description
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
  if (chargeId.value && chargeStatus.value === 'pending') {
    // Show confirmation dialog
    event.preventDefault()
    event.returnValue = 'การออกจากหน้านี้จะทำให้การชำระเงินถูกยกเลิก คุณต้องการออกจากหน้านี้ใช่หรือไม่?'
    
    // If user confirms leaving, use sendBeacon for reliable sending during page unload
    if (confirm('การออกจากหน้านี้จะทำให้การชำระเงินถูกยกเลิก คุณต้องการออกจากหน้านี้ใช่หรือไม่?')) {
      const data = new FormData()
      data.append('charge_id', chargeId.value)
      navigator.sendBeacon(`${apiBase}/charges/${chargeId.value}/cancel`, data)
    }
    
    return event.returnValue
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
onMounted(async () => {
  if (route.path.startsWith('/qr/')) {
    // Clear any stored redirect URL
    localStorage.removeItem('redirect')
    
    // If we have a shopper account, fetch the shopper details first
    if (shopperAccount) {
      await fetchShopperByAccount()
    } else if (shopperId.value) {
      // If we have shopper ID, fetch the account number
      await fetchShopperById(shopperId.value)
    }
    
    createCharge()
    
    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Start the timer
    startTimer()
  }
})

// Cleanup when component is unmounted
onBeforeUnmount(() => {
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
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-3 md:py-8 md:px-4">
    <div v-if="errorMessage !== null" class="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center transform transition-all duration-300 hover:shadow-2xl">
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
    <div v-else class="max-w-5xl mx-auto">
      <!-- Mobile QR Code View (Shows first on mobile) -->
      <div v-if="chargeStatus === 'pending'" class="md:hidden mb-4">
        <div class="bg-white rounded-2xl shadow-xl p-3 transform transition-all duration-300 hover:shadow-2xl">
          <div class="aspect-square">
            <img
              src="/assets/image/qr  interfood_page-0001.jpg"
              alt="QR Code ชำระเงิน"
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <!-- Left Column: Information -->
        <div class="space-y-3 md:space-y-4">
          <div class="bg-white rounded-2xl shadow-xl p-4 md:p-5 transform transition-all duration-300 hover:shadow-2xl">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h1 class="text-lg md:text-xl font-bold text-gray-800">QR Code ชำระเงิน</h1>
                <div class="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                  <span class="text-xs md:text-sm font-medium text-gray-600">เวลา: </span>
                  <span class="text-xs md:text-sm font-bold text-gray-800 ml-1">{{ formatTime(timeLeft) }}</span>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-2">
                <div class="flex justify-between items-center p-2 md:p-2.5 bg-gray-50 rounded-xl text-xs md:text-sm">
                  <span class="text-gray-600">จำนวนเงิน:</span>
                  <span class="font-medium text-gray-800">{{ amount }} {{ currency }}</span>
                </div>
                <div class="flex justify-between items-center p-2 md:p-2.5 bg-gray-50 rounded-xl text-xs md:text-sm">
                  <span class="text-gray-600">เลขที่บัญชีลูกค้า:</span>
                  <span class="font-medium text-gray-800">{{ shopperAccount || 'รอดำเนินการ' }}</span>
                </div>
                <div class="flex justify-between items-center p-2 md:p-2.5 bg-gray-50 rounded-xl text-xs md:text-sm">
                  <span class="text-gray-600">สถานะ:</span>
                  <span :class="{
                    'px-2 py-1 rounded-full text-xs font-medium': true,
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
          </div>

          <!-- Warning Messages -->
          <div class="space-y-2 md:space-y-3">
            <div class="bg-red-50 border border-red-200 rounded-xl p-2.5 md:p-3">
              <div class="flex items-start">
                <svg class="h-3.5 w-3.5 md:h-4 md:w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="text-2xs md:text-xs font-medium text-red-800 mb-0.5">คำเตือนสำคัญ</p>
                  <p class="text-2xs md:text-xs text-red-700">
                    การปิดแท็บหรือออกจากหน้านี้จะทำให้การชำระเงินถูกยกเลิกโดยอัตโนมัติ กรุณาอย่าปิดแท็บจนกว่าจะชำระเงินเสร็จสิ้น
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-2.5 md:p-3">
              <div class="flex items-start">
                <svg class="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="text-2xs md:text-xs font-medium text-yellow-800 mb-0.5">ระวังมิจฉาชีพ</p>
                  <p class="text-2xs md:text-xs text-yellow-700">
                    โปรดตรวจสอบข้อมูลการชำระเงินให้ถูกต้อง อย่าสแกน QR Code จากแหล่งที่ไม่น่าเชื่อถือ และอย่าเปิดเผยข้อมูลส่วนตัวของคุณให้กับบุคคลอื่น หากพบเห็นการกระทำที่น่าสงสัย กรุณาแจ้งเจ้าหน้าที่ทันที
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-2 md:flex md:justify-start md:space-x-4">
            <button
              @click="handleSaveQRCode"
              :disabled="isLoading"
              :class="[
                'w-full md:w-auto px-3 py-2 rounded-xl font-medium text-white transition-all duration-300 text-xs md:text-sm',
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 active:bg-blue-700 md:hover:bg-blue-700'
              ]"
            >
              {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก QR Code' }}
            </button>
            <button
              @click="handleCancel"
              :disabled="isLoading || !chargeId"
              :class="[
                'w-full md:w-auto px-3 py-2 rounded-xl font-medium text-white transition-all duration-300 text-xs md:text-sm',
                isLoading || !chargeId ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 active:bg-red-700 md:hover:bg-red-700'
              ]"
            >
              {{ isLoading ? 'กำลังยกเลิก...' : 'ยกเลิกการชำระเงิน' }}
            </button>
          </div>
        </div>

        <!-- Right Column: QR Code (Desktop) -->
        <div v-if="chargeStatus === 'pending'" class="hidden md:block md:sticky md:top-8">
          <div class="bg-white rounded-2xl shadow-xl p-4 transform transition-all duration-300 hover:shadow-2xl">
            <div class="aspect-square">
              <img
                src="/assets/image/qr  interfood_page-0001.jpg"
                alt="QR Code ชำระเงิน"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <!-- Completed State -->
        <div v-else-if="chargeStatus === 'completed'" class="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
          <div class="h-20 w-20 md:h-24 md:w-24 bg-green-50 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg class="h-10 w-10 md:h-12 md:w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-green-600 text-sm md:text-base font-medium">ชำระเงินสำเร็จ</p>
          <p class="text-gray-600 mt-2 text-xs md:text-sm">กรุณาปิดแท็บนี้</p>
        </div>

        <!-- Cancelled State -->
        <div v-else-if="chargeStatus === 'cancelled'" class="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
          <div class="h-20 w-20 md:h-24 md:w-24 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg class="h-10 w-10 md:h-12 md:w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-gray-600 text-xs md:text-sm">การชำระเงินถูกยกเลิก</p>
          <p v-if="chargeDescription" class="text-gray-500 text-xs md:text-sm mt-2">{{ chargeDescription }}</p>
        </div>
      </div>

      <p v-if="errorMessage" class="text-red-500 text-2xs md:text-xs text-center mt-3 md:mt-4">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style>
.text-2xs {
  font-size: 0.625rem;
  line-height: 0.75rem;
}
</style> 