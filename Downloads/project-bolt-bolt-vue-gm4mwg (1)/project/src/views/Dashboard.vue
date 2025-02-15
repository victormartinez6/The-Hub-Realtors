<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const revenueData = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [{
    label: 'Receita',
    data: [30000, 35000, 32000, 40000, 38000, 45000],
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
    tension: 0.4,
    fill: false
  }]
})

const stats = ref([
  { label: 'Receita Total', value: 'R$ 245.000', change: '+12,5%', icon: 'pi pi-dollar', trend: 'up' },
  { label: 'Despesas', value: 'R$ 182.000', change: '+5,2%', icon: 'pi pi-wallet', trend: 'up' },
  { label: 'Margem de Lucro', value: '25,7%', change: '+3,1%', icon: 'pi pi-chart-line', trend: 'up' },
  { label: 'Projetos Ativos', value: '12', change: '-2', icon: 'pi pi-briefcase', trend: 'down' }
])
</script>

<template>
  <div class="p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Visão Geral Financeira</h1>
      <p class="text-gray-600 mt-2">Acompanhe o desempenho financeiro da sua empresa</p>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-600">{{ stat.label }}</span>
          <i :class="[stat.icon, 'text-blue-600 text-xl']"></i>
        </div>
        <div class="flex items-baseline">
          <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
          <span :class="[
            'ml-2 text-sm',
            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
          ]">
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h2 class="text-xl font-semibold mb-4">Tendência de Receita</h2>
        <div class="h-[300px]">
          <Chart type="line" :data="revenueData" :options="chartOptions" />
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-xl font-semibold mb-4">Atividades Recentes</h2>
        <div class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <i class="pi pi-calendar text-blue-600"></i>
            </div>
            <div>
              <h3 class="font-medium">Nova Fatura Gerada</h3>
              <p class="text-sm text-gray-600">Fatura #{{ 1000 + i }} - R$ {{ (Math.random() * 10000).toFixed(2) }}</p>
            </div>
            <span class="ml-auto text-sm text-gray-500">{{ i }}h atrás</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>