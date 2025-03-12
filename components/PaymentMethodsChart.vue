<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';

const chartRef = ref(null);
let chart = null;

// Function to determine if we're on mobile
const isMobile = () => window.innerWidth < 768;

// Create or update chart
const createChart = () => {
  if (chart) {
    chart.destroy();
  }
  
  const ctx = chartRef.value.getContext('2d');
  
  // Sample data
  const data = {
    labels: ['พร้อมเพย์ - บุคคล', 'พร้อมเพย์ - บริษัท', 'พร้อมเพย์ - เบอร์โทรศัพท์', 'พร้อมเพย์ - บัตรประชาชน', 'พร้อมเพย์ - QR Code'],
    datasets: [
      {
        label: 'วิธีการชำระเงิน',
        data: [45, 25, 15, 10, 5],
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