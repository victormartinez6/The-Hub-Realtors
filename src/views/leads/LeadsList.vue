<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Leads</h1>
      <router-link 
        to="/leads/new" 
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Novo Lead
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Busca -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Nome, email ou telefone"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="novo">Novo</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="convertido">Convertido</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        <!-- Origem -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Origem</label>
          <select
            v-model="filters.source"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todas</option>
            <option value="site">Site</option>
            <option value="indicacao">Indicação</option>
            <option value="parceiro">Parceiro</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <!-- Data -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <select
            v-model="filters.period"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todo Período</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
      </div>

      <!-- Datas personalizadas (mostrar apenas se period === 'custom') -->
      <div v-if="filters.period === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input
            type="date"
            v-model="filters.startDate"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
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

    <!-- Lista de Leads -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lead
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Origem
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Responsável
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
          <tr v-for="lead in filteredLeads" :key="lead.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <span class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                    <span class="font-medium text-indigo-800">{{ lead.name.charAt(0) }}</span>
                  </span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ lead.name }}</div>
                  <div class="text-sm text-gray-500">{{ lead.email }}</div>
                  <div class="text-sm text-gray-500">{{ lead.phone }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': lead.status === 'novo',
                  'bg-yellow-100 text-yellow-800': lead.status === 'em_andamento',
                  'bg-blue-100 text-blue-800': lead.status === 'convertido',
                  'bg-red-100 text-red-800': lead.status === 'perdido'
                }"
              >
                {{ formatStatus(lead.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ formatSource(lead.source) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ lead.assignedToName || 'Não atribuído' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ formatDate(lead.createdAt) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <router-link 
                  :to="'/leads/' + lead.id"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Ver
                </router-link>
                <button 
                  @click="editLead(lead.id)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button 
                  @click="deleteLead(lead.id)"
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
      <div v-if="filteredLeads.length === 0" class="text-center py-8">
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum lead encontrado</h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece criando um novo lead ou ajuste os filtros de busca.
        </p>
        <div class="mt-6">
          <router-link
            to="/leads/new"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Novo Lead
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLeadsStore } from '../../stores/leads';
import { storeToRefs } from 'pinia';

const router = useRouter();
const leadsStore = useLeadsStore();
const { leads, loading, error } = storeToRefs(leadsStore);

// Filtros
const filters = ref({
  search: '',
  status: 'all',
  source: 'all',
  period: 'all',
  startDate: '',
  endDate: ''
});

// Computed para leads filtrados
const filteredLeads = computed(() => {
  let filtered = leads.value;

  // Filtrar por busca
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(lead => 
      lead.name.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.phone.toLowerCase().includes(search)
    );
  }

  // Filtrar por status
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(lead => lead.status === filters.value.status);
  }

  // Filtrar por origem
  if (filters.value.source !== 'all') {
    filtered = filtered.filter(lead => lead.source === filters.value.source);
  }

  // Filtrar por período
  if (filters.value.period !== 'all') {
    const now = new Date();
    let startDate;

    switch (filters.value.period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        filtered = filtered.filter(lead => new Date(lead.createdAt) >= startDate);
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        filtered = filtered.filter(lead => new Date(lead.createdAt) >= startDate);
        break;
      case 'month':
        startDate = new Date(now.setDate(1));
        filtered = filtered.filter(lead => new Date(lead.createdAt) >= startDate);
        break;
      case 'custom':
        if (filters.value.startDate) {
          startDate = new Date(filters.value.startDate);
          filtered = filtered.filter(lead => new Date(lead.createdAt) >= startDate);
        }
        if (filters.value.endDate) {
          const endDate = new Date(filters.value.endDate);
          endDate.setHours(23, 59, 59, 999);
          filtered = filtered.filter(lead => new Date(lead.createdAt) <= endDate);
        }
        break;
    }
  }

  return filtered;
});

// Formatadores
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    novo: 'Novo',
    em_andamento: 'Em Andamento',
    convertido: 'Convertido',
    perdido: 'Perdido'
  };
  return statusMap[status] || status;
};

const formatSource = (source: string) => {
  const sourceMap: Record<string, string> = {
    site: 'Site',
    indicacao: 'Indicação',
    parceiro: 'Parceiro',
    outros: 'Outros'
  };
  return sourceMap[source] || source;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

// Ações
const editLead = (id: string) => {
  router.push(`/leads/${id}/edit`);
};

const deleteLead = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este lead?')) {
    try {
      await leadsStore.deleteLead(id);
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
    }
  }
};

// Watch para recarregar leads quando os filtros mudarem
watch(filters, () => {
  leadsStore.fetchLeads();
}, { deep: true });

// Carregar leads ao montar o componente
onMounted(() => {
  leadsStore.fetchLeads();
});
</script>
