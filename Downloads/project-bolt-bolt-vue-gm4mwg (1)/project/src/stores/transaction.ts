import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  Transaction,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../firebase/services/transactions.service'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentTransactions = computed(() => {
    const now = new Date()
    return transactions.value
      .filter(t => new Date(t.date) <= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const futureTransactions = computed(() => {
    const now = new Date()
    return transactions.value
      .filter(t => new Date(t.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const totalIncome = computed(() => 
    transactions.value
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpenses = computed(() => 
    transactions.value
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpenses.value)

  // Chart data computed property
  const chartData = computed(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const currentYear = new Date().getFullYear()
    const monthlyData = new Array(12).fill(0).map(() => ({ income: 0, expense: 0 }))

    transactions.value.forEach(transaction => {
      const date = new Date(transaction.date)
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth()
        if (transaction.type === 'income') {
          monthlyData[month].income += transaction.amount
        } else {
          monthlyData[month].expense += transaction.amount
        }
      }
    })

    return {
      labels: months,
      datasets: [
        {
          label: 'Receitas',
          data: monthlyData.map(d => d.income),
          backgroundColor: '#42b883',
        },
        {
          label: 'Despesas',
          data: monthlyData.map(d => d.expense),
          backgroundColor: '#ff7676',
        }
      ]
    }
  })

  // Actions
  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      transactions.value = await getTransactions()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar transações'
      console.error('Error fetching transactions:', err)
    } finally {
      loading.value = false
    }
  }

  const addTransaction = async (data: Omit<Transaction, 'id' | 'active' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    loading.value = true
    error.value = null
    try {
      const newTransaction = await createTransaction(data)
      transactions.value.push(newTransaction)
      return newTransaction
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar transação'
      console.error('Error creating transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const editTransaction = async (id: string, data: Partial<Transaction>) => {
    loading.value = true
    error.value = null
    try {
      await updateTransaction(id, data)
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = { ...transactions.value[index], ...data }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar transação'
      console.error('Error updating transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeTransaction = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await deleteTransaction(id)
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao excluir transação'
      console.error('Error deleting transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    transactions,
    loading,
    error,

    // Getters
    currentTransactions,
    futureTransactions,
    totalIncome,
    totalExpenses,
    balance,
    chartData,

    // Actions
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction
  }
})
