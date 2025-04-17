<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShoppers } from '~/composables/useShoppers'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const api = useApi()
const { shoppers, loading: shoppersLoading, fetchShoppers } = useShoppers()

const amount = ref<number>(5000)
const currency = ref<string>('THB')
const partnerId = ref<string>('')
const selectedShopperId = ref<string>('')
const searchQuery = ref<string>('')
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const formSubmitted = ref(false)

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

// Fetch user profile to get partner ID
const fetchUserProfile = async () => {
  try {
    const data = await api.get('/users/me')
    partnerId.value = data.partner_id
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

// Filter shoppers based on search query
const filteredShoppers = computed(() => {
  if (!searchQuery.value) return shoppers.value
  const query = searchQuery.value.toLowerCase()
  return shoppers.value.filter(shopper => 
    shopper.name.toLowerCase().includes(query) ||
    shopper.email.toLowerCase().includes(query) ||
    shopper.phone.includes(query)
  )
})

// Get selected shopper details
const selectedShopper = computed(() => {
  return shoppers.value.find(shopper => shopper.id === selectedShopperId.value)
})

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isDropdownOpen.value = false
  }
}

const handleSubmit = () => {
  formSubmitted.value = true
  
  if (!selectedShopperId.value) {
    return
  }
  
  const selectedShopper = shoppers.value.find(shopper => shopper.id === selectedShopperId.value)
  const url = `/qr/${partnerId.value}?amount=${amount.value}&currency=${currency.value}${selectedShopperId.value ? `&shopper_id=${selectedShopperId.value}` : ''}${selectedShopper?.account ? `&shopper_account=${selectedShopper.account}` : ''}`
  window.open(url, '_blank')
  formSubmitted.value = false
}

onMounted(async () => {
  try {
    await fetchUserProfile()
    const { data, hasMore } = await fetchShoppers(undefined, 100) // Fetch up to 100 shoppers for the dropdown
    if (data.length === 0) {
      console.warn('No shoppers found')
    }
  } catch (error) {
    console.error('Error initializing page:', error)
  }
  
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">ทดสอบ QR Code ชำระเงิน</h1>
        <p class="text-gray-600 mt-2">กรอกรายละเอียดการชำระเงินเพื่อทดสอบ QR Code</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">จำนวนเงิน</label>
          <input
            id="amount"
            :value="amount"
            @input="handleAmountChange"
            type="number"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">สกุลเงิน</label>
          <select
            id="currency"
            v-model="currency"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="THB">THB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label for="shopper" class="block text-sm font-medium text-gray-700 mb-2">ผู้ซื้อ <span class="text-red-500">*</span></label>
          <div class="relative" ref="dropdownRef">
            <div class="relative">
              <input
                id="shopper-search"
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาผู้ซื้อ..."
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @focus="isDropdownOpen = true"
                :class="{'border-red-500': !selectedShopperId && formSubmitted}"
              />
              <button
                type="button"
                @click="isDropdownOpen = !isDropdownOpen"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- Selected shopper preview -->
            <div v-if="selectedShopper" class="mt-2 p-2 bg-gray-50 rounded-lg">
              <div class="text-sm">
                <span class="font-medium">เลือก:</span> {{ selectedShopper.name }}
              </div>
              <div class="text-xs text-gray-500">{{ selectedShopper.email }}</div>
            </div>

            <!-- Dropdown -->
            <div
              v-if="isDropdownOpen"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              <div v-if="shoppersLoading" class="p-4 text-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
              <div v-else-if="filteredShoppers.length === 0" class="p-4 text-center text-gray-500">
                ไม่พบผู้ซื้อ
              </div>
              <div v-else>
                <button
                  v-for="shopper in filteredShoppers"
                  :key="shopper.id"
                  type="button"
                  @click="selectedShopperId = shopper.id"
                  :class="[
                    'w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
                    selectedShopperId === shopper.id ? 'bg-blue-50' : ''
                  ]"
                >
                  <div class="font-medium">{{ shopper.name }}</div>
                  <div class="text-sm text-gray-500">{{ shopper.email }}</div>
                  <div class="text-sm text-gray-500">{{ shopper.phone }}</div>
                </button>
              </div>
            </div>
          </div>
          <p v-if="!selectedShopperId" class="mt-1 text-sm text-red-500">กรุณาเลือกผู้ซื้อ</p>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl">
          <h3 class="text-sm font-medium text-gray-700 mb-2">ข้อมูลที่กรอกไว้</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <p><span class="font-medium">รหัสพาร์ทเนอร์:</span> {{ partnerId }}</p>
            <p v-if="selectedShopperId"><span class="font-medium">รหัสผู้ซื้อที่เลือก:</span> {{ selectedShopperId }}</p>
            <p v-else class="text-red-500"><span class="font-medium">รหัสผู้ซื้อที่เลือก:</span> ยังไม่ได้เลือก</p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="!selectedShopperId"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          สร้าง QR Code
        </button>
      </form>
    </div>
  </div>
</template> 