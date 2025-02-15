<script setup lang="ts">
import { computed } from 'vue'

interface Transaction {
  id: number
  date: string
  description: string
  type: 'income' | 'expense'
  amount: number
  status: 'pending' | 'completed'
}

const props = defineProps<{
  transactions: Transaction[]
  type: 'current' | 'future'
  loading?: boolean
}>()

const filteredTransactions = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return props.transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    if (props.type === 'current') {
      return transactionDate <= today
    }
    return transactionDate > today
  })
})

const totals = computed(() => {
  const income = filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    income,
    expenses,
    balance: income - expenses
  }
})
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm text-gray-600 mb-1">Total Receitas</h4>
        <p class="text-lg font-semibold text-green-600">
          R$ {{ totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
        </p>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm text-gray-600 mb-1">Total Despesas</h4>
        <p class="text-lg font-semibold text-red-600">
          R$ {{ totals.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
        </p>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm text-gray-600 mb-1">Saldo</h4>
        <p class="text-lg font-semibold" :class="totals.balance >= 0 ? 'text-green-600' : 'text-red-600'">
          R$ {{ totals.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
        </p>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-3 px-4">Data</th>
            <th class="text-left py-3 px-4">Descrição</th>
            <th class="text-right py-3 px-4">Valor</th>
            <th class="text-center py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr>
              <td colspan="4" class="py-8 text-center text-gray-500">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                Carregando transações...
              </td>
            </tr>
          </template>
          <template v-else-if="filteredTransactions.length === 0">
            <tr>
              <td colspan="4" class="py-8 text-center text-gray-500">
                Nenhuma transação encontrada
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="transaction in filteredTransactions" 
                :key="transaction.id"
                class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">{{ new Date(transaction.date).toLocaleDateString('pt-BR') }}</td>
              <td class="py-3 px-4">{{ transaction.description }}</td>
              <td :class="[
                'py-3 px-4 text-right',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              ]">
                R$ {{ Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="py-3 px-4">
                <span class="inline-flex justify-center items-center px-2 py-1 text-xs rounded-full"
                      :class="transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  {{ transaction.status === 'completed' ? 'Concluído' : 'Pendente' }}
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>