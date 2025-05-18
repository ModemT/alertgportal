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
  const hasNextPage = ref(false);
  const nextCursor = ref<string | null>(null);

  const totalPages = computed(() => {
    // Only show a next page if we know there's more data
    return currentPage.value + (hasNextPage.value ? 1 : 0);
  });

  const fetchCharges = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', itemsPerPage.toString());
      
      if (selectedStatus.value) {
        queryParams.append('status', selectedStatus.value);
      }

      // Use cursor-based pagination
      if (currentPage.value > 1 && nextCursor.value) {
        queryParams.append('cursor', nextCursor.value);
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
      // Store if there's a next page and its cursor
      hasNextPage.value = data.has_more;
      nextCursor.value = data.next_cursor;
      
      // If we have no results and we're not on page 1, go back to page 1
      if (data.matching_charges.length === 0 && currentPage.value > 1) {
        currentPage.value = 1;
        await fetchCharges();
        return;
      }
    } catch (err) {
      console.error('Error fetching matching charges:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch matching charges';
      charges.value = [];
      hasNextPage.value = false;
      nextCursor.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const handlePageChange = async (page: number) => {
    if (page <= 0 || (page > currentPage.value && !hasNextPage.value)) {
      return;
    }
    
    // If going back to page 1, reset cursor
    if (page === 1) {
      nextCursor.value = null;
    }
    
    currentPage.value = page;
    await fetchCharges();
  };

  const handleStatusChange = async () => {
    currentPage.value = 1; // Reset to first page when filter changes
    nextCursor.value = null; // Reset cursor when filter changes
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