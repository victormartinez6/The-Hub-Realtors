<script setup lang="ts">
import { Chart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
    }[]
  }
}>()
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-4">Visão Geral do Fluxo de Caixa</h2>
    <Chart type="bar" :data="data" />
  </div>
</template>