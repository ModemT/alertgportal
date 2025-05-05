<template>
  <div>
    <!-- Status Filter -->
    <div class="mb-4">
      <select
        v-model="selectedStatus"
        class="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="handleStatusChange"
        :disabled="isLoading"
      >
        <option value="">ทั้งหมด</option>
        <option value="pending">รอดำเนินการ</option>
        <option value="completed">เสร็จสิ้น</option>
      </select>
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ธนาคาร</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเงิน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้โอน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่บัญชีที่โอน</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่บัญชีที่ถูกต้องของลูกค้า</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสการชำระเงิน</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="charges.length === 0">
            <td colspan="9" class="px-6 py-4 text-center text-gray-500">
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
                  @click.prevent="completeCharge(charge.id)"
                  :disabled="isCompletingCharge === charge.id"
                  class="text-green-600 hover:text-green-900 px-3 py-1 rounded-md border border-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isCompletingCharge === charge.id ? 'กำลังดำเนินการ...' : 'ดำเนินการ' }}
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
                  'bg-green-100 text-green-800': charge.status === 'completed'
                }"
              >
                {{ charge.status === 'pending' ? 'รอดำเนินการ' : 'เสร็จสิ้น' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ charge.charge_metadata.payment_details.bank }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatAmount(charge.amount) }}
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

    <!-- Pagination -->
    <div v-if="!isLoading && charges.length > 0" class="flex justify-center mt-4 space-x-2">
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
      <div class="flex space-x-1">
        <template v-for="page in displayedPages" :key="page">
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
            class="px-3 py-1 text-gray-500"
          >
            {{ page }}
          </span>
        </template>
      </div>

      <!-- Next page -->
      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="{
          'px-2 py-1 rounded border': true,
          'bg-gray-100 text-gray-400 cursor-not-allowed': currentPage === totalPages,
          'bg-white text-gray-700 hover:bg-gray-50': currentPage !== totalPages
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

    <!-- Modal -->
    <MatchingChargeModal
      :is-open="isModalOpen"
      :charge-id="selectedChargeId || ''"
      @close="handleModalClose"
    />
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

const {
  charges,
  currentPage,
  totalPages,
  selectedStatus,
  isLoading,
  error,
  fetchCharges,
  handlePageChange,
  handleStatusChange,
} = useWrongAccountSlips();

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

const completeCharge = async (chargeId: string) => {
  try {
    isCompletingCharge.value = chargeId;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.public.apiBase}/matching-charges/${chargeId}/complete`, {
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

    // Refresh the table data after successful completion
    await fetchCharges();
  } catch (err) {
    console.error('Error completing charge:', err);
    error.value = err instanceof Error ? err.message : 'Failed to complete charge';
  } finally {
    isCompletingCharge.value = null;
  }
};

// Calculate displayed page numbers with ellipsis
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 4) {
    // If total pages are 4 or less, show all pages
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Always show 4 pages in these patterns:
  // Pattern 1 (start): 1 2 3 ... (when current page is 1 or 2)
  // Pattern 2 (middle): 1 ... current ... total (when current page is in the middle)
  // Pattern 3 (end): ... total-2 total-1 total (when current page is at or near the end)

  if (current <= 2) {
    // Pattern 1: Show first 3 pages + ellipsis
    return [1, 2, 3, '...'];
  } else if (current >= total - 1) {
    // Pattern 3: Show last 3 pages with ellipsis at start
    return ['...', total - 2, total - 1, total];
  } else {
    // Pattern 2: Show current page with one page before and ellipsis on both sides
    return [1, '...', current, '...', total];
  }
});

onMounted(() => {
  fetchCharges();
});

// Debounce the status change
let debounceTimeout: NodeJS.Timeout;
watch(selectedStatus, () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    handleStatusChange();
  }, 300);
});
</script> 