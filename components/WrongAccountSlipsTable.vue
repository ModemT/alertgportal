<template>
  <div>
    <!-- Filter Section -->
    <div class="bg-white p-4 mb-4 border rounded-md shadow-sm">
      <h3 class="font-medium text-gray-700 mb-3">ตัวกรอง</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select
            v-model="selectedStatus"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
            :disabled="isLoading"
          >
            <option value="">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">หมดอายุ</option>
          </select>
        </div>

        <!-- Currency Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">สกุลเงิน</label>
          <select
            v-model="selectedCurrency"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
            :disabled="isLoading"
          >
            <option value="">ทั้งหมด</option>
            <option value="THB">บาท (THB)</option>
            <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
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
              :disabled="isLoading"
            />
            <input
              v-model.number="maxAmount"
              type="number"
              placeholder="สูงสุด"
              class="w-1/2 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Date Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
          <input
            v-model="localStartDate"
            type="date"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isLoading"
            @change="handleStartDateChange"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
          <input
            v-model="localEndDate"
            type="date"
            class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isLoading"
            @change="handleEndDateChange"
          />
        </div>

        <!-- Sort Options -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">เรียงตาม</label>
          <div class="flex space-x-2">
            <select
              v-model="sortBy"
              class="w-2/3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFilterChange"
              :disabled="isLoading"
            >
              <option value="created_at">วันที่</option>
              <option value="amount">จำนวนเงิน</option>
              <option value="status">สถานะ</option>
            </select>
            <select
              v-model="sortOrder"
              class="w-1/3 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFilterChange"
              :disabled="isLoading"
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
          :disabled="isLoading"
        >
          ล้างตัวกรอง
        </button>
        <button
          @click="handleFilterChange"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isLoading"
        >
          ค้นหา
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
    <div v-if="!isLoading && totalFilteredItems" class="mb-4 text-sm text-gray-600">
      แสดง {{ charges.length }} รายการ จากทั้งหมด {{ totalFilteredItems }} รายการที่ตรงกับเงื่อนไข
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white border rounded-lg">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อนุมัติโดย</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ธนาคาร</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สกุลเงิน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้โอน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่บัญชีลูกค้าที่โอน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่บัญชีที่ถูกต้องของลูกค้า</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสการชำระเงิน</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="charges.length === 0">
            <td colspan="11" class="px-6 py-4 text-center text-gray-500">
              ไม่พบข้อมูล
            </td>
          </tr>
          <tr v-for="charge in charges" :key="charge.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex space-x-2">
                <button
                  @click.prevent="viewCharge(charge.id)"
                  class="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50"
                >
                  ดู
                </button>
                <button
                  v-if="charge.status === 'pending'"
                  @click.prevent="initiateComplete(charge.id)"
                  class="text-green-600 hover:text-green-900 px-3 py-1 rounded-md border border-green-600 hover:bg-green-50"
                >
                  ดำเนินการ
                </button>
                <button
                  v-else
                  class="text-gray-400 px-3 py-1 rounded-md border border-gray-300 cursor-not-allowed"
                  disabled
                >
                  ดำเนินการ
                </button>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(charge.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 py-1 text-xs rounded-full': true,
                  'bg-yellow-100 text-yellow-800': charge.status === 'pending',
                  'bg-green-100 text-green-800': charge.status === 'completed',
                  'bg-red-100 text-red-800': charge.status === 'cancelled'
                }"
              >
                {{ 
                  charge.status === 'pending' ? 'รอดำเนินการ' : 
                  charge.status === 'completed' ? 'เสร็จสิ้น' : 
                  charge.status === 'cancelled' ? 'หมดอายุ' : charge.status 
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_metadata.approved_by || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_metadata.payment_details.bank }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatAmount(charge.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.currency }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_metadata.payment_details.sender_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_metadata.received_account }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_metadata.expected_account }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_id }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div v-if="!isLoading && charges.length > 0" class="mt-4">
      <!-- Page Size Selector -->
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">แสดง:</label>
          <select
            v-model="pageSize"
            class="border rounded-md text-sm px-2 py-1"
            @change="handlePageSizeChange"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <span class="text-sm text-gray-600">รายการต่อหน้า</span>
        </div>
        
        <div class="text-sm text-gray-600" v-if="totalPages">
          หน้า {{ currentPage }} จาก {{ totalPages }}
        </div>
      </div>

      <!-- Pagination Buttons -->
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
          :disabled="currentPage >= totalPages"
          :class="{
            'px-2 py-1 rounded border': true,
            'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage >= totalPages,
            'bg-white text-gray-700 hover:bg-gray-50': currentPage < totalPages
          }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Last page -->
        <button
          @click="handlePageChange(totalPages)"
          :disabled="currentPage === totalPages"
          :class="{
            'px-2 py-1 rounded border': true,
            'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage === totalPages,
            'bg-white text-gray-700 hover:bg-gray-50': currentPage !== totalPages
          }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 17l5-5-5-5"/>
            <path d="M6 17l5-5-5-5"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Modal -->
    <MatchingChargeModal
      :is-open="isModalOpen"
      :charge-id="selectedChargeId || ''"
      @close="handleModalClose"
    />

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 class="text-base font-semibold leading-6 text-gray-900">ยืนยันการดำเนินการ</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      คุณต้องการดำเนินการรายการนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                :disabled="isCompletingCharge === pendingChargeId"
                @click="confirmComplete"
              >
                {{ isCompletingCharge === pendingChargeId ? 'กำลังดำเนินการ...' : 'ยืนยัน' }}
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                @click="cancelComplete"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useWrongAccountSlips } from '~/composables/useWrongAccountSlips';
import { formatDate, formatAmount } from '~/utils/formatters';
import MatchingChargeModal from '~/components/MatchingChargeModal.vue';
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
const isCompletingCharge = ref<string | null>(null);
const showConfirmDialog = ref(false);
const pendingChargeId = ref<string | null>(null);

