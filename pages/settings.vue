<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">การตั้งค่า</h1>
      <p class="text-gray-500 mt-1">จัดการการตั้งค่าบัญชีและการกำหนดค่าของคุณ</p>
    </div>
    
    <!-- Settings Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index" 
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 text-sm font-medium -mb-px',
          activeTab === tab.id 
            ? 'text-primary-600 border-b-2 border-primary-500' 
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <!-- Account Settings -->
    <div v-if="activeTab === 'account'" class="space-y-6">
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลบัญชี</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
            <input 
              type="text" 
              v-model="userForm.name"
              class="input" 
              :disabled="loading"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input 
              type="email" 
              v-model="userForm.email"
              class="input" 
              :disabled="loading"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input 
              type="tel" 
              v-model="userForm.phone"
              class="input" 
              :disabled="loading"
            />
          </div>
        </div>
        
        <div class="mt-6">
          <button 
            class="btn btn-primary"
            @click="handleUpdateUser"
            :disabled="loading"
          >
            {{ loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
          </button>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">รหัสผ่าน</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
            <input type="password" class="input" placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input type="password" class="input" placeholder="••••••••" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" class="input" placeholder="••••••••" />
          </div>
        </div>
        
        <div class="mt-6">
          <button class="btn btn-primary">อัปเดตรหัสผ่าน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'

const { user, updateUser } = useAuth()
const { getCurrentUser } = useApi()
const loading = ref(false)
const error = ref('')
const success = ref('')

const activeTab = ref('account')

const tabs = [
  { id: 'account', name: 'บัญชี' }
]

const userForm = ref({
  name: '',
  email: '',
  phone: '',
  company_name: '',
  tax_id: '',
  address: '',
  district: '',
  province: '',
  postal_code: '',
  country: 'th'
})

const fetchUserData = async () => {
  try {
    loading.value = true
    const data = await getCurrentUser()
    
    // Populate form with user data
    userForm.value = {
      username: data.username || '',
      email: data.email || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || '',
      company_name: data.company_name || '',
      tax_id: data.tax_id || '',
      address: data.address || '',
      district: data.district || '',
      province: data.province || '',
      postal_code: data.postal_code || '',
      country: data.country || 'th'
    }

  } catch (err) {
    error.value = 'Failed to load user data'
  } finally {
    loading.value = false
  }
}

const handleUpdateUser = async () => {
  try {
    loading.value = true
    await updateUser(userForm.value)
    success.value = 'User data updated successfully'
  } catch (err) {
    error.value = 'Failed to update user data'
    console.error('Error updating user:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserData()
})
</script> 