import { ref, computed } from 'vue';
import { useRuntimeConfig } from '#app';
import { useAuth } from '~/composables/useAuth';

interface PaymentDetails {
  bank: string;
  amount: number;
  sender_name: string;
  receiver_name: string;
  sender_account: string;
  receiver_account: string;
}

interface ChargeMetadata {
  mismatch_reason: string;
  payment_details: PaymentDetails;
  expected_account: string;
  received_account: string;
  transaction_reference: string;
  approved_by?: string;
}

interface MatchingCharge {
  id: string;
  charge_id: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  charge_metadata: ChargeMetadata;
  created_at: string;
  updated_at: string;
}

interface MatchingChargesResponse {
  matching_charges: MatchingCharge[];
  next_cursor: string | null;
  has_more: boolean;
}

export function useWrongAccountSlips() {
  const config = useRuntimeConfig();
  const { partnerId } = useAuth();
  const charges = ref<MatchingCharge[]>([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const totalItems = ref(0);
  const selectedStatus = ref('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

  const fetchCharges = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', itemsPerPage.toString());
      
      if (selectedStatus.value) {
        queryParams.append('status', selectedStatus.value);
      }

      // Calculate cursor based on current page
      const skipItems = (currentPage.value - 1) * itemsPerPage;
      if (skipItems > 0) {
        const cursorDate = new Date();
        cursorDate.setMinutes(cursorDate.getMinutes() - skipItems);
        queryParams.append('cursor', cursorDate.toISOString());
      }

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

      const response = await fetch(`${baseUrl}/matching-charges?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data: MatchingChargesResponse = await response.json();
      
      charges.value = data.matching_charges;
      totalItems.value = data.matching_charges.length + (data.has_more ? itemsPerPage : 0);
    } catch (err) {
      console.error('Error fetching matching charges:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch matching charges';
      charges.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await fetchCharges();
  };

  const handleStatusChange = async () => {
    currentPage.value = 1; // Reset to first page when filter changes
    await fetchCharges();
  };

  return {
    charges,
    currentPage,
    totalPages,
    selectedStatus,
    isLoading,
    error,
    fetchCharges,
    handlePageChange,
    handleStatusChange,
  };
} 