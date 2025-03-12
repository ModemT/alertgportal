<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">การชำระเงิน</h1>
      <button class="btn btn-primary">สร้างการชำระเงินใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select class="input">
            <option value="">ทุกสถานะ</option>
            <option value="completed">สำเร็จ</option>
            <option value="processing">กำลังดำเนินการ</option>
            <option value="failed">ล้มเหลว</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วิธีการชำระเงิน</label>
          <select class="input">
            <option value="">ทุกวิธี</option>
            <option value="promptpay_personal">พร้อมเพย์ - บุคคล</option>
            <option value="promptpay_corporate">พร้อมเพย์ - บริษัท</option>
            <option value="promptpay_phone">พร้อมเพย์ - เบอร์โทรศัพท์</option>
            <option value="promptpay_id">พร้อมเพย์ - บัตรประชาชน</option>
            <option value="promptpay_qr">พร้อมเพย์ - QR Code</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลา</label>
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
          <input type="text" placeholder="ค้นหาการชำระเงิน..." class="input" />
        </div>
      </div>
    </div>
    
    <!-- Payments Table -->
    <div class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีการชำระเงิน</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(payment, index) in payments" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">#{{ payment.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ payment.customer.initials }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ payment.customer.name }}</div>
                    <div class="text-sm text-gray-500">{{ payment.customer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ payment.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">฿{{ payment.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(payment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ payment.method }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-primary-600 hover:text-primary-900 mr-3">ดู</button>
                <button class="text-gray-600 hover:text-gray-900">คืนเงิน</button>
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
              แสดง <span class="font-medium">1</span> ถึง <span class="font-medium">10</span> จาก <span class="font-medium">97</span> รายการ
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
                10
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
const payments = [
  {
    id: '92748',
    customer: {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      initials: 'สช'
    },
    date: '4 พ.ค. 2566',
    amount: '2,400.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บุคคล'
  },
  {
    id: '92747',
    customer: {
      name: 'วิภา รักเรียน',
      email: 'wipa@example.com',
      initials: 'วภ'
    },
    date: '3 พ.ค. 2566',
    amount: '1,250.00',
    status: 'กำลังดำเนินการ',
    method: 'พร้อมเพย์ - เบอร์โทรศัพท์'
  },
  {
    id: '92746',
    customer: {
      name: 'ประเสริฐ มั่งมี',
      email: 'prasert@example.com',
      initials: 'ปส'
    },
    date: '2 พ.ค. 2566',
    amount: '750.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - QR Code'
  },
  {
    id: '92745',
    customer: {
      name: 'กมลา สวัสดี',
      email: 'kamala@example.com',
      initials: 'กม'
    },
    date: '1 พ.ค. 2566',
    amount: '3,200.00',
    status: 'ล้มเหลว',
    method: 'พร้อมเพย์ - บัตรประชาชน'
  },
  {
    id: '92744',
    customer: {
      name: 'สมศรี มีทรัพย์',
      email: 'somsri@example.com',
      initials: 'สศ'
    },
    date: '30 เม.ย. 2566',
    amount: '1,800.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บุคคล'
  },
  {
    id: '92743',
    customer: {
      name: 'สุรชัย ดีงาม',
      email: 'surachai@example.com',
      initials: 'สช'
    },
    date: '29 เม.ย. 2566',
    amount: '950.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บริษัท'
  },
  {
    id: '92742',
    customer: {
      name: 'นภา สุขใจ',
      email: 'napha@example.com',
      initials: 'นภ'
    },
    date: '28 เม.ย. 2566',
    amount: '2,100.00',
    status: 'กำลังดำเนินการ',
    method: 'พร้อมเพย์ - เบอร์โทรศัพท์'
  },
  {
    id: '92741',
    customer: {
      name: 'ชัยวัฒน์ รุ่งเรือง',
      email: 'chaiwat@example.com',
      initials: 'ชว'
    },
    date: '27 เม.ย. 2566',
    amount: '1,450.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - QR Code'
  },
  {
    id: '92740',
    customer: {
      name: 'วันดี มีสุข',
      email: 'wandee@example.com',
      initials: 'วด'
    },
    date: '26 เม.ย. 2566',
    amount: '860.00',
    status: 'ล้มเหลว',
    method: 'พร้อมเพย์ - บัตรประชาชน'
  },
  {
    id: '92739',
    customer: {
      name: 'สมหมาย ใจเย็น',
      email: 'sommai@example.com',
      initials: 'สม'
    },
    date: '25 เม.ย. 2566',
    amount: '1,720.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บุคคล'
  }
];

const getStatusClass = (status) => {
  switch (status) {
    case 'สำเร็จ':
      return 'bg-green-100 text-green-800';
    case 'กำลังดำเนินการ':
      return 'bg-yellow-100 text-yellow-800';
    case 'ล้มเหลว':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script> 