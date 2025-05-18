<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">รายการชำระเงิน</h1>
    </div>
    
    <!-- Filters -->
    <div class="bg-white p-4 mb-4 border rounded-md shadow-sm">
      <h3 class="font-medium text-gray-700 mb-3">ตัวกรอง</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select
            v-model="statusFilter"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
            :disabled="loading"
          >
            <option value="">ทั้งหมด</option>
            <option value="completed">สำเร็จ</option>
            <option value="refunded">คืนเงินแล้ว</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="failed">ล้มเหลว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        <!-- Amount Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ช่วงจำนวนเงิน</label>
          <div class="flex space-x-2">
            <input
              v-model.number="minAmount"
              type="number"
              placeholder="ขั้นต่ำ"
              class="w-1/2 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              :disabled="loading"
            />
            <input
              v-model.number="maxAmount"
              type="number"
              placeholder="สูงสุด"
              class="w-1/2 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
            @change="handleStartDateChange"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
            @change="handleEndDateChange"
          />
        </div>

        <!-- Search input for charges -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหารายการชำระ</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาตาม ID หรือคำอธิบาย"
              class="w-full border rounded-md pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Search input for shoppers -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ค้นหาโดยข้อมูลผู้ซื้อ</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              v-model="shopperSearchQuery"
              type="text"
              placeholder="ชื่อ, อีเมล, โทรศัพท์, บัญชี"
              class="w-full border rounded-md pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Sort Options -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">เรียงตาม</label>
          <div class="flex space-x-2">
            <select
              v-model="sortBy"
              class="w-2/3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFilterChange"
              :disabled="loading"
            >
              <option value="created_at">วันที่</option>
              <option value="amount">จำนวนเงิน</option>
              <option value="status">สถานะ</option>
            </select>
            <select
              v-model="sortOrder"
              class="w-1/3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFilterChange"
              :disabled="loading"
            >
              <option value="desc">ลงมา</option>
              <option value="asc">ขึ้นไป</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="flex justify-end space-x-2 mt-4">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="loading"
        >
          ล้างตัวกรอง
        </button>
        <button
          @click="handleFilterChange"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="loading"
        >
          ค้นหา
        </button>
        <button 
          @click="exportToCSV" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isExporting || loading"
        >
          {{ isExporting ? 'กำลังส่งออก...' : 'ส่งออก CSV' }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Count Summary -->
    <div v-if="!loading && totalFilteredItems" class="mb-4 text-sm text-gray-600">
      แสดง {{ charges.length }} รายการ จากทั้งหมด {{ totalFilteredItems }} รายการที่ตรงกับเงื่อนไข
    </div>
    
    <!-- Charges Table -->
    <div class="card bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div class="overflow-x-auto responsive-table">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                <span>รหัสผู้ซื้อ</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คำอธิบาย</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่อัปเดต</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การกระทำ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="charge in paginatedCharges" :key="charge.id">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 border-b border-dotted border-gray-300">{{ charge.id }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 border-b border-dotted border-blue-300">{{ charge.shopper_id || '-' }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 border-b border-dotted border-gray-300">{{ charge.description || '-' }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{{ formatAmount(charge.amount) }} {{ charge.currency }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(charge.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(charge.status) }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ formatDate(charge.created_at) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{{ formatDate(charge.updated_at) }}</td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button @click="openChargeDetails(charge.id)" class="text-primary-600 hover:text-primary-900">ดู</button>
                  <button 
                    v-if="charge.status === 'pending'"
                    @click="openCancelConfirm(charge.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    ยกเลิก
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="!loading && charges.length > 0" class="flex flex-col sm:flex-row items-center justify-between mt-6">
        <div class="flex items-center space-x-2">
          <div class="text-xs sm:text-sm text-gray-500">
            แสดง {{ totalFilteredItems ?? charges.length }} รายการ
          </div>
          
          <!-- Page Size Selector -->
          <div class="ml-4 flex items-center space-x-2">
            <label class="text-xs sm:text-sm text-gray-500">แสดง:</label>
            <select
              v-model="pageSize"
              class="border rounded-md text-xs sm:text-sm px-2 py-1"
              @change="handlePageSizeChange"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span class="text-xs sm:text-sm text-gray-500">รายการต่อหน้า</span>
          </div>
        </div>
        
        <!-- Pagination controls -->
        <div class="flex justify-center space-x-2">
          <!-- First page -->
          <button
            @click="handlePageChange(1)"
            :disabled="currentPage === 1"
            :class="{
              'px-2 py-1 rounded border': true,
              'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage === 1,
              'bg-white text-gray-700 hover:bg-gray-50': currentPage !== 1
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 17l-5-5 5-5"/>
              <path d="M18 17l-5-5 5-5"/>
            </svg>
          </button>

          <!-- Previous page -->
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="{
              'px-2 py-1 rounded border': true,
              'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage === 1,
              'bg-white text-gray-700 hover:bg-gray-50': currentPage !== 1
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Page numbers -->
          <template v-for="page in displayedPageNumbers" :key="page">
            <button
              v-if="typeof page === 'number'"
              @click="handlePageChange(page)"
              :class="{
                'px-3 py-1 rounded border': true,
                'bg-blue-500 text-white': currentPage === page,
                'bg-white text-gray-700 hover:bg-gray-50': currentPage !== page
              }"
            >
              {{ page }}
            </button>
            <span
              v-else
              class="px-2 py-1 text-gray-500"
            >
              ...
            </span>
          </template>

          <!-- Next page -->
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage >= (totalPages ?? 1)"
            :class="{
              'px-2 py-1 rounded border': true,
              'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage >= (totalPages ?? 1),
              'bg-white text-gray-700 hover:bg-gray-50': currentPage < (totalPages ?? 1)
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Last page -->
          <button
            @click="handlePageChange(safeTotalPages)"
            :disabled="currentPage === (totalPages ?? 1)"
            :class="{
              'px-2 py-1 rounded border': true,
              'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage === (totalPages ?? 1),
              'bg-white text-gray-700 hover:bg-gray-50': currentPage !== (totalPages ?? 1)
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 17l5-5-5-5"/>
              <path d="M6 17l5-5-5-5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Charge Details Modal -->
    <ChargeDetailsModal
      :is-open="isModalOpen"
      :charge-id="selectedChargeId"
      @close="closeChargeDetails"
    />

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelConfirm" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  ยืนยันการยกเลิกการชำระเงิน
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    คุณแน่ใจหรือไม่ที่จะยกเลิกการชำระเงินนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="handleCancelCharge"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ loading ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก' }}
            </button>
            <button
              type="button"
              @click="closeCancelConfirm"
              :disabled="loading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useCharges } from '~/composables/useCharges'
import ChargeDetailsModal from '~/components/ChargeDetailsModal.vue'
import _ from 'lodash'
const { debounce } = _

const {
  charges,
  loading,
  error,
  fetchCharges,
  cancelCharge,
  currentPage,
  pageSize,
  totalItems,
  totalFilteredItems,
  totalPages,
  changePage,
  changePageSize,
  applyFilters
} = useCharges()

// UI state
const isModalOpen = ref(false)
const selectedChargeId = ref('')
const isExporting = ref(false)
const showCancelConfirm = ref(false)
const chargeToCancel = ref<string | null>(null)

// Filter state
const statusFilter = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)
const searchQuery = ref('')
const shopperSearchQuery = ref('')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref<'created_at' | 'amount' | 'status'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Calculate which page numbers to display
const displayedPageNumbers = computed(() => {
  const totalPagesValue = totalPages.value ?? 1;
  
  if (!totalPagesValue || totalPagesValue <= 7) {
    return Array.from({ length: totalPagesValue || 0 }, (_, i) => i + 1);
  }
  
  // Logic for showing pages around current page
  const pages: (number | string)[] = [];
  const currentPageValue = currentPage.value;
  
  // Always show first page
  pages.push(1);
  
  // Show ellipsis if needed
  if (currentPageValue > 3) {
    pages.push('ellipsis');
  }
  
  // Pages around current page
  const startPage = Math.max(2, currentPageValue - 1);
  const endPage = Math.min(totalPagesValue - 1, currentPageValue + 1);
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  // Show ellipsis if needed
  if (currentPageValue < totalPagesValue - 2) {
    pages.push('ellipsis');
  }
  
  // Always show last page
  if (totalPagesValue > 1) {
    pages.push(totalPagesValue);
  }
  
  return pages;
});

// Convert local date to UTC ISO string for API
const convertToUTCDate = (dateString: string, isEndDate = false): string => {
  if (!dateString) return '';
  
  // Create date object (in local time)
  const date = new Date(dateString);
  
  // Set the time component based on whether it's start or end date
  if (isEndDate) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  
  // Return as ISO string (which is in UTC)
  return date.toISOString();
};

// Handle date changes
const handleStartDateChange = () => {
  debounceFilterChange();
};

const handleEndDateChange = () => {
  debounceFilterChange();
};

// Debounce filter changes
let debounceTimeout: NodeJS.Timeout;
const debounceFilterChange = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    handleFilterChange();
  }, 500);
};

