<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h1 class="text-9xl font-bold text-primary-500">{{ error.statusCode }}</h1>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          {{ error.statusCode === 404 ? 'Page Not Found' : 'Something went wrong' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ error.message || 'The page you are looking for might have been removed or is temporarily unavailable.' }}
        </p>
      </div>
      <div class="mt-8">
        <button
          @click="handleError"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {{ error.statusCode === 404 ? 'Go back home' : 'Try again' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => {
  if (props.error.statusCode === 404) {
    navigateTo('/')
  } else {
    clearError({ redirect: '/' })
  }
}
</script> 