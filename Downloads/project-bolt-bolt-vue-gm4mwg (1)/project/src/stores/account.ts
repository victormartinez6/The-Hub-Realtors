import { defineStore } from 'pinia'
import { Account, getAccounts, createAccount, updateAccount, deleteAccount } from '../firebase/services/accounts.service'
import { useAuthStore } from './auth'

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [] as Account[],
    loading: false,
    error: null as string | null,
    lastFetch: null as number | null,
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
  }),

  getters: {
    getAccounts: (state) => state.accounts,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    payableAccounts: (state) => state.accounts.filter(account => account.type === 'payable'),
    receivableAccounts: (state) => state.accounts.filter(account => account.type === 'receivable'),
    totalPayable: (state) => state.accounts.reduce((sum, account) => sum + account.amount, 0),
    totalReceivable: (state) => state.accounts.reduce((sum, account) => sum + account.amount, 0)
  },

  actions: {
    async fetchAccounts(forceRefresh = false) {
      console.log('[Account Store] Iniciando fetchAccounts...')
      
      // Verifica autenticação
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        console.error('[Account Store] Usuário não autenticado')
        this.error = 'Usuário não autenticado'
        this.loading = false
        return
      }

      // Se já estiver carregando, não inicia outra requisição
      if (this.loading) {
        console.log('[Account Store] Já existe uma requisição em andamento')
        return
      }

      // Verifica cache
      const now = Date.now()
      if (
        !forceRefresh &&
        this.lastFetch &&
        now - this.lastFetch < this.CACHE_DURATION &&
        this.accounts.length > 0
      ) {
        console.log('[Account Store] Usando cache de contas')
        return this.accounts
      }

      this.loading = true
      this.error = null
      console.log('[Account Store] Estado definido para loading:', this.loading)

      try {
        console.log('[Account Store] Buscando contas do Firebase...')
        const data = await getAccounts()
        
        console.log('[Account Store] Contas recebidas:', {
          quantidade: data.length,
          primeiroItem: data[0] ? { id: data[0].id, tipo: data[0].type } : null
        })
        
        this.accounts = data
        this.lastFetch = now
        
        console.log('[Account Store] Atualizando estado final:', {
          loading: false,
          accountsLength: this.accounts.length,
          lastFetch: this.lastFetch
        })
        
        this.loading = false
        return this.accounts
      } catch (e) {
        console.error('[Account Store] Erro ao buscar contas:', e)
        this.error = e instanceof Error ? e.message : 'Erro desconhecido ao carregar contas'
        this.loading = false
        throw e
      }
    },

    async addAccount(accountData: Omit<Account, 'id' | 'active' | 'createdAt' | 'updatedAt' | 'userId' | 'statusId'>) {
      try {
        this.loading = true
        this.error = null
        console.log('[Account Store] Criando nova conta:', accountData)
        
        const newAccount = await createAccount(accountData)
        this.accounts.push(newAccount)
        
        console.log('[Account Store] Conta criada com sucesso:', newAccount.id)
        return newAccount
      } catch (e) {
        console.error('[Account Store] Erro ao criar conta:', e)
        this.error = e instanceof Error ? e.message : 'Erro ao criar conta'
        throw e
      } finally {
        this.loading = false
      }
    },

    async editAccount(id: string, updatedAccount: Partial<Account>) {
      try {
        this.loading = true
        this.error = null
        
        const currentDate = new Date().toISOString()
        
        // Mantém os campos existentes e atualiza apenas os campos fornecidos
        const accountToUpdate: Partial<Account> = {
          ...updatedAccount,
          updatedAt: currentDate,
          active: true // Garante que a conta permanece ativa
        }

        // Remove campos undefined para evitar erros do Firestore
        Object.keys(accountToUpdate).forEach((key) => {
          const typedKey = key as keyof Account;
          if (accountToUpdate[typedKey] === undefined) {
            delete accountToUpdate[typedKey];
          }
        });

        await updateAccount(id, accountToUpdate)
        
        // Atualiza o estado local
        const index = this.accounts.findIndex(account => account.id === id)
        if (index !== -1) {
          this.accounts[index] = { ...this.accounts[index], ...accountToUpdate }
        }
      } catch (error) {
        console.error('Error editing account:', error)
        this.error = error instanceof Error ? error.message : 'Erro desconhecido ao editar conta'
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeAccount(id: string) {
      try {
        this.loading = true
        this.error = null
        console.log('[Account Store] Removendo conta:', id)
        
        await deleteAccount(id)
        this.accounts = this.accounts.filter(acc => acc.id !== id)
        
        console.log('[Account Store] Conta removida com sucesso')
      } catch (e) {
        console.error('[Account Store] Erro ao remover conta:', e)
        this.error = e instanceof Error ? e.message : 'Erro desconhecido ao remover conta'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})