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
import { useCharges } from '~/composables/useCharges'
import type { Charge, PaginatedResponse } from '~/composables/useCharges'

interface MonthlyData {
  month: string
  completed_amount: string
  refunded_amount: string
}

interface DashboardStats {
  totalAmountCurrentMonth: string
  totalCustomers: number
  pendingAmountCurrentMonth: string
  refundedAmountCurrentMonth: string
  monthlyData: MonthlyData[]
}

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const { fetchCharges } = useCharges()
const props = defineProps<{
  stats: DashboardStats
}>()
const loading = ref(false)
const error = ref<string | null>(null)

// Function to determine if we're on mobile
const isMobile = () => window.innerWidth < 768

// Function to get month name in Thai
const getThaiMonth = (date: Date) => {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return months[date.getMonth()]
}

// Create or update chart
const initChart = async () => {
  if (!chartRef.value) return
  console.log('initChart', props.stats)
  try {
    loading.value = true
    error.value = null

    // Use the monthly data from stats
    const monthlyData = props.stats.monthlyData.map(data => {
      // Convert YYYY-MM to Date object to get Thai month name
      const [year, month] = data.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return {
        month: getThaiMonth(date),
        revenue: Number(data.completed_amount),
        expenses: Number(data.refunded_amount)
      }
    })

    const data = {
      labels: monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'รายได้',
          data: monthlyData.map(d => d.revenue),
          backgroundColor: 'rgba(9, 103, 210, 0.2)',
          borderColor: 'rgba(9, 103, 210, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'รายจ่าย',
          data: monthlyData.map(d => d.expenses),
          backgroundColor: 'rgba(63, 145, 66, 0.2)',
          borderColor: 'rgba(63, 145, 66, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
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
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: mobile ? 'bottom' : 'top',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                size: mobile ? 10 : 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || ''
                if (label) {
                  label += ': '
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB'
                  }).format(context.parsed.y)
                }
                return label
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: mobile ? 10 : 12
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('th-TH', {
                  style: 'currency',
                  currency: 'THB',
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(value as number)
              },
              font: {
                size: mobile ? 10 : 12
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

// Watch for changes in stats
watch(() => props.stats, () => {
  initChart()
}, { deep: true })

// Handle window resize
const handleResize = () => {
  if (chart) {
    chart.options.plugins!.legend!.position = isMobile() ? 'bottom' : 'top'
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