const {
  charges,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  totalFilteredItems,
  selectedStatus,
  selectedCurrency,
  sortBy,
  sortOrder,
  startDate,
  endDate,
  minAmount,
  maxAmount,
  isLoading,
  error,
  fetchCharges,
  handlePageChange,
  handleStatusChange,
  handleFilterChange
} = useWrongAccountSlips();

// Local date values for the date pickers
const localStartDate = ref('');
const localEndDate = ref('');

// Set initial values if there are any
onMounted(() => {
  if (startDate.value) {
    // Convert ISO string to local date format (YYYY-MM-DD)
    const date = new Date(startDate.value);
    localStartDate.value = date.toISOString().split('T')[0];
  }
  
  if (endDate.value) {
    // Convert ISO string to local date format (YYYY-MM-DD)
    const date = new Date(endDate.value);
    localEndDate.value = date.toISOString().split('T')[0];
  }
});

// Calculate which page numbers to display
const displayedPageNumbers = computed(() => {
  if (!totalPages.value || totalPages.value <= 7) {
    return Array.from({ length: totalPages.value || 0 }, (_, i) => i + 1);
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
  const endPage = Math.min(totalPages.value - 1, currentPageValue + 1);
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  // Show ellipsis if needed
  if (currentPageValue < totalPages.value - 2) {
    pages.push('ellipsis');
  }
  
  // Always show last page
  pages.push(totalPages.value);
  
  return pages;
});

// Handle page size change
const handlePageSizeChange = () => {
  currentPage.value = 1; // Reset to page 1 when changing page size
  fetchCharges();
};

// Clear all filters
const clearFilters = () => {
  selectedStatus.value = '';
  selectedCurrency.value = '';
  sortBy.value = 'created_at';
  sortOrder.value = 'desc';
  startDate.value = '';
  endDate.value = '';
  localStartDate.value = '';
  localEndDate.value = '';
  minAmount.value = null;
  maxAmount.value = null;
  
  // Apply filter changes
  handleFilterChange();
};

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
const handleStartDateChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  localStartDate.value = input.value;
  
  if (input.value) {
    startDate.value = convertToUTCDate(input.value, false);
  } else {
    startDate.value = '';
  }
  
  debounceFilterChange();
};

const handleEndDateChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  localEndDate.value = input.value;
  
  if (input.value) {
    endDate.value = convertToUTCDate(input.value, true);
  } else {
    endDate.value = '';
  }
  
  debounceFilterChange();
};

// Modal state
const isModalOpen = ref(false);
const selectedChargeId = ref<string | null>(null);

const viewCharge = (chargeId: string) => {
  console.log('Opening modal for charge:', chargeId);
  selectedChargeId.value = chargeId;
  isModalOpen.value = true;
  console.log('Modal state after opening:', { isOpen: isModalOpen.value, chargeId: selectedChargeId.value });
};

const handleModalClose = () => {
  console.log('Closing modal');
  isModalOpen.value = false;
  selectedChargeId.value = null;
  console.log('Modal state after closing:', { isOpen: isModalOpen.value, chargeId: selectedChargeId.value });
  // Refresh the table data
  fetchCharges();
};

const initiateComplete = (chargeId: string) => {
  pendingChargeId.value = chargeId;
  showConfirmDialog.value = true;
};

const cancelComplete = () => {
  showConfirmDialog.value = false;
  pendingChargeId.value = null;
};

const confirmComplete = async () => {
  if (!pendingChargeId.value) return;
  
  try {
    isCompletingCharge.value = pendingChargeId.value;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.public.apiBase}/matching-charges/${pendingChargeId.value}/complete`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'access-token': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to complete charge');
    }

    // Close the confirmation dialog
    showConfirmDialog.value = false;
    pendingChargeId.value = null;

    // Refresh the table data after successful completion
    await fetchCharges();
  } catch (err) {
    console.error('Error completing charge:', err);
    error.value = err instanceof Error ? err.message : 'Failed to complete charge';
  } finally {
    isCompletingCharge.value = null;
  }
};

onMounted(() => {
  fetchCharges();
});

// Debounce filter changes
let debounceTimeout: NodeJS.Timeout;
const debounceFilterChange = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    handleFilterChange();
  }, 500);
};

// Watch filter inputs for changes
watch([minAmount, maxAmount], () => {
  debounceFilterChange();
});
</script> 