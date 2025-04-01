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
                แก้ไขข้อมูลลูกค้า
              </h3>
              <div class="mt-4">
                <form @submit.prevent="handleSubmit">
                  <div class="space-y-4">
                    <div>
                      <label for="name" class="block text-sm font-medium text-gray-700">ชื่อภาษาอังกฤษ</label>
                      <input
                        type="text"
                        id="name"
                        v-model="form.name"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label for="thai_name" class="block text-sm font-medium text-gray-700">ชื่อภาษาไทย</label>
                      <input
                        type="text"
                        id="thai_name"
                        v-model="form.thai_name"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700">อีเมล</label>
                      <input
                        type="email"
                        id="email"
                        v-model="form.email"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทร</label>
                      <input
                        type="tel"
                        id="phone"
                        v-model="form.phone"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        v-model="form.is_active"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label for="is_active" class="ml-2 block text-sm text-gray-900">
                        ใช้งาน
                      </label>
                    </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useShoppers } from '~/composables/useShoppers'
import type { UpdateShopperData } from '~/composables/useShoppers'

const props = defineProps<{
  isOpen: boolean
  shopperId: string
  shopper: {
    name: string
    thai_name: string
    email: string
    phone: string
    is_active: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const { updateShopper, loading, error } = useShoppers()

interface ShopperForm {
  name: string
  thai_name: string
  email: string
  phone: string
  is_active: boolean
}

const form = ref<ShopperForm>({
  name: '',
  thai_name: '',
  email: '',
  phone: '',
  is_active: true
})

const originalData = ref<ShopperForm>({
  name: '',
  thai_name: '',
  email: '',
  phone: '',
  is_active: true
})

onMounted(() => {
  if (props.shopper) {
    form.value = { ...props.shopper }
    originalData.value = { ...props.shopper }
  }
})

const handleSubmit = async () => {
  try {
    // Only include fields that have been changed
    const updatedFields: UpdateShopperData = {}
    Object.keys(form.value).forEach((key) => {
      const typedKey = key as keyof ShopperForm
      if (form.value[typedKey] !== originalData.value[typedKey]) {
        // Handle each field type separately
        if (typedKey === 'is_active') {
          updatedFields[typedKey] = form.value[typedKey] as boolean
        } else {
          updatedFields[typedKey] = form.value[typedKey] as string
        }
      }
    })

    // Only make the API call if there are changes
    if (Object.keys(updatedFields).length > 0) {
      await updateShopper(props.shopperId, updatedFields)
      emit('updated')
      emit('close')
    } else {
      emit('close') // Close modal if no changes were made
    }
  } catch (err) {
    console.error('Error updating shopper:', err)
  }
}
</script> 