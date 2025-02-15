import { defineStore } from 'pinia';
import { commissionService, type Commission } from '../services/commissionService';

export const useCommissionsStore = defineStore('commissions', {
  state: () => ({
    commissions: [] as Commission[],
    loading: false,
    error: null as string | null,
    filters: {
      startDate: null as Date | null,
      endDate: null as Date | null,
      status: 'all' as 'pending' | 'paid' | 'all'
    }
  }),

  getters: {
    pendingCommissions: (state) => 
      state.commissions.filter(comm => comm.status === 'pending'),
    
    paidCommissions: (state) => 
      state.commissions.filter(comm => comm.status === 'paid'),
    
    totalPending: (state) => 
      state.commissions
        .filter(comm => comm.status === 'pending')
        .reduce((sum, comm) => sum + comm.amount, 0),
    
    totalPaid: (state) => 
      state.commissions
        .filter(comm => comm.status === 'paid')
        .reduce((sum, comm) => sum + comm.amount, 0),
    
    filteredCommissions: (state) => {
      return state.commissions.filter(comm => {
        // Filtrar por status
        if (state.filters.status !== 'all' && comm.status !== state.filters.status) {
          return false;
        }

        // Filtrar por data inicial
        if (state.filters.startDate && comm.date < state.filters.startDate) {
          return false;
        }

        // Filtrar por data final
        if (state.filters.endDate && comm.date > state.filters.endDate) {
          return false;
        }

        return true;
      });
    }
  },

  actions: {
    async fetchCommissions() {
      this.loading = true;
      this.error = null;
      try {
        const fetchedCommissions = await commissionService.getCommissions();
        // Ordenar comissões por data (mais recentes primeiro)
        this.commissions = fetchedCommissions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.saveToStorage();
      } catch (err) {
        console.error('Erro ao carregar comissões:', err);
        this.error = 'Erro ao carregar comissões';
        // Carregar do localStorage como fallback
        const savedCommissions = localStorage.getItem('commissions');
        if (savedCommissions) {
          this.commissions = JSON.parse(savedCommissions);
        }
      } finally {
        this.loading = false;
      }
    },

    async addCommission(commissionData: Omit<Commission, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        // Criar comissão no Firestore
        const newCommission = await commissionService.addCommission(commissionData);
        
        // Adicionar ao estado local
        this.commissions.unshift(newCommission);
        this.saveToStorage();
        
        return newCommission;
      } catch (err) {
        console.error('Erro ao adicionar comissão:', err);
        this.error = 'Erro ao adicionar comissão';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCommission(id: string, data: Partial<Commission>) {
      this.loading = true;
      this.error = null;
      try {
        // Atualizar no Firestore
        const updatedCommission = await commissionService.updateCommission(id, data);
        
        // Atualizar no estado local
        const index = this.commissions.findIndex(c => c.id === id);
        if (index !== -1) {
          this.commissions[index] = { ...this.commissions[index], ...updatedCommission };
        }
        
        this.saveToStorage();
        return updatedCommission;
      } catch (err) {
        console.error('Erro ao atualizar comissão:', err);
        this.error = 'Erro ao atualizar comissão';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCommission(id: string) {
      this.loading = true;
      this.error = null;
      try {
        // Verificar se a comissão existe
        const exists = await commissionService.checkCommissionExists(id);
        if (!exists) {
          throw new Error('Comissão não encontrada');
        }

        // Excluir do Firestore
        await commissionService.deleteCommission(id);
        
        // Excluir do estado local
        this.commissions = this.commissions.filter(c => c.id !== id);
        this.saveToStorage();
      } catch (err) {
        console.error('Erro ao excluir comissão:', err);
        this.error = 'Erro ao excluir comissão';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async markAsPaid(id: string, paymentData: { 
      paidAt: Date,
      paymentMethod: string,
      paymentReference?: string
    }) {
      this.loading = true;
      this.error = null;
      try {
        const updatedCommission = await commissionService.markAsPaid(id, paymentData);
        
        // Atualizar no estado local
        const index = this.commissions.findIndex(c => c.id === id);
        if (index !== -1) {
          this.commissions[index] = { ...this.commissions[index], ...updatedCommission };
        }
        
        this.saveToStorage();
        return updatedCommission;
      } catch (err) {
        console.error('Erro ao marcar comissão como paga:', err);
        this.error = 'Erro ao marcar comissão como paga';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {
        startDate: null,
        endDate: null,
        status: 'all'
      };
    },

    // Mantemos o localStorage como backup
    saveToStorage() {
      localStorage.setItem('commissions', JSON.stringify(this.commissions));
    }
  }
});
