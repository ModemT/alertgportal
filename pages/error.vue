<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div class="mb-6">
        <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Error</h1>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <button
        @click="$router.push('/')"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const error = route.query.error || 'An error occurred'
</script> 