// Watch date inputs specifically
watch([startDate, endDate], () => {
  debounceFilterChange();
});

// Watch other filter inputs 
watch([searchQuery, shopperSearchQuery, minAmount, maxAmount], () => {
  debounceFilterChange();
});

// Handle filter change
const handleFilterChange = async () => {
  const options = {
    status: statusFilter.value || undefined,
    min_amount: minAmount.value || undefined,
    max_amount: maxAmount.value || undefined,
    start_date: startDate.value ? convertToUTCDate(startDate.value, false) : undefined,
    end_date: endDate.value ? convertToUTCDate(endDate.value, true) : undefined,
    search_term: searchQuery.value || undefined,
    shopper_search_term: shopperSearchQuery.value || undefined,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
  };
  
  await applyFilters(options);
  
  // Force a UI update after data changes
  await nextTick();
};

// Clear all filters
const clearFilters = () => {
  statusFilter.value = '';
  minAmount.value = null;
  maxAmount.value = null;
  startDate.value = '';
  endDate.value = '';
  searchQuery.value = '';
  shopperSearchQuery.value = '';
  sortBy.value = 'created_at';
  sortOrder.value = 'desc';
  
  // Apply filter changes
  handleFilterChange();
};

// Handle page change
const handlePageChange = async (page: number) => {
  if (page < 1 || (totalPages.value !== null && page > totalPages.value)) {
    return;
  }
  
  const options = {
    status: statusFilter.value || undefined,
    min_amount: minAmount.value || undefined,
    max_amount: maxAmount.value || undefined,
    start_date: startDate.value ? convertToUTCDate(startDate.value, false) : undefined,
    end_date: endDate.value ? convertToUTCDate(endDate.value, true) : undefined,
    search_term: searchQuery.value || undefined,
    shopper_search_term: shopperSearchQuery.value || undefined,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
  };
  
  await changePage(page, options);
};

