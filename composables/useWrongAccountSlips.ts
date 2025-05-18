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

interface PaginatedMatchingCharges {
  matching_charges: MatchingCharge[];
  next_cursor: string | null;
  has_more: boolean;
  total: number | null;
  filtered_total: number | null;
  page: number | null;
  page_size: number | null;
  total_pages: number | null;
}

export function useWrongAccountSlips() {
  const config = useRuntimeConfig();
  const { partnerId } = useAuth();
  const charges = ref<MatchingCharge[]>([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalItems = ref<number | null>(null);
  const totalFilteredItems = ref<number | null>(null);
  const apiTotalPages = ref<number | null>(null);
  const selectedStatus = ref('');
  const selectedCurrency = ref('');
  const sortBy = ref('created_at');
  const sortOrder = ref('desc');
  const startDate = ref('');
  const endDate = ref('');
  const minAmount = ref<number | null>(null);
  const maxAmount = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const hasNextPage = ref(false);
  const nextCursor = ref<string | null>(null);
  const useCursorPagination = ref(false);

  const totalPages = computed(() => {
    if (apiTotalPages.value !== null) {
      return apiTotalPages.value;
    }
    
    // Fallback for page-based pagination
    if (totalItems.value !== null && pageSize.value > 0) {
      return Math.ceil(totalItems.value / pageSize.value);
    }
    
    // Cursor-based pagination fallback (should not be used)
    return currentPage.value + (hasNextPage.value ? 1 : 0);
  });

  const resetPagination = () => {
    currentPage.value = 1;
    nextCursor.value = null;
    hasNextPage.value = false;
    apiTotalPages.value = null;
    totalItems.value = null;
    totalFilteredItems.value = null;
  };

  const fetchCharges = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const queryParams = new URLSearchParams();
      
      // Always use page-based pagination
      queryParams.append('page', currentPage.value.toString());
      queryParams.append('page_size', pageSize.value.toString());
      
      // Add filters
      if (selectedStatus.value) {
        queryParams.append('status', selectedStatus.value);
      }
      
      if (selectedCurrency.value) {
        queryParams.append('currency', selectedCurrency.value);
      }
      
      if (sortBy.value) {
        queryParams.append('sort_by', sortBy.value);
      }
      
      if (sortOrder.value) {
        queryParams.append('sort_order', sortOrder.value);
      }
      
      if (startDate.value) {
        queryParams.append('start_date', startDate.value);
      }
      
      if (endDate.value) {
        queryParams.append('end_date', endDate.value);
      }
      
      if (minAmount.value !== null) {
        queryParams.append('min_amount', minAmount.value.toString());
      }
      
      if (maxAmount.value !== null) {
        queryParams.append('max_amount', maxAmount.value.toString());
      }
      
      // Always request filtered total for better UX
      queryParams.append('include_filtered_total', 'true');

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

      const data: PaginatedMatchingCharges = await response.json();
      
      charges.value = data.matching_charges;
      
      // Store pagination information
      if (data.page !== null) {
        currentPage.value = data.page;
      }
      
      if (data.page_size !== null) {
        pageSize.value = data.page_size;
      }
      
      // Store totals
      totalItems.value = data.total;
      totalFilteredItems.value = data.filtered_total;
      apiTotalPages.value = data.total_pages;
      
      // For compatibility with components still using cursor-based logic
      hasNextPage.value = currentPage.value < (data.total_pages || 0);
      
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
    if (page <= 0 || (apiTotalPages.value !== null && page > apiTotalPages.value)) {
      return;
    }
    
    currentPage.value = page;
    await fetchCharges();
  };

  const handleStatusChange = async () => {
    resetPagination();
    await fetchCharges();
  };

  const handleFilterChange = async () => {
    resetPagination();
    await fetchCharges();
  };

  const togglePaginationMode = () => {
    fetchCharges();
  };

  return {
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
    useCursorPagination,
    hasNextPage,
    nextCursor,
    fetchCharges,
    handlePageChange,
    handleStatusChange,
    handleFilterChange,
    togglePaginationMode
  };
} 