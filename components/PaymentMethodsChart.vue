<template>
  <div class="chart-container h-60 relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="mt-2 text-sm text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    </div>
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center text-red-600">
        <p>{{ error }}</p>
        <button @click="initChart" class="mt-2 text-sm text-primary-600 hover:text-primary-700">ลองใหม่</button>
      </div>
    </div>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { LatestCharge } from '~/composables/useDashboard'

interface Props {
  charges: LatestCharge[]
}

const props = defineProps<Props>()

interface PaymentMethodStats {
  method: string
  percentage: number
}

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const loading = ref(false)
const error = ref<string | null>(null)

// Function to determine if we're on mobile
const isMobile = () => window.innerWidth < 768

// Create or update chart
const initChart = async () => {
  if (!chartRef.value) return
  
  try {
    loading.value = true
    error.value = null
    
    // Process payment methods data from props
    const paymentMethods = props.charges.reduce<Record<string, number>>((acc, charge) => {
      const method = charge.charge_metadata?.payment_details?.bank || 'พร้อมเพย์'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {})
    
    // Calculate percentages
    const total = Object.values(paymentMethods).reduce((sum, count) => sum + count, 0)
    const percentages: PaymentMethodStats[] = Object.entries(paymentMethods).map(([method, count]) => ({
      method,
      percentage: Math.round((count / total) * 100)
    }))
    
    // Sort by percentage in descending order
    percentages.sort((a, b) => b.percentage - a.percentage)
    
    const data = {
      labels: percentages.map(p => p.method),
      datasets: [
        {
          label: 'วิธีการชำระเงิน',
          data: percentages.map(p => p.percentage),
          backgroundColor: [
            'rgba(9, 103, 210, 0.7)',
            'rgba(63, 145, 66, 0.7)',
            'rgba(147, 51, 234, 0.7)',
            'rgba(234, 88, 12, 0.7)',
            'rgba(59, 130, 246, 0.7)'
          ],
          borderColor: [
            'rgba(9, 103, 210, 1)',
            'rgba(63, 145, 66, 1)',
            'rgba(147, 51, 234, 1)',
            'rgba(234, 88, 12, 1)',
            'rgba(59, 130, 246, 1)'
          ],
          borderWidth: 1
        }
      ]
    }
    
    const mobile = isMobile()

    if (chart) {
      chart.destroy()
    }

    const ctx = chartRef.value.getContext('2d')
    if (!ctx) return
    
    chart = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: mobile ? 'bottom' : 'right',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                size: mobile ? 10 : 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.raw as number
                return `${label}: ${value}%`
              }
            }
          }
        }
      }
    })
  } catch (err) {
    error.value = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
    console.error('Error creating chart:', err)
  } finally {
    loading.value = false
  }
}

// Watch for changes in charges prop
watch(() => props.charges, () => {
  initChart()
}, { deep: true })

// Handle window resize
const handleResize = () => {
  if (chart) {
    chart.options.plugins!.legend!.position = isMobile() ? 'bottom' : 'right'
    chart.update()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  min-height: 300px;
}
</style> 