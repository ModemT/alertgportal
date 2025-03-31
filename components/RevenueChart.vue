<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useApi } from '~/composables/useApi';

const chartRef = ref(null);
let chart = null;
const api = useApi();

// Function to determine if we're on mobile
const isMobile = () => window.innerWidth < 768;

// Function to get month name in Thai
const getThaiMonth = (date) => {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return months[date.getMonth()];
};

// Function to fetch all charges with pagination
const fetchAllCharges = async () => {
  const allCharges = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const charges = await api.get(`/charges?skip=${skip}&limit=${limit}`);
      if (!charges || charges.length === 0) {
        hasMore = false;
        break;
      }
      allCharges.push(...charges);
      if (charges.length < limit) {
        hasMore = false;
      } else {
        skip += limit;
      }
    } catch (error) {
      console.error('Error fetching charges:', error);
      hasMore = false;
    }
  }

  return allCharges;
};

// Create or update chart
const createChart = async () => {
  if (chart) {
    chart.destroy();
  }
  
  const ctx = chartRef.value.getContext('2d');
  
  try {
    // Fetch all charges with pagination
    const charges = await fetchAllCharges();
    
    // Process data for the last 12 months
    const now = new Date();
    const monthlyData = Array(12).fill(0).map((_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - index + 1, 1);
      
      const monthCharges = charges.filter(charge => {
        try {
          const chargeDate = new Date(charge.created_at);
          if (isNaN(chargeDate.getTime())) {
            console.error('Invalid date for charge:', charge);
            return false;
          }
          return chargeDate >= month && chargeDate < nextMonth;
        } catch (error) {
          console.error('Error processing charge date:', error, charge);
          return false;
        }
      });

      
      const revenue = monthCharges.reduce((sum, charge) => {
        try {
          // Only count completed charges as revenue
          if (charge.status === 'completed') {
            const amount = Number(charge.amount);
            if (isNaN(amount)) {
              console.error('Invalid amount for charge:', charge);
              return sum;
            }
            return sum + amount;
          }
          return sum;
        } catch (error) {
          console.error('Error processing revenue:', error, charge);
          return sum;
        }
      }, 0);
      
      const expenses = monthCharges.reduce((sum, charge) => {
        try {
          // Only count refunded charges as expenses, not cancelled ones
          if (charge.status === 'refunded') {
            const amount = Number(charge.amount);
            if (isNaN(amount)) {
              console.error('Invalid amount for charge:', charge);
              return sum;
            }
            return sum + amount;
          }
          return sum;
        } catch (error) {
          console.error('Error processing expenses:', error, charge);
          return sum;
        }
      }, 0);

      return {
        month: getThaiMonth(month),
        revenue,
        expenses
      };
    }).reverse();
    
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
    };
    
    const mobile = isMobile();
    
    // Chart configuration
    chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: mobile ? 'bottom' : 'top',
            labels: {
              boxWidth: mobile ? 12 : 40,
              font: {
                size: mobile ? 10 : 12
              },
              padding: mobile ? 10 : 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                return `${label}: ฿${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '฿' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
  }
};

// Handle window resize
const handleResize = () => {
  createChart();
};

onMounted(() => {
  createChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style> 