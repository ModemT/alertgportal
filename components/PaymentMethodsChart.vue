<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import { useApi } from '~/composables/useApi';

const chartRef = ref(null);
let chart = null;
const api = useApi();

// Function to determine if we're on mobile
const isMobile = () => window.innerWidth < 768;

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
    
    // Process payment methods data
    const paymentMethods = charges.reduce((acc, charge) => {
      const method = charge.charge_metadata?.payment_method || 'พร้อมเพย์';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate percentages
    const total = Object.values(paymentMethods).reduce((sum, count) => sum + count, 0);
    const percentages = Object.entries(paymentMethods).map(([method, count]) => ({
      method,
      percentage: Math.round((count / total) * 100)
    }));
    
    // Sort by percentage in descending order
    percentages.sort((a, b) => b.percentage - a.percentage);
    
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
    };
    
    const mobile = isMobile();
    
    // Chart configuration
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: mobile ? 'bottom' : 'right',
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
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}%`;
              }
            }
          }
        },
        cutout: mobile ? '60%' : '65%'
      }
    });
  } catch (error) {
    console.error('Error fetching payment methods data:', error);
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