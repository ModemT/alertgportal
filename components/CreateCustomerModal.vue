<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                เพิ่มลูกค้าใหม่
              </h3>
              <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">ชื่อ (ภาษาอังกฤษ)</label>
                  <input
                    type="text"
                    id="name"
                    v-model="form.name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label for="thai_name" class="block text-sm font-medium text-gray-700">ชื่อ (ภาษาไทย)</label>
                  <input
                    type="text"
                    id="thai_name"
                    v-model="form.thai_name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">อีเมล</label>
                  <input
                    type="email"
                    id="email"
                    v-model="form.email"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                  <input
                    type="tel"
                    id="phone"
                    v-model="form.phone"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label for="account" class="block text-sm font-medium text-gray-700">เลขบัญชี</label>
                  <input
                    type="text"
                    id="account"
                    v-model="form.account"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label for="bank" class="block text-sm font-medium text-gray-700">ธนาคาร</label>
                  <input
                    type="text"
                    id="bank"
                    v-model="form.bank"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    :disabled="loading"
                  >
                    {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
                  </button>
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useShoppers } from '~/composables/useShoppers'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const { createShopper } = useShoppers()

const loading = ref(false)

interface ShopperForm {
  name: string
  thai_name: string
  email: string
  phone: string
  account: string
  bank: string
}

const form = ref<ShopperForm>({
  name: '',
  thai_name: '',
  email: '',
  phone: '',
  account: '',
  bank: ''
})

// Add input validation functions
const sanitizeInput = (value: string, allowSpaces: boolean = false): string => {
  if (allowSpaces) {
    return value.trim()
  }
  return value.replace(/\s/g, '')
}

const handleInputChange = (field: keyof ShopperForm, value: string) => {
  // Only allow spaces in name and thai_name fields
  const allowSpaces = field === 'name' || field === 'thai_name'
  form.value[field] = sanitizeInput(value, allowSpaces)
}

const handleSubmit = async () => {
  try {
    loading.value = true
    await createShopper(form.value)
    emit('close')
  } catch (error: any) {
    console.error('Error creating customer:', error)
    
    // Extract error message from the response
    let errorMessage = 'เกิดข้อผิดพลาดในการสร้างลูกค้า'
    
    // Check if error has a response with detail property
    if (error?.response?.detail) {
      errorMessage = error.response.detail
    } else if (error?.detail) {
      errorMessage = error.detail
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    // Create and show toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-red-200'
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">ข้อผิดพลาด</p>
          <p class="mt-1 text-sm text-gray-500">${errorMessage}</p>
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
  } finally {
    loading.value = false
  }
}
</script> 