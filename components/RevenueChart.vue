<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
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
  const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'รายได้',
        data: [18500, 21200, 19800, 22400, 24200, 23100, 25800, 27500, 26200, 28900, 29800, 32100],
        backgroundColor: 'rgba(9, 103, 210, 0.2)',
        borderColor: 'rgba(9, 103, 210, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'รายจ่าย',
        data: [12300, 13100, 12800, 14200, 15100, 14800, 16200, 17100, 16800, 18200, 19100, 20300],
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
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('th-TH', {
                  style: 'currency',
                  currency: 'THB'
                }).format(context.parsed.y);
              }
              return label;
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
              size: mobile ? 8 : 12
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (mobile && value > 1000) {
                return '฿' + (value / 1000) + 'K';
              }
              return '฿' + value.toLocaleString('th-TH');
            },
            font: {
              size: mobile ? 8 : 12
            }
          }
        }
      }
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