<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">การชำระเงิน</h1>
      <button class="btn btn-primary text-sm">สร้างการชำระเงินใหม่</button>
    </div>
    
    <!-- Filters -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
            <option value="">ทุกสถานะ</option>
            <option value="completed">สำเร็จ</option>
            <option value="processing">กำลังดำเนินการ</option>
            <option value="failed">ล้มเหลว</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วิธีการชำระเงิน</label>
          <select class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50">
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
          <input type="text" placeholder="ค้นหาการชำระเงิน..." class="input w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50" />
        </div>
      </div>
    </div>
    
    <!-- Payments Table -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div class="overflow-x-auto responsive-table">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีการชำระเงิน</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in payments" :key="payment.id">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{{ payment.id }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ payment.customer.initials }}
                  </div>
                  <div class="ml-3 sm:ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ payment.customer.name }}</div>
                    <div class="text-xs sm:text-sm text-gray-500">{{ payment.customer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ payment.date }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">฿{{ payment.amount }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(payment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ payment.method }}</td>
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
const payments = [
  {
    id: 'PAY-001234',
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
    id: 'PAY-001235',
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
    id: 'PAY-001236',
    customer: {
      name: 'ประเสริฐ มั่งมี',
      email: 'prasert@example.com',
      initials: 'ปส'
    },
    date: '2 พ.ค. 2566',
    amount: '750.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บัตรประชาชน'
  },
  {
    id: 'PAY-001237',
    customer: {
      name: 'กมลา สวัสดี',
      email: 'kamala@example.com',
      initials: 'กม'
    },
    date: '1 พ.ค. 2566',
    amount: '3,200.00',
    status: 'ล้มเหลว',
    method: 'พร้อมเพย์ - QR Code'
  },
  {
    id: 'PAY-001238',
    customer: {
      name: 'สมศรี มีทรัพย์',
      email: 'somsri@example.com',
      initials: 'สศ'
    },
    date: '30 เม.ย. 2566',
    amount: '1,800.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บริษัท'
  },
  {
    id: 'PAY-001239',
    customer: {
      name: 'มานะ ตั้งใจ',
      email: 'mana@example.com',
      initials: 'มน'
    },
    date: '29 เม.ย. 2566',
    amount: '950.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - บุคคล'
  },
  {
    id: 'PAY-001240',
    customer: {
      name: 'สุดา รักสวย',
      email: 'suda@example.com',
      initials: 'สด'
    },
    date: '28 เม.ย. 2566',
    amount: '1,500.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - เบอร์โทรศัพท์'
  },
  {
    id: 'PAY-001241',
    customer: {
      name: 'ประยุทธ์ จันโอชา',
      email: 'prayut@example.com',
      initials: 'ปย'
    },
    date: '27 เม.ย. 2566',
    amount: '2,100.00',
    status: 'กำลังดำเนินการ',
    method: 'พร้อมเพย์ - บัตรประชาชน'
  },
  {
    id: 'PAY-001242',
    customer: {
      name: 'ประวิตร วงษ์สุวรรณ',
      email: 'prawit@example.com',
      initials: 'ปว'
    },
    date: '26 เม.ย. 2566',
    amount: '3,500.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์ - QR Code'
  },
  {
    id: 'PAY-001243',
    customer: {
      name: 'อนุทิน ชาญวีรกูล',
      email: 'anutin@example.com',
      initials: 'อน'
    },
    date: '25 เม.ย. 2566',
    amount: '1,200.00',
    status: 'ล้มเหลว',
    method: 'พร้อมเพย์ - บริษัท'
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