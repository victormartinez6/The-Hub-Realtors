import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Bank, getBanks, createBank, updateBank, deleteBank } from '../firebase/services/banks.service'

export const useBankStore = defineStore('bank', () => {
  const banks = ref<Bank[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchBanks() {
    try {
      loading.value = true
      banks.value = await getBanks()
    } catch (e) {
      error.value = 'Error loading banks'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addBank(bank: Omit<Bank, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const newBank = await createBank(bank)
      banks.value.push(newBank)
      return true
    } catch (e) {
      error.value = 'Error adding bank'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateBankData(id: string, bank: Partial<Bank>) {
    try {
      loading.value = true
      const updatedBank = await updateBank(id, bank)
      const index = banks.value.findIndex(b => b.id === id)
      if (index !== -1) {
        banks.value[index] = { ...banks.value[index], ...updatedBank }
      }
      return true
    } catch (e) {
      error.value = 'Error updating bank'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteBankById(id: string) {
    try {
      loading.value = true
      await deleteBank(id)
      banks.value = banks.value.filter(b => b.id !== id)
      return true
    } catch (e) {
      error.value = 'Error deleting bank'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    banks,
    loading,
    error,
    fetchBanks,
    addBank,
    updateBank: updateBankData,
    deleteBank: deleteBankById
  }
})