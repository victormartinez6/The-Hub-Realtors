<template>
  <div class="space-y-8 p-6">
    <!-- Cabeçalho com Boas-vindas -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bem-vindo de volta, {{ authStore.userData?.displayName?.split(' ')[0] }}!</h1>
        <p class="mt-1 text-sm text-gray-500">Confira o desempenho da sua corretora</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-medium text-gray-900">{{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
    </div>

    <!-- Cards de Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-indigo-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">+12%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Total de Realtors</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ totalRealtors }}</p>
        <div class="mt-2 text-xs text-gray-500">vs. mês anterior</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">+23%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Leads do Mês</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ monthlyLeads }}</p>
        <div class="mt-2 text-xs text-gray-500">vs. mês anterior</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-yellow-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">+8%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Imóveis Ativos</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ activeProperties }}</p>
        <div class="mt-2 text-xs text-gray-500">vs. mês anterior</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-purple-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">+15%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Vendas do Mês</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">R$ {{ monthlyRevenue }}</p>
        <div class="mt-2 text-xs text-gray-500">vs. mês anterior</div>
      </div>
    </div>

    <!-- Seção de Equipe -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Desempenho da Equipe</h2>
            <p class="mt-1 text-sm text-gray-500">Acompanhe o progresso dos seus corretores</p>
          </div>
          <div class="flex gap-3">
            <router-link 
              to="/team" 
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Ver todos
            </router-link>
            <router-link 
              to="/dashboard/broker/realtors" 
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#012928] rounded-lg hover:bg-[#012928]/90 transition-colors duration-200"
            >
              Gerenciar Equipe
            </router-link>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realtor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads Ativos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imóveis</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas (Mês)</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="realtor in topRealtors" :key="realtor.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img 
                        class="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100" 
                        :src="realtor.photoURL || 'https://ui-avatars.com/api/?name=' + realtor.name" 
                        :alt="realtor.name"
                      >
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ realtor.name }}</div>
                      <div class="text-sm text-gray-500">{{ realtor.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-medium">{{ realtor.activeLeads }}</div>
                  <div class="text-xs text-gray-500">Leads em andamento</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-medium">{{ realtor.properties }}</div>
                  <div class="text-xs text-gray-500">Imóveis cadastrados</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-medium">R$ {{ realtor.monthlyRevenue }}</div>
                  <div class="text-xs text-gray-500">Este mês</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-[#01FBA1] h-2 rounded-full" 
                      :style="{ width: Math.min((realtor.monthlyRevenue / 100000) * 100, 100) + '%' }"
                    ></div>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ Math.min((realtor.monthlyRevenue / 100000) * 100, 100).toFixed(0) }}% da meta</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Leads Recentes e Próximos Eventos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Leads Recentes -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Leads Recentes</h2>
              <p class="mt-1 text-sm text-gray-500">Últimos leads adicionados</p>
            </div>
            <router-link 
              to="/leads" 
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Ver todos
            </router-link>
          </div>
          
          <div class="space-y-4">
            <div v-for="lead in recentLeads" :key="lead.id" 
              class="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-[#01FBA1]/10 flex items-center justify-center text-[#012928] font-medium">
                    {{ lead.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ lead.name }}</div>
                  <div class="text-sm text-gray-500">{{ lead.email }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ new Date(lead.createdAt).toLocaleDateString('pt-BR') }}
                </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Próximos Eventos -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Próximos Eventos</h2>
              <p class="mt-1 text-sm text-gray-500">Agenda dos próximos dias</p>
            </div>
            <router-link 
              to="/agenda" 
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Ver agenda
            </router-link>
          </div>
          
          <div class="space-y-4">
            <div v-for="event in upcomingEvents" :key="event.id" 
              class="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div class="flex-shrink-0 w-14 text-center">
                <div class="text-2xl font-bold text-gray-900">{{ formatEventDate(event.date, 'day') }}</div>
                <div class="text-xs font-medium text-gray-500 uppercase">{{ formatEventDate(event.date, 'month') }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ event.title }}</p>
                <p class="text-sm text-gray-500">{{ event.description }}</p>
                <div class="mt-2 flex items-center">
                  <svg class="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs text-gray-500">{{ event.time }}</span>
                </div>
              </div>
              <div class="flex-shrink-0">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-100 text-blue-800': event.type === 'visita',
                    'bg-purple-100 text-purple-800': event.type === 'reuniao',
                    'bg-orange-100 text-orange-800': event.type === 'outro'
                  }"
                >
                  {{ event.type }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Dados mockados para exemplo
const totalRealtors = ref(0);
const monthlyLeads = ref(0);
const activeProperties = ref(0);
const monthlyRevenue = ref(0);
const topRealtors = ref([]);
const recentLeads = ref([]);
const upcomingEvents = ref([]);

// Formatar status do lead
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    novo: 'Novo',
    em_andamento: 'Em Andamento',
    agendado: 'Agendado'
  };
  return statusMap[status] || status;
};

// Formatar data do evento
const formatEventDate = (date: Date, part: 'day' | 'month') => {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  if (part === 'day') {
    return new Date(date).getDate();
  }
  return months[new Date(date).getMonth()];
};

// Carregar dados do dashboard
const loadDashboardData = async () => {
  try {
    // Aqui virão as chamadas reais para os serviços
    // Por enquanto, usando dados mockados
    totalRealtors.value = 12;
    monthlyLeads.value = 45;
    activeProperties.value = 128;
    monthlyRevenue.value = '324.500';

    topRealtors.value = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana.silva@thehub.com',
        photoURL: '',
        activeLeads: 8,
        properties: 12,
        monthlyRevenue: '85.000'
      },
      // Adicionar mais realtors aqui
    ];

    recentLeads.value = [
      {
        id: 1,
        name: 'João Paulo',
        interest: 'Apartamento 3 quartos',
        status: 'novo'
      },
      // Adicionar mais leads aqui
    ];

    upcomingEvents.value = [
      {
        id: 1,
        date: new Date(),
        title: 'Visita Apartamento',
        time: '14:30',
        realtor: 'Ana Silva'
      },
      // Adicionar mais eventos aqui
    ];
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>
