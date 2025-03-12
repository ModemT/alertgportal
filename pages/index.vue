<template>
  <div>
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="card bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">รายได้ทั้งหมด</h3>
            <p class="text-2xl font-bold text-gray-800">฿24,780.00</p>
            <p class="text-sm text-green-500 mt-1">
              <span class="font-medium">+2.5%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card bg-white rounded-lg shadow-md p-6 border-l-4 border-secondary-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">ลูกค้า</h3>
            <p class="text-2xl font-bold text-gray-800">1,482</p>
            <p class="text-sm text-green-500 mt-1">
              <span class="font-medium">+12.3%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">ใบแจ้งหนี้</h3>
            <p class="text-2xl font-bold text-gray-800">642</p>
            <p class="text-sm text-green-500 mt-1">
              <span class="font-medium">+8.1%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="card bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div class="flex items-center">
          <div class="flex-1">
            <h3 class="text-gray-500 text-sm font-medium">รอดำเนินการ</h3>
            <p class="text-2xl font-bold text-gray-800">฿4,125.00</p>
            <p class="text-sm text-red-500 mt-1">
              <span class="font-medium">+2.1%</span> จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">ภาพรวมรายได้</h3>
        <div class="h-80">
          <RevenueChart />
        </div>
      </div>
      
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">วิธีการชำระเงิน</h3>
        <div class="h-80">
          <PaymentMethodsChart />
        </div>
      </div>
    </div>
    
    <!-- Recent Transactions -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-800">ธุรกรรมล่าสุด</h3>
        <button class="btn btn-primary text-sm">ดูทั้งหมด</button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิธีการชำระเงิน</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(transaction, index) in recentTransactions" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {{ transaction.customer.initials }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ transaction.customer.name }}</div>
                    <div class="text-sm text-gray-500">{{ transaction.customer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">฿{{ transaction.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(transaction.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ transaction.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.method }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const recentTransactions = [
  {
    customer: {
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      initials: 'สช'
    },
    date: '4 พ.ค. 2566',
    amount: '2,400.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์'
  },
  {
    customer: {
      name: 'วิภา รักเรียน',
      email: 'wipa@example.com',
      initials: 'วภ'
    },
    date: '3 พ.ค. 2566',
    amount: '1,250.00',
    status: 'กำลังดำเนินการ',
    method: 'พร้อมเพย์'
  },
  {
    customer: {
      name: 'ประเสริฐ มั่งมี',
      email: 'prasert@example.com',
      initials: 'ปส'
    },
    date: '2 พ.ค. 2566',
    amount: '750.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์'
  },
  {
    customer: {
      name: 'กมลา สวัสดี',
      email: 'kamala@example.com',
      initials: 'กม'
    },
    date: '1 พ.ค. 2566',
    amount: '3,200.00',
    status: 'ล้มเหลว',
    method: 'พร้อมเพย์'
  },
  {
    customer: {
      name: 'สมศรี มีทรัพย์',
      email: 'somsri@example.com',
      initials: 'สศ'
    },
    date: '30 เม.ย. 2566',
    amount: '1,800.00',
    status: 'สำเร็จ',
    method: 'พร้อมเพย์'
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