// Handle page size change
const handlePageSizeChange = async () => {
  const options = {
    status: statusFilter.value || undefined,
    min_amount: minAmount.value || undefined,
    max_amount: maxAmount.value || undefined,
    start_date: startDate.value ? convertToUTCDate(startDate.value, false) : undefined,
    end_date: endDate.value ? convertToUTCDate(endDate.value, true) : undefined,
    search_term: searchQuery.value || undefined,
    shopper_search_term: shopperSearchQuery.value || undefined,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
  };
  
  if (pageSize.value) {
    await changePageSize(Number(pageSize.value), options);
  }
};

onMounted(async () => {
  await handleFilterChange();
});

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    case 'refunded':
      return 'bg-purple-100 text-purple-800'
    case 'pending':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'สำเร็จ'
    case 'processing':
      return 'กำลังดำเนินการ'
    case 'failed':
      return 'ล้มเหลว'
    case 'cancelled':
      return 'ยกเลิก'
    case 'refunded':
      return 'คืนเงิน'
    case 'pending':
      return 'รอดำเนินการ'
    default:
      return status
  }
}

const openChargeDetails = (chargeId: string): void => {
  selectedChargeId.value = chargeId
  isModalOpen.value = true
}

const closeChargeDetails = (): void => {
  isModalOpen.value = false
  selectedChargeId.value = ''
  // Refresh the data after closing the modal in case changes were made
  handleFilterChange();
}

const exportToCSV = async () => {
  try {
    isExporting.value = true
    
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase as string
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('ไม่พบ token สำหรับการยืนยันตัวตน')
    }
    
    // Build query parameters
    const params = new URLSearchParams()
    if (startDate.value) {
      params.append('start_date', convertToUTCDate(startDate.value, false))
    }
    if (endDate.value) {
      params.append('end_date', convertToUTCDate(endDate.value, true))
    }
    if (statusFilter.value) {
      params.append('status', statusFilter.value)
    }
    if (searchQuery.value) {
      params.append('search_term', searchQuery.value)
    }
    if (shopperSearchQuery.value) {
      params.append('shopper_search_term', shopperSearchQuery.value)
    }
    params.append('include_metadata', 'false') // Default to false, can be made configurable
    
    // Fetch as blob for file download
    const response = await fetch(
      `${apiBase}/charges/export/csv?${params.toString()}`,
      {
        headers: {
          'accept': 'text/csv',
          'access-token': token
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Get the blob from the response
    const blob = await response.blob()
    
    // Get filename from Content-Disposition header or create default
    let filename = `charges_export_${new Date().toISOString().split('T')[0]}.csv`
    const contentDisposition = response.headers.get('Content-Disposition')
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=([^;]+)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/"/g, '')
      }
    }
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    alert('เกิดข้อผิดพลาดในการส่งออกไฟล์ CSV: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    isExporting.value = false
  }
}

const openCancelConfirm = (chargeId: string): void => {
  chargeToCancel.value = chargeId
  showCancelConfirm.value = true
}

const closeCancelConfirm = (): void => {
  showCancelConfirm.value = false
  chargeToCancel.value = null
}

const handleCancelCharge = async (): Promise<void> => {
  if (!chargeToCancel.value) return
  
  try {
    await cancelCharge(chargeToCancel.value)
    closeCancelConfirm()
    
    // Refresh data after successful cancellation
    handleFilterChange()
  } catch (err) {
    console.error('Error cancelling charge:', err)
  }
}

// Fix paginatedCharges error by adding a computed property
const paginatedCharges = computed(() => charges.value);

// Add null check for totalPages
const safeTotalPages = computed(() => totalPages.value ?? 1);
</script> 