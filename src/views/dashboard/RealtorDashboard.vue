<template>
  <div class="space-y-8 p-6">
    <!-- Cabeçalho com Boas-vindas -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Olá, {{ authStore.userData?.displayName?.split(' ')[0] }}!</h1>
        <p class="mt-1 text-sm text-gray-500">Acompanhe seu desempenho e leads</p>
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
          <div class="flex items-center" :class="stats.newLeadsThisMonth > 0 ? 'text-green-500' : 'text-red-500'">
            <span class="mr-1">{{ stats.newLeadsThisMonth > 0 ? '+' : '' }}{{ stats.newLeadsThisMonth }}%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="stats.newLeadsThisMonth > 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Leads Ativos</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.totalLeads }}</p>
        <div class="mt-2 text-xs text-gray-500">vs. mês anterior</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-center" :class="stats.convertedLeads > 0 ? 'text-green-500' : 'text-red-500'">
            <span class="mr-1">{{ stats.convertedLeads > 0 ? '+' : '' }}{{ stats.convertedLeads }}%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="stats.convertedLeads > 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Taxa de Conversão</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.conversionRate }}%</p>
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
            <span class="mr-1">+{{ stats.newProperties }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Imóveis Ativos</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.activeProperties }}</p>
        <div class="mt-2 text-xs text-gray-500">novos este mês</div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-purple-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex items-center text-green-500 text-sm font-medium">
            <span class="mr-1">{{ Math.round((stats.monthlyCommission / stats.commissionTrend) * 100) }}%</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        <h3 class="text-gray-500 text-sm font-medium">Comissões (Mês)</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900">R$ {{ formatCurrency(stats.monthlyCommission) }}</p>
        <div class="mt-2 text-xs text-gray-500">Meta: R$ {{ formatCurrency(stats.commissionTrend) }}</div>
      </div>
    </div>

    <!-- Leads e Agenda -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Meus Leads -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Meus Leads</h2>
              <p class="mt-1 text-sm text-gray-500">Leads atribuídos a você</p>
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
                  <div class="text-sm text-gray-500">{{ lead.interest }}</div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': lead.status === 'novo',
                    'bg-yellow-100 text-yellow-800': lead.status === 'em_andamento',
                    'bg-blue-100 text-blue-800': lead.status === 'agendado'
                  }"
                >
                  {{ formatStatus(lead.status) }}
                </span>
                <button 
                  @click="openLeadDetails(lead.id)"
                  class="p-1 text-gray-400 hover:text-[#012928] transition-colors duration-200 rounded-full hover:bg-gray-100"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Próximos Compromissos -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Próximos Compromissos</h2>
              <p class="mt-1 text-sm text-gray-500">Sua agenda dos próximos dias</p>
            </div>
            <router-link 
              to="/calendar" 
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
                <div class="text-2xl font-bold text-gray-900">{{ formatEventDate(event.date) }}</div>
                <div class="text-xs font-medium text-gray-500 uppercase">{{ new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }) }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ event.title }}</p>
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
                  {{ formatEventType(event.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meus Imóveis -->
    <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Meus Imóveis</h2>
            <p class="mt-1 text-sm text-gray-500">Imóveis sob sua responsabilidade</p>
          </div>
          <router-link 
            to="/properties" 
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Ver todos
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="property in recentProperties" :key="property.id" 
            class="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-[#01FBA1] transition-colors duration-200"
          >
            <div class="aspect-w-16 aspect-h-9">
              <img 
                :src="property.image" 
                :alt="property.title"
                class="object-cover w-full h-full"
              >
            </div>
            <div class="p-4">
              <h3 class="text-sm font-medium text-gray-900 truncate">{{ property.title }}</h3>
              <p class="mt-1 text-sm text-gray-500 truncate">{{ property.address }}</p>
              <div class="mt-2 flex justify-between items-center">
                <p class="text-lg font-bold text-[#012928]">R$ {{ formatCurrency(property.price) }}</p>
                <button
                  @click="openPropertyDetails(property.id)"
                  class="p-1.5 text-gray-400 hover:text-[#012928] transition-colors duration-200 rounded-full hover:bg-[#01FBA1]/10"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Estados
const stats = ref({
  totalLeads: 0,
  newLeadsThisMonth: 0,
  convertedLeads: 0,
  conversionRate: 0,
  activeProperties: 0,
  newProperties: 0,
  monthlyCommission: 0,
  commissionTrend: 0
});
const recentLeads = ref([]);
const upcomingEvents = ref([]);
const recentProperties = ref([]);
const loading = ref(true);
const error = ref('');

// Formatadores
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatEventDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
  return `${day}\n${month}`;
};

const formatEventType = (type: string) => {
  const types = {
    visita: 'Visita',
    reuniao: 'Reunião',
    contrato: 'Contrato'
  };
  return types[type] || type;
};

const formatStatus = (status: string) => {
  const statuses = {
    novo: 'Novo',
    em_andamento: 'Em Andamento',
    convertido: 'Convertido'
  };
  return statuses[status] || status;
};

// Carregar dados
const loadDashboardData = async () => {
  try {
    loading.value = true;
    error.value = '';

    const userId = authStore.user?.uid;
    const userRole = authStore.userRole;

    if (!userId || !userRole) {
      throw new Error('Usuário não autenticado');
    }

    // Carregar todas as informações em paralelo
    const [
      statsData,
      leadsData,
      eventsData,
      propertiesData
    ] = await Promise.all([
      dashboardService.getStats(userId, userRole),
      dashboardService.getRecentLeads(userId, userRole),
      dashboardService.getUpcomingEvents(userId, userRole),
      dashboardService.getRecentProperties(userId, userRole)
    ]);

    stats.value = statsData;
    recentLeads.value = leadsData;
    upcomingEvents.value = eventsData;
    recentProperties.value = propertiesData;
  } catch (err: any) {
    console.error('Erro ao carregar dados do dashboard:', err);
    error.value = 'Erro ao carregar dados do dashboard. Por favor, tente novamente.';
  } finally {
    loading.value = false;
  }
};

// Ações
const openLeadDetails = (leadId: string) => {
  router.push(`/leads/${leadId}`);
};

const openPropertyDetails = (propertyId: string) => {
  router.push(`/properties/${propertyId}`);
};

// Carregar dados quando o componente é montado
onMounted(() => {
  loadDashboardData();
});
</script>
