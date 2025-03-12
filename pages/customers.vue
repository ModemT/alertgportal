<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">ลูกค้า</h1>
      <button class="btn btn-primary">เพิ่มลูกค้าใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select class="input">
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เข้าร่วม</label>
          <select class="input">
            <option value="7">7 วันที่ผ่านมา</option>
            <option value="30">30 วันที่ผ่านมา</option>
            <option value="90">90 วันที่ผ่านมา</option>
            <option value="365">1 ปีที่ผ่านมา</option>
            <option value="custom">กำหนดเอง</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
          <input type="text" placeholder="ค้นหาลูกค้า..." class="input" />
        </div>
      </div>
    </div>
    
    <!-- Customers Table -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เข้าร่วม</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การชำระเงินทั้งหมด</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">มูลค่ารวม</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(customer, index) in customers" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ customer.initials }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.joined }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.payments }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">฿{{ customer.total }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(customer.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ customer.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900 mr-3">ดู</button>
                <button class="text-gray-600 hover:text-gray-900">แก้ไข</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            ก่อนหน้า
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            ถัดไป
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              แสดง <span class="font-medium">1</span> ถึง <span class="font-medium">10</span> จาก <span class="font-medium">42</span> รายการ
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">ก่อนหน้า</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100">
                2
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                5
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">ถัดไป</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const customers = [
  {
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    initials: 'สช',
    joined: '15 ม.ค. 2566',
    payments: 12,
    total: '28,450.00',
    status: 'ใช้งาน'
  },
  {
    name: 'วิภา รักเรียน',
    email: 'wipa@example.com',
    initials: 'วภ',
    joined: '3 ก.พ. 2566',
    payments: 8,
    total: '15,200.00',
    status: 'ใช้งาน'
  },
  {
    name: 'ประเสริฐ มั่งมี',
    email: 'prasert@example.com',
    initials: 'ปส',
    joined: '22 ก.พ. 2566',
    payments: 5,
    total: '9,750.00',
    status: 'ใช้งาน'
  },
  {
    name: 'กมลา สวัสดี',
    email: 'kamala@example.com',
    initials: 'กม',
    joined: '10 มี.ค. 2566',
    payments: 3,
    total: '6,400.00',
    status: 'ไม่ใช้งาน'
  },
  {
    name: 'สมศรี มีทรัพย์',
    email: 'somsri@example.com',
    initials: 'สศ',
    joined: '5 เม.ย. 2566',
    payments: 7,
    total: '12,600.00',
    status: 'ใช้งาน'
  },
  {
    name: 'สุรชัย ดีงาม',
    email: 'surachai@example.com',
    initials: 'สช',
    joined: '18 เม.ย. 2566',
    payments: 4,
    total: '7,800.00',
    status: 'ใช้งาน'
  },
  {
    name: 'นภา สุขใจ',
    email: 'napha@example.com',
    initials: 'นภ',
    joined: '2 พ.ค. 2566',
    payments: 2,
    total: '4,200.00',
    status: 'ใช้งาน'
  },
  {
    name: 'ชัยวัฒน์ รุ่งเรือง',
    email: 'chaiwat@example.com',
    initials: 'ชว',
    joined: '14 พ.ค. 2566',
    payments: 6,
    total: '11,450.00',
    status: 'ใช้งาน'
  },
  {
    name: 'วันดี มีสุข',
    email: 'wandee@example.com',
    initials: 'วด',
    joined: '29 พ.ค. 2566',
    payments: 1,
    total: '1,860.00',
    status: 'ไม่ใช้งาน'
  },
  {
    name: 'สมหมาย ใจเย็น',
    email: 'sommai@example.com',
    initials: 'สม',
    joined: '8 มิ.ย. 2566',
    payments: 3,
    total: '5,720.00',
    status: 'ใช้งาน'
  }
];

const getStatusClass = (status) => {
  switch (status) {
    case 'ใช้งาน':
      return 'bg-green-100 text-green-800';
    case 'ไม่ใช้งาน':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script> 