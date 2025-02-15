<script setup lang="ts">
import { computed } from 'vue'
import { Chart } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  costCenters: {
    id: number
    name: string
    budget: number
    spent: number
  }[]
}>()

const chartData = computed(() => ({
  labels: props.costCenters.map(center => center.name),
  datasets: [{
    data: props.costCenters.map(center => center.budget),
    backgroundColor: [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF'
    ]
  }]
}))
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-4">Distribuição do Orçamento</h2>
    <Chart type="pie" :data="chartData" />
  </div>
</template>