<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transaction'
import CashFlowChart from '../components/cash-flow/CashFlowChart.vue'
import TransactionList from '../components/cash-flow/TransactionList.vue'
import CashFlowDashboard from '../components/cash-flow/CashFlowDashboard.vue'
import CashFlowFilters from '../components/cash-flow/CashFlowFilters.vue'

const transactionStore = useTransactionStore()
const activeTab = ref('current')
const initialBalance = ref(0)
const filters = ref({})

onMounted(async () => {
  await transactionStore.fetchTransactions()
})

const updateInitialBalance = (value: number) => {
  initialBalance.value = value
}
</script>

<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Fluxo de Caixa</h1>
      <p class="text-gray-600">Acompanhe seus lançamentos e previsões financeiras</p>
    </div>

    <CashFlowDashboard
      :initial-balance="initialBalance"
      :transactions="transactionStore.transactions"
      @update-initial-balance="updateInitialBalance"
    />

    <!-- Filtros -->
    <CashFlowFilters v-model="filters" />

    <div class="bg-white rounded-lg shadow">
      <!-- Tabs -->
      <div class="border-b">
        <div class="flex">
          <button
            v-for="tab in [
              { id: 'current', label: 'Lançamentos Atuais' },
              { id: 'future', label: 'Lançamentos Futuros' },
              { id: 'chart', label: 'Visão Geral' }
            ]"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-3 text-sm font-medium"
            :class="[
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="p-4">
        <template v-if="activeTab === 'chart'">
          <CashFlowChart :data="transactionStore.chartData" />
        </template>
        <template v-else>
          <TransactionList
            :transactions="activeTab === 'current' ? transactionStore.currentTransactions : transactionStore.futureTransactions"
            :type="activeTab"
            :loading="transactionStore.loading"
          />
        </template>
      </div>
    </div>
  </div>
</template>