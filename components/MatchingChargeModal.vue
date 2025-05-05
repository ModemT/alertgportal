<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" @click="closeModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900">รายละเอียดการชำระเงิน</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Loading state -->
          <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
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

          <!-- Content -->
          <div v-else-if="chargeDetails" class="mt-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">ข้อมูลทั่วไป</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">รหัสการชำระเงิน</p>
                    <p class="mt-1">{{ chargeDetails.charge_id }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">สถานะ</p>
                    <p class="mt-1">
                      <span
                        :class="{
                          'px-2 py-1 text-xs rounded-full': true,
                          'bg-yellow-100 text-yellow-800': chargeDetails.status === 'pending',
                          'bg-green-100 text-green-800': chargeDetails.status === 'completed'
                        }"
                      >
                        {{ chargeDetails.status === 'pending' ? 'รอดำเนินการ' : 'เสร็จสิ้น' }}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">จำนวนเงิน</p>
                    <p class="mt-1">{{ formatAmount(chargeDetails.amount) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">สกุลเงิน</p>
                    <p class="mt-1">{{ chargeDetails.currency }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">วันที่สร้าง</p>
                    <p class="mt-1">{{ formatDate(chargeDetails.created_at) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">วันที่อัปเดต</p>
                    <p class="mt-1">{{ formatDate(chargeDetails.updated_at) }}</p>
                  </div>
                </div>
              </div>

              <div class="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">รายละเอียดการชำระเงิน</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">ธนาคาร</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.payment_details.bank }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">ชื่อผู้โอน</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.payment_details.sender_name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">เลขที่บัญชีผู้โอน</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.payment_details.sender_account }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">ชื่อผู้รับ</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.payment_details.receiver_name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">เลขที่บัญชีผู้รับ</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.payment_details.receiver_account }}</p>
                  </div>
                </div>
              </div>

              <div class="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">ข้อมูลความผิดพลาด</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">สาเหตุ</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.mismatch_reason }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">เลขที่บัญชีที่ถูกต้อง</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.expected_account }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">เลขที่บัญชีที่ได้รับ</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.received_account }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">เลขอ้างอิงธุรกรรม</p>
                    <p class="mt-1">{{ chargeDetails.charge_metadata.transaction_reference }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
import { formatDate, formatAmount } from '~/utils/formatters';
import { useAuth } from '~/composables/useAuth';

const config = useRuntimeConfig();
const { partnerId } = useAuth();
const props = defineProps<{
  isOpen: boolean;
  chargeId: string;
}>();

const emit = defineEmits(['close']);

const isLoading = ref(false);
const error = ref<string | null>(null);
const chargeDetails = ref<any>(null);

const closeModal = () => {
  emit('close');
};

const fetchChargeDetails = async () => {
  if (!props.chargeId) {
    console.log('No charge ID provided');
    return;
  }
  
  try {
    console.log('Fetching charge details for ID:', props.chargeId);
    isLoading.value = true;
    error.value = null;
    
    const baseUrl = config.public.apiBase || 'http://0.0.0.0:8000';
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Add authentication headers
    const token = localStorage.getItem('token');
    if (token) {
      headers['access-token'] = token;
    }
    if (partnerId.value) {
      headers['x-partner-id'] = partnerId.value;
    }

    console.log('Making API call to:', `${baseUrl}/matching-charges/${props.chargeId}`);
    console.log('With headers:', headers);

    const response = await fetch(`${baseUrl}/matching-charges/${props.chargeId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API error response:', errorData);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    chargeDetails.value = data;
  } catch (err) {
    console.error('Error fetching charge details:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch charge details';
  } finally {
    isLoading.value = false;
  }
};

// Call fetchChargeDetails when component is mounted if modal is open
onMounted(() => {
  console.log('Modal component mounted, isOpen:', props.isOpen, 'chargeId:', props.chargeId);
  if (props.isOpen && props.chargeId) {
    fetchChargeDetails();
  }
});

// Watch isOpen prop
watch(() => props.isOpen, (isOpen) => isOpen ? fetchChargeDetails() : (chargeDetails.value = error.value = null));
</script> 