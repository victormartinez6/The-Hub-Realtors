<script setup lang="ts">
import { ref, computed } from 'vue'

interface Transaction {
  id: number
  date: string
  description: string
  type: 'income' | 'expense'
  amount: number
  status: 'pending' | 'completed'
}

const props = defineProps<{
  initialBalance: number
  transactions: Transaction[]
}>()

const currentBalance = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedTransactions = props.transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate <= today && t.status === 'completed'
  })

  return completedTransactions.reduce((acc, t) => {
    return acc + (t.type === 'income' ? t.amount : -t.amount)
  }, props.initialBalance)
})

const futureBalance = computed(() => {
  const pendingTransactions = props.transactions.filter(t => t.status === 'pending')
  
  return pendingTransactions.reduce((acc, t) => {
    return acc + (t.type === 'income' ? t.amount : -t.amount)
  }, currentBalance.value)
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <!-- Saldo em Banco -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
            <i class="pi pi-building text-blue-600 text-2xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Saldo em Banco</h3>
            <p class="text-sm text-gray-500">Total disponível em contas bancárias</p>
          </div>
        </div>
        <button 
          class="text-blue-600 hover:text-blue-800"
          v-tooltip="'Ver detalhes'"
        >
          <i class="pi pi-ellipsis-h"></i>
        </button>
      </div>
      <div class="flex items-baseline">
        <p class="text-2xl font-bold" :class="currentBalance >= 0 ? 'text-green-600' : 'text-red-600'">
          R$ {{ currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
        </p>
        <span 
          v-if="currentBalance !== props.initialBalance"
          :class="[
            'ml-2 text-sm font-medium',
            currentBalance > props.initialBalance ? 'text-green-600' : 'text-red-600'
          ]"
        >
          <i :class="[
            'pi mr-1',
            currentBalance > props.initialBalance ? 'pi-arrow-up' : 'pi-arrow-down'
          ]"></i>
          {{ Math.abs(((currentBalance - props.initialBalance) / props.initialBalance) * 100).toFixed(1) }}%
        </span>
      </div>
    </div>

    <!-- Saldo em Caixa -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
            <i class="pi pi-wallet text-green-600 text-2xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Saldo em Caixa</h3>
            <p class="text-sm text-gray-500">Dinheiro disponível em espécie</p>
          </div>
        </div>
        <button 
          class="text-green-600 hover:text-green-800"
          v-tooltip="'Ver detalhes'"
        >
          <i class="pi pi-ellipsis-h"></i>
        </button>
      </div>
      <div class="flex items-baseline">
        <p class="text-2xl font-bold" :class="futureBalance >= 0 ? 'text-green-600' : 'text-red-600'">
          R$ {{ futureBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
        </p>
        <span 
          v-if="futureBalance !== currentBalance"
          :class="[
            'ml-2 text-sm font-medium',
            futureBalance > currentBalance ? 'text-green-600' : 'text-red-600'
          ]"
        >
          <i :class="[
            'pi mr-1',
            futureBalance > currentBalance ? 'pi-arrow-up' : 'pi-arrow-down'
          ]"></i>
          {{ Math.abs(((futureBalance - currentBalance) / currentBalance) * 100).toFixed(1) }}%
        </span>
      </div>
    </div>
  </div>
</template>