<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Show loading state while checking auth -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Only show content after auth check -->
    <template v-else>
      <!-- Only show sidebar and related content if authenticated -->
      <template v-if="isAuthenticated">
        <!-- Mobile menu button -->
        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="fixed z-20 bottom-4 right-4 lg:hidden bg-primary-500 text-white p-3 rounded-full shadow-lg"
        >
          <svg v-if="isSidebarOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        <!-- Sidebar -->
        <aside 
          :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0', 'fixed inset-y-0 left-0 bg-white shadow-md w-60 z-20 transition-transform duration-300 ease-in-out']"
        >
          <div class="flex flex-col justify-between h-full">
            <div class="flex-grow">
              <div class="px-4 py-4 text-center border-b">
                <NuxtLink to="/" class="text-xl font-bold leading-none"><span class="text-primary-500">AlertG</span> Portal</NuxtLink>
              </div>
              <div class="p-4">
                <ul class="space-y-1">
                  <li>
                    <NuxtLink to="/" @click="closeSidebarOnMobile" class="flex items-center rounded-md font-medium text-sm py-2 px-3" :class="isActive('/') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      แดชบอร์ด
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/payments" @click="closeSidebarOnMobile" class="flex items-center rounded-md font-medium text-sm py-2 px-3" :class="isActive('/payments') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                      </svg>
                      การชำระเงิน
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/wrong-account-slips" @click="closeSidebarOnMobile" class="flex items-center rounded-md font-medium text-sm py-2 px-3" :class="isActive('/wrong-account-slips') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                      </svg>
                      สลิปผิดบัญชี
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/qr-test" @click="closeSidebarOnMobile" class="flex items-center rounded-md font-medium text-sm py-2 px-3" :class="isActive('/qr-test') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                      </svg>
                      ทดสอบ QR
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/customers" @click="closeSidebarOnMobile" class="flex items-center rounded-md font-medium text-sm py-2 px-3" :class="isActive('/customers') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      ลูกค้า
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/settings" @click="closeSidebarOnMobile" class="flex items-center rounded-md font-medium text-sm py-2 px-3" :class="isActive('/settings') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                      </svg>
                      การตั้งค่า
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
            <div class="p-4 border-t">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <NuxtLink to="/settings" class="flex-shrink-0">
                    <img class="w-8 h-8 rounded-full" :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '')}&background=0D8ABC&color=fff`" alt="User avatar">
                  </NuxtLink>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-700">{{ user?.username || 'Loading...' }}</p>
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <button 
                @click="handleLogout" 
                class="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </aside>

        <!-- Overlay for mobile -->
        <div 
          v-if="isSidebarOpen" 
          @click="isSidebarOpen = false"
          class="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
        ></div>

        <!-- Main Content Area with Sidebar -->
        <div class="lg:pl-60">
          <!-- Navbar -->
          <header class="fixed top-0 right-0 left-0 lg:left-60 bg-white h-16 border-b border-gray-200 z-10">
            <div class="h-full px-4">
              <div class="flex items-center justify-between h-full">
                <div class="flex items-center">
                  <button 
                    @click="isSidebarOpen = !isSidebarOpen" 
                    class="text-gray-500 focus:outline-none lg:hidden"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                </div>
                <div class="flex items-center">
                  <button class="flex mx-4 text-gray-600 focus:outline-none">
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                  <div class="relative">
                    <NuxtLink to="/settings" class="relative z-10 block h-8 w-8 rounded-full overflow-hidden focus:outline-none">
                      <img class="h-full w-full object-cover" :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || '')}&background=0D8ABC&color=fff`" alt="User avatar">
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <!-- Main Content -->
          <main class="pt-16 min-h-screen">
            <div class="px-4 sm:px-6 py-4">
              <div class="max-w-7xl mx-auto">
                <slot />
              </div>
            </div>
          </main>
        </div>
      </template>

      <!-- Show only the content without sidebar if not authenticated -->
      <template v-else>
        <main class="min-h-screen">
          <slot />
        </main>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '~/composables/useToast';

definePageMeta({
  middleware: ['auth']
});

const route = useRoute();
const isSidebarOpen = ref(false);
const { isAuthenticated, initializeAuth, logout, user, checkAuth, isSessionExpired } = useAuth();
const { showToast } = useToast();
const isLoading = ref(true);

// Initialize authentication status
const initializeAuthStatus = async () => {
  try {
    const success = await initializeAuth();
    if (!success && route.path !== '/login' && route.path !== '/register') {
      // Show session expired notification if that was the case
      if (isSessionExpired.value) {
        showToast('เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง', 'warning');
      }
      navigateTo('/login');
      return;
    }
    isLoading.value = false;
  } catch (error) {
    console.error('Auth initialization error:', error);
    isLoading.value = false;
    if (route.path !== '/login' && route.path !== '/register') {
      navigateTo('/login');
    }
  }
};

// Watch for route changes to reinitialize auth if needed
watch(() => route.path, async () => {
  await checkAuth()
  if (isAuthenticated.value === false) {
    // Show session expired notification if that was the case
    if (isSessionExpired.value) {
      showToast('เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง', 'warning');
    }
    initializeAuthStatus();
  }
});

const handleLogout = () => {
  logout();
  navigateTo('/login');
};

onBeforeMount(() => {
  initializeAuthStatus();
});

const isActive = (path) => {
  return route.path === path;
};

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) { // lg breakpoint
    isSidebarOpen.value = false;
  }
};

const pageTitle = computed(() => {
  const path = route.path;
  
  if (path === '/') return 'Dashboard';
  if (path === '/payments') return 'Payments';
  if (path === '/customers') return 'Customers';
  if (path === '/invoices') return 'Invoices';
  if (path === '/settings') return 'Settings';
  
  return 'Dashboard';
});

const navItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: 'IconDashboard',
    active: computed(() => route.path === '/')
  },
  {
    name: 'Payments',
    path: '/payments',
    icon: 'IconPayment',
    active: computed(() => route.path === '/payments')
  },
  {
    name: 'Customers',
    path: '/customers',
    icon: 'IconCustomer',
    active: computed(() => route.path === '/customers')
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: 'IconSettings',
    active: computed(() => route.path === '/settings')
  }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'สำเร็จ';
    case 'pending':
      return 'รอดำเนินการ';
    case 'failed':
      return 'ล้มเหลว';
    case 'refunded':
      return 'คืนเงินแล้ว';
    default:
      return status;
  }
};
</script>

<script>
// Define icon components
const IconDashboard = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  `
};

const IconPayment = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  `
};

const IconCustomer = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `
};

const IconSettings = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  `
};

export default {
  components: {
    IconDashboard,
    IconPayment,
    IconCustomer,
    IconSettings
  }
};
</script>

<style>
/* Add responsive table styles */
@media (max-width: 640px) {
  .responsive-table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>