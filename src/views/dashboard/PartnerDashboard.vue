<template>
  <div class="space-y-8 p-6">
    <!-- Cabeçalho com Boas-vindas -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Olá, {{ authStore.userData?.displayName?.split(' ')[0] }}!</h1>
        <p class="mt-1 text-sm text-gray-500">Veja seus leads e acompanhe seu desempenho</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-medium text-gray-900">{{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-indigo-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">+{{ newLeadsThisMonth }}%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Leads Compartilhados</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ totalSharedLeads }}</p>
        <div class="mt-2 text-xs text-gray-500">{{ newLeadsThisMonth }} novos este mês</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">{{ conversionRate }}%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Leads Convertidos</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ convertedLeads }}</p>
        <div class="mt-2 text-xs text-gray-500">Taxa de conversão: {{ conversionRate }}%</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-purple-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-center" :class="commissionTrend > 0 ? 'text-green-500' : 'text-red-500'">
            <span class="mr-1">{{ commissionTrend > 0 ? '+' : '' }}{{ commissionTrend }}%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="commissionTrend > 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Comissões (Mês)</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">R$ {{ monthlyCommission }}</p>
        <div class="mt-2 text-xs text-gray-500">vs. mês anterior</div>
      </div>
    </div>

    <!-- Leads Compartilhados -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Leads Compartilhados</h2>
            <p class="mt-1 text-sm text-gray-500">Leads compartilhados com você</p>
          </div>
          <router-link 
            to="/leads" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Ver todos
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compartilhado Por</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="lead in sharedLeads" :key="lead.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-full bg-[#01FBA1]/10 flex items-center justify-center text-[#012928] font-medium">
                        {{ lead.name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ lead.name }}</div>
                      <div class="text-sm text-gray-500">{{ lead.interest }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 mr-3">
                      <img 
                        class="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100" 
                        :src="lead.sharedByPhoto || 'https://ui-avatars.com/api/?name=' + lead.sharedBy" 
                        :alt="lead.sharedBy"
                      >
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ lead.sharedBy }}</div>
                      <div class="text-xs text-gray-500">{{ lead.brokerName }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(lead.sharedDate) }}</div>
                  <div class="text-xs text-gray-500">{{ new Date(lead.sharedDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': lead.status === 'novo',
                      'bg-yellow-100 text-yellow-800': lead.status === 'em_andamento',
                      'bg-blue-100 text-blue-800': lead.status === 'convertido'
                    }"
                  >
                    {{ formatStatus(lead.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-3">
                    <button
                      @click="openLeadDetails(lead.id)"
                      class="text-[#012928] hover:text-[#012928]/80 transition-colors duration-200"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      v-if="lead.status === 'novo'"
                      @click="updateLeadStatus(lead.id, 'em_andamento')"
                      class="text-green-600 hover:text-green-800 transition-colors duration-200"
                    >
                      Iniciar Atendimento
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Histórico de Comissões -->
    <div class="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Histórico de Comissões</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gráfico de Comissões (placeholder) -->
        <div class="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
          <p class="text-gray-500">Gráfico de Comissões</p>
        </div>
        <!-- Lista de Últimas Comissões -->
        <div class="space-y-4">
          <div v-for="commission in recentCommissions" :key="commission.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ commission.leadName }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(commission.date) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">R$ {{ commission.amount }}</p>
              <p class="text-xs text-gray-500">{{ commission.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Dados do dashboard
const totalSharedLeads = ref(0);
const newLeadsThisMonth = ref(0);
const convertedLeads = ref(0);
const conversionRate = ref(0);
const monthlyCommission = ref(0);
const commissionTrend = ref(0);
const sharedLeads = ref([]);
const recentCommissions = ref([]);

// Formatadores
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    novo: 'Novo',
    em_andamento: 'Em Andamento',
    convertido: 'Convertido'
  };
  return statusMap[status] || status;
};

// Ações
const openLeadDetails = (leadId: number) => {
  router.push(`/leads/${leadId}`);
};

const updateLeadStatus = async (leadId: number, newStatus: string) => {
  try {
    // Aqui virá a chamada real para o serviço
    console.log(`Atualizando status do lead ${leadId} para ${newStatus}`);
    // Recarregar dados após atualização
    await loadDashboardData();
  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
  }
};

// Carregar dados do dashboard
const loadDashboardData = async () => {
  try {
    // Aqui virão as chamadas reais para os serviços
    // Por enquanto, usando dados mockados
    totalSharedLeads.value = 25;
    newLeadsThisMonth.value = 5;
    convertedLeads.value = 8;
    conversionRate.value = 32;
    monthlyCommission.value = '4.500';
    commissionTrend.value = 12;

    sharedLeads.value = [
      {
        id: 1,
        name: 'Carlos Oliveira',
        interest: 'Apartamento 2 quartos',
        sharedBy: 'João Silva',
        brokerName: 'The Hub Realtors',
        sharedDate: new Date(),
        status: 'novo'
      },
      // Adicionar mais leads aqui
    ];

    recentCommissions.value = [
      {
        id: 1,
        leadName: 'Venda Apartamento - Carlos Oliveira',
        date: new Date(),
        amount: '2.500',
        status: 'Pago'
      },
      // Adicionar mais comissões aqui
    ];
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>
