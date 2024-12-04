import { ref, onMounted } from 'vue'

interface Bank {
  code: string
  name: string
}

export function useBankList() {
  const banks = ref<Bank[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchBanks = async () => {
    try {
      loading.value = true
      const response = await fetch('https://brasilapi.com.br/api/banks/v1')
      if (!response.ok) throw new Error('Failed to fetch banks')
      
      const data = await response.json()
      banks.value = data.map((bank: any) => ({
        code: bank.code,
        name: bank.fullName
      }))
    } catch (e) {
      error.value = 'Error loading bank list'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchBanks)

  return {
    banks,
    loading,
    error
  }
}