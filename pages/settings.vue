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
        <h2 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลส่วนตัว</h2>
        
        <div class="flex items-center mb-6">
          <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xl">
            สช
          </div>
          <div class="ml-4">
            <button class="btn btn-primary text-sm">เปลี่ยนรูปโปรไฟล์</button>
            <button class="btn text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 ml-2">ลบ</button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
            <input type="text" class="input" value="สมชาย" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
            <input type="text" class="input" value="ใจดี" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input type="email" class="input" value="somchai@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input type="tel" class="input" value="081-234-5678" />
          </div>
        </div>
        
        <div class="mt-6">
          <button class="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
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
    
    <!-- Payment Settings -->
    <div v-if="activeTab === 'payment'" class="space-y-6">
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">วิธีการชำระเงิน</h2>
        
        <div class="space-y-4">
          <div v-for="(method, index) in paymentMethods" :key="index" class="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <div class="flex items-center">
              <div class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900">{{ method.name }}</p>
                <p class="text-sm text-gray-500">{{ method.details }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <span v-if="method.default" class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mr-4">ค่าเริ่มต้น</span>
              <button class="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-6">
          <button class="btn btn-primary">เพิ่มวิธีการชำระเงิน</button>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลการเรียกเก็บเงิน</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท</label>
            <input type="text" class="input" value="บริษัท อเลิร์ทจี จำกัด" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
            <input type="text" class="input" value="0123456789012" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">ที่อยู่สำหรับเรียกเก็บเงิน</label>
            <input type="text" class="input" value="123 ถนนสุขุมวิท แขวงคลองเตย" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
            <input type="text" class="input" value="คลองเตย" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
            <input type="text" class="input" value="กรุงเทพมหานคร" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
            <input type="text" class="input" value="10110" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ประเทศ</label>
            <select class="input">
              <option value="th">ประเทศไทย</option>
              <option value="us">สหรัฐอเมริกา</option>
              <option value="uk">สหราชอาณาจักร</option>
              <option value="jp">ญี่ปุ่น</option>
            </select>
          </div>
        </div>
        
        <div class="mt-6">
          <button class="btn btn-primary">บันทึกการเปลี่ยนแปลง</button>
        </div>
      </div>
    </div>
    
    <!-- Notification Settings -->
    <div v-if="activeTab === 'notifications'" class="space-y-6">
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">การแจ้งเตือนทางอีเมล</h2>
        
        <div class="space-y-4">
          <div v-for="(notification, index) in emailNotifications" :key="index" class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ notification.name }}</p>
              <p class="text-sm text-gray-500">{{ notification.description }}</p>
            </div>
            <div>
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" :checked="notification.enabled" class="sr-only peer">
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-lg font-medium text-gray-900 mb-4">การแจ้งเตือนทาง SMS</h2>
        
        <div class="space-y-4">
          <div v-for="(notification, index) in smsNotifications" :key="index" class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ notification.name }}</p>
              <p class="text-sm text-gray-500">{{ notification.description }}</p>
            </div>
            <div>
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" :checked="notification.enabled" class="sr-only peer">
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('account');

const tabs = [
  { id: 'account', name: 'บัญชี' },
  { id: 'payment', name: 'วิธีการชำระเงิน' },
  { id: 'notifications', name: 'การแจ้งเตือน' }
];

const paymentMethods = [
  {
    type: 'promptpay',
    name: 'พร้อมเพย์ - เลขประจำตัวประชาชน',
    details: 'x-xxxx-xxxxx-xx-x',
    default: true
  },
  {
    type: 'promptpay',
    name: 'พร้อมเพย์ - เบอร์โทรศัพท์',
    details: '081-234-5678',
    default: false
  }
];

const emailNotifications = [
  {
    name: 'ยืนยันการชำระเงิน',
    description: 'รับอีเมลเมื่อการชำระเงินดำเนินการสำเร็จ',
    enabled: true
  },
  {
    name: 'การชำระเงินล้มเหลว',
    description: 'รับอีเมลเมื่อการชำระเงินล้มเหลว',
    enabled: true
  },
  {
    name: 'ใบแจ้งหนี้ใหม่',
    description: 'รับอีเมลเมื่อมีการสร้างใบแจ้งหนี้ใหม่',
    enabled: true
  },
  {
    name: 'การแจ้งเตือนใบแจ้งหนี้',
    description: 'รับอีเมลเมื่อใบแจ้งหนี้ใกล้ถึงกำหนดชำระ',
    enabled: false
  }
];

const smsNotifications = [
  {
    name: 'ยืนยันการชำระเงิน',
    description: 'รับ SMS เมื่อการชำระเงินดำเนินการสำเร็จ',
    enabled: false
  },
  {
    name: 'การชำระเงินล้มเหลว',
    description: 'รับ SMS เมื่อการชำระเงินล้มเหลว',
    enabled: true
  },
  {
    name: 'การแจ้งเตือนใบแจ้งหนี้',
    description: 'รับ SMS เมื่อใบแจ้งหนี้ใกล้ถึงกำหนดชำระ',
    enabled: false
  }
];
</script> 