<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">ลูกค้า</h1>
      <button class="btn btn-primary text-sm">เพิ่มลูกค้าใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เข้าร่วม</label>
          <select class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="7">7 วันที่ผ่านมา</option>
            <option value="30">30 วันที่ผ่านมา</option>
            <option value="90">90 วันที่ผ่านมา</option>
            <option value="365">1 ปีที่ผ่านมา</option>
            <option value="custom">กำหนดเอง</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
          <input type="text" placeholder="ค้นหาลูกค้า..." class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
        </div>
      </div>
    </div>
    
    <!-- Customers Table -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div class="overflow-x-auto responsive-table">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่เข้าร่วม</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การชำระเงินทั้งหมด</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">มูลค่ารวม</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ customer.initials }}
                  </div>
                  <div class="ml-3 sm:ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ customer.email }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ customer.joinDate }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ customer.totalPayments }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">฿{{ customer.totalValue }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(customer.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ customer.status }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900 mr-2">ดู</button>
                <button class="text-primary-600 hover:text-primary-900">แก้ไข</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-center justify-between mt-6">
        <div class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-0">
          แสดง 1 ถึง 10 จาก 50 รายการ
        </div>
        <div class="flex items-center">
          <button class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2">
            ก่อนหน้า
          </button>
          <button class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 mr-2">
            1
          </button>
          <button class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2">
            2
          </button>
          <button class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2">
            3
          </button>
          <button class="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const customers = [
  {
    id: 1,
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    initials: 'สช',
    joinDate: '15 มี.ค. 2566',
    totalPayments: 12,
    totalValue: '28,450.00',
    status: 'ใช้งาน'
  },
  {
    id: 2,
    name: 'วิภา รักเรียน',
    email: 'wipa@example.com',
    initials: 'วภ',
    joinDate: '3 ก.พ. 2566',
    totalPayments: 8,
    totalValue: '15,200.00',
    status: 'ใช้งาน'
  },
  {
    id: 3,
    name: 'ประเสริฐ มั่งมี',
    email: 'prasert@example.com',
    initials: 'ปส',
    joinDate: '22 ก.ค. 2566',
    totalPayments: 5,
    totalValue: '9,750.00',
    status: 'ใช้งาน'
  },
  {
    id: 4,
    name: 'กมลา สวัสดี',
    email: 'kamala@example.com',
    initials: 'กม',
    joinDate: '10 มิ.ย. 2566',
    totalPayments: 3,
    totalValue: '6,500.00',
    status: 'ไม่ใช้งาน'
  },
  {
    id: 5,
    name: 'สมศรี มีทรัพย์',
    email: 'somsri@example.com',
    initials: 'สศ',
    joinDate: '5 เม.ย. 2566',
    totalPayments: 7,
    totalValue: '12,800.00',
    status: 'ใช้งาน'
  }
];

const getStatusClass = (status) => {
  switch (status) {
    case 'ใช้งาน':
      return 'bg-green-100 text-green-800';
    case 'ไม่ใช้งาน':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script> 