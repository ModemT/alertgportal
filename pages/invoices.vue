<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">ใบแจ้งหนี้</h1>
      <button class="btn btn-primary">สร้างใบแจ้งหนี้ใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select class="input">
            <option value="">ทุกสถานะ</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="pending">รอชำระ</option>
            <option value="overdue">เกินกำหนด</option>
            <option value="draft">ร่าง</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
          <select class="input">
            <option value="7">7 วันที่ผ่านมา</option>
            <option value="30">30 วันที่ผ่านมา</option>
            <option value="90">90 วันที่ผ่านมา</option>
            <option value="365">1 ปีที่ผ่านมา</option>
            <option value="custom">กำหนดเอง</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
          <select class="input">
            <option value="">ทุกลูกค้า</option>
            <option value="1">สมชาย ใจดี</option>
            <option value="2">วิภา รักเรียน</option>
            <option value="3">ประเสริฐ มั่งมี</option>
            <option value="4">กมลา สวัสดี</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหา</label>
          <input type="text" placeholder="ค้นหาใบแจ้งหนี้..." class="input" />
        </div>
      </div>
    </div>
    
    <!-- Invoices Table -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ออก</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันครบกำหนด</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(invoice, index) in invoices" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{{ invoice.number }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ invoice.customer.initials }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ invoice.customer.name }}</div>
                    <div class="text-sm text-gray-500">{{ invoice.customer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.issued }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.due }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">฿{{ invoice.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(invoice.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900 mr-3">ดู</button>
                <button class="text-gray-600 hover:text-gray-900">ดาวน์โหลด</button>
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
              แสดง <span class="font-medium">1</span> ถึง <span class="font-medium">10</span> จาก <span class="font-medium">63</span> รายการ
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
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100">
                1
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                7
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
const invoices = [
  {
    number: 'INV-2023-001',
    customer: {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      initials: 'สช'
    },
    issued: '1 พ.ค. 2566',
    due: '15 พ.ค. 2566',
    amount: '2,400.00',
    status: 'ชำระแล้ว'
  },
  {
    number: 'INV-2023-002',
    customer: {
      name: 'วิภา รักเรียน',
      email: 'wipa@example.com',
      initials: 'วภ'
    },
    issued: '2 พ.ค. 2566',
    due: '16 พ.ค. 2566',
    amount: '1,250.00',
    status: 'รอชำระ'
  },
  {
    number: 'INV-2023-003',
    customer: {
      name: 'ประเสริฐ มั่งมี',
      email: 'prasert@example.com',
      initials: 'ปส'
    },
    issued: '3 พ.ค. 2566',
    due: '17 พ.ค. 2566',
    amount: '750.00',
    status: 'ชำระแล้ว'
  },
  {
    number: 'INV-2023-004',
    customer: {
      name: 'กมลา สวัสดี',
      email: 'kamala@example.com',
      initials: 'กม'
    },
    issued: '5 พ.ค. 2566',
    due: '19 พ.ค. 2566',
    amount: '3,200.00',
    status: 'เกินกำหนด'
  },
  {
    number: 'INV-2023-005',
    customer: {
      name: 'สมศรี มีทรัพย์',
      email: 'somsri@example.com',
      initials: 'สศ'
    },
    issued: '8 พ.ค. 2566',
    due: '22 พ.ค. 2566',
    amount: '1,800.00',
    status: 'รอชำระ'
  },
  {
    number: 'INV-2023-006',
    customer: {
      name: 'สุรชัย ดีงาม',
      email: 'surachai@example.com',
      initials: 'สช'
    },
    issued: '10 พ.ค. 2566',
    due: '24 พ.ค. 2566',
    amount: '950.00',
    status: 'ร่าง'
  },
  {
    number: 'INV-2023-007',
    customer: {
      name: 'นภา สุขใจ',
      email: 'napha@example.com',
      initials: 'นภ'
    },
    issued: '12 พ.ค. 2566',
    due: '26 พ.ค. 2566',
    amount: '2,100.00',
    status: 'รอชำระ'
  },
  {
    number: 'INV-2023-008',
    customer: {
      name: 'ชัยวัฒน์ รุ่งเรือง',
      email: 'chaiwat@example.com',
      initials: 'ชว'
    },
    issued: '15 พ.ค. 2566',
    due: '29 พ.ค. 2566',
    amount: '1,450.00',
    status: 'ชำระแล้ว'
  },
  {
    number: 'INV-2023-009',
    customer: {
      name: 'วันดี มีสุข',
      email: 'wandee@example.com',
      initials: 'วด'
    },
    issued: '18 พ.ค. 2566',
    due: '1 มิ.ย. 2566',
    amount: '860.00',
    status: 'รอชำระ'
  },
  {
    number: 'INV-2023-010',
    customer: {
      name: 'สมหมาย ใจเย็น',
      email: 'sommai@example.com',
      initials: 'สม'
    },
    issued: '20 พ.ค. 2566',
    due: '3 มิ.ย. 2566',
    amount: '1,720.00',
    status: 'ร่าง'
  }
];

const getStatusClass = (status) => {
  switch (status) {
    case 'ชำระแล้ว':
      return 'bg-green-100 text-green-800';
    case 'รอชำระ':
      return 'bg-yellow-100 text-yellow-800';
    case 'เกินกำหนด':
      return 'bg-red-100 text-red-800';
    case 'ร่าง':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script> 