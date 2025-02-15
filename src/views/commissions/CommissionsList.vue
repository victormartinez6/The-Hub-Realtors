<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Comissões</h1>
      <router-link 
        to="/commissions/new" 
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Nova Comissão
      </router-link>
    </div>

    <!-- Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900">Total Pendente</h3>
        <p class="mt-2 text-3xl font-bold text-orange-600">
          R$ {{ formatCurrency(totalPending) }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900">Total Pago (Mês)</h3>
        <p class="mt-2 text-3xl font-bold text-green-600">
          R$ {{ formatCurrency(totalPaidThisMonth) }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900">Total Geral</h3>
        <p class="mt-2 text-3xl font-bold text-indigo-600">
          R$ {{ formatCurrency(totalPaid) }}
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        </div>

        <!-- Período -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select
            v-model="filters.period"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todo Período</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <!-- Data Inicial (se período personalizado) -->
        <div v-if="filters.period === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input
            type="date"
            v-model="filters.startDate"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <!-- Data Final (se período personalizado) -->
        <div v-if="filters.period === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <input
            type="date"
            v-model="filters.endDate"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
      {{ error }}
    </div>

    <!-- Lista de Comissões -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Imóvel
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Corretor
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="commission in filteredCommissions" :key="commission.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ commission.propertyTitle }}</div>
              <div class="text-sm text-gray-500">
                Venda: R$ {{ formatCurrency(commission.salePrice) }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">
                R$ {{ formatCurrency(commission.amount) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ commission.percentage }}%
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ commission.realtorName }}</div>
              <div class="text-sm text-gray-500">{{ commission.brokerName }}</div>
            </td>
            <td class="px-6 py-4">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-800': commission.status === 'pending',
                  'bg-green-100 text-green-800': commission.status === 'paid'
                }"
              >
                {{ formatStatus(commission.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ formatDate(commission.date) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button 
                  v-if="commission.status === 'pending'"
                  @click="markAsPaid(commission.id)"
                  class="text-green-600 hover:text-green-900"
                >
                  Marcar como Pago
                </button>
                <router-link 
                  :to="'/commissions/' + commission.id"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Ver
                </router-link>
                <button 
                  @click="editCommission(commission.id)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button 
                  @click="deleteCommission(commission.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredCommissions.length === 0" class="text-center py-8">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vector-effect="non-scaling-stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhuma comissão encontrada</h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece criando uma nova comissão ou ajuste os filtros de busca.
        </p>
        <div class="mt-6">
          <router-link
            to="/commissions/new"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Nova Comissão
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCommissionsStore } from '../../stores/commissions';
import { storeToRefs } from 'pinia';

const router = useRouter();
const commissionsStore = useCommissionsStore();
const { commissions, loading, error } = storeToRefs(commissionsStore);

// Filtros
const filters = ref({
  status: 'all',
  period: 'month',
  startDate: '',
  endDate: ''
});

// Computed Properties
const filteredCommissions = computed(() => {
  let filtered = commissions.value;

  // Filtrar por status
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(comm => comm.status === filters.value.status);
  }

  // Filtrar por período
  if (filters.value.period !== 'all') {
    const now = new Date();
    let startDate;

    switch (filters.value.period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(comm => new Date(comm.date) >= startDate);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        filtered = filtered.filter(comm => new Date(comm.date) >= startDate);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        filtered = filtered.filter(comm => new Date(comm.date) >= startDate);
        break;
      case 'custom':
        if (filters.value.startDate) {
          startDate = new Date(filters.value.startDate);
          filtered = filtered.filter(comm => new Date(comm.date) >= startDate);
        }
        if (filters.value.endDate) {
          const endDate = new Date(filters.value.endDate);
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(comm => new Date(comm.date) <= endDate);
        }
        break;
    }
  }

  return filtered;
});

const totalPending = computed(() => {
  return filteredCommissions.value
    .filter(comm => comm.status === 'pending')
    .reduce((sum, comm) => sum + comm.amount, 0);
});

const totalPaid = computed(() => {
  return filteredCommissions.value
    .filter(comm => comm.status === 'paid')
    .reduce((sum, comm) => sum + comm.amount, 0);
});

const totalPaidThisMonth = computed(() => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return filteredCommissions.value
    .filter(comm => 
      comm.status === 'paid' && 
      new Date(comm.paidAt || 0) >= startOfMonth
    )
    .reduce((sum, comm) => sum + comm.amount, 0);
});

// Formatadores
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago'
  };
  return statusMap[status] || status;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

// Ações
const editCommission = (id: string) => {
  router.push(`/commissions/${id}/edit`);
};

const deleteCommission = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta comissão?')) {
    try {
      await commissionsStore.deleteCommission(id);
    } catch (err) {
      console.error('Erro ao excluir comissão:', err);
    }
  }
};

const markAsPaid = async (id: string) => {
  try {
    await commissionsStore.markAsPaid(id, {
      paidAt: new Date(),
      paymentMethod: 'transfer'
    });
  } catch (err) {
    console.error('Erro ao marcar comissão como paga:', err);
  }
};

// Watch para recarregar comissões quando os filtros mudarem
watch(filters, () => {
  commissionsStore.fetchCommissions();
}, { deep: true });

// Carregar comissões ao montar o componente
onMounted(() => {
  commissionsStore.fetchCommissions();
});
</script>
