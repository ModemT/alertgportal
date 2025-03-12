<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Add viewport meta tag for responsive design
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
  ]
});
</script>

<style>
/* Global responsive styles */
html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

/* Add responsive utility classes */
.btn {
  @apply px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200;
}

.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600;
}

.card {
  @apply bg-white rounded-lg shadow-md;
}

.input {
  @apply rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50;
}

/* Table styles */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #6b7280;
  text-align: left;
  padding: 0.75rem 1rem;
}

td {
  padding: 1rem;
  vertical-align: middle;
}

tr {
  border-bottom: 1px solid #e5e7eb;
}

/* Responsive table */
@media (max-width: 640px) {
  .responsive-table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  th, td {
    padding: 0.75rem;
  }
}

/* Form elements */
select, input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

select:focus, input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

/* Status badges */
.rounded-full {
  border-radius: 9999px;
}
</style>
