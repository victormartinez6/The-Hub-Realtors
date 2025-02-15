<template>
  <div class="dashboard-container min-h-screen bg-white">
    <!-- Header com Stats Principais -->
    <div class="stats-container p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="stat in mainStats" :key="stat.title" 
           class="stat-card bg-white rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-[#01FBA1]/30 hover:border-[#01FBA1] group shadow-sm hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-gray-500 text-sm font-medium mb-2">{{ stat.title }}</h3>
            <p class="text-3xl font-bold text-gray-900 group-hover:text-primary-600">{{ stat.value }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#01FBA1]/10 flex items-center justify-center group-hover:bg-[#01FBA1]/20">
            <component :is="stat.icon" class="w-6 h-6 text-[#01FBA1]" />
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center space-x-2">
            <span :class="[
              'text-sm font-medium',
              stat.trend > 0 ? 'text-[#01FBA1]' : 'text-red-600'
            ]">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
            <span class="text-gray-400 text-sm">vs último mês</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="main-grid p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Gráfico Principal -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#01FBA1]/30 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ authStore.userRole === 'broker' ? 'Performance da Equipe' : 'Performance de Vendas' }}</h2>
          <div class="flex items-center space-x-4">
            <button v-for="period in periods" 
                    :key="period"
                    @click="setActivePeriod(period)"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                      activePeriod === period 
                        ? 'bg-[#012928] text-white' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-[#01FBA1]/10'
                    ]">
              {{ period }}
            </button>
          </div>
        </div>
        <div class="relative h-[400px]">
          <canvas ref="salesChart"></canvas>
        </div>
      </div>

      <!-- Cards de Informação -->
      <div class="flex flex-col space-y-6">
        <!-- Card de Leads -->
        <div class="bg-white rounded-2xl p-6 border border-[#01FBA1]/30 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4">
            {{ authStore.userRole === 'partner' ? 'Leads Indicados' : 'Leads Recentes' }}
          </h3>
          <div class="space-y-4">
            <div v-for="lead in dashboardData.recentLeads" 
                 :key="lead.id" 
                 class="flex items-center space-x-4 p-3 rounded-xl border border-transparent hover:border-[#01FBA1] transition-all duration-300">
              <div class="w-10 h-10 rounded-full bg-[#01FBA1]/10 flex items-center justify-center text-[#01FBA1] font-bold">
                {{ lead.name.charAt(0) }}
              </div>
              <div class="flex-1">
                <h4 class="text-gray-900 font-medium">{{ lead.name }}</h4>
                <p class="text-gray-500 text-sm">{{ lead.interest }}</p>
                <p v-if="authStore.userRole === 'broker' && lead.assignedTo" class="text-xs text-gray-400">
                  Atribuído para: {{ lead.assignedTo }}
                </p>
                <p v-if="authStore.userRole === 'partner' && lead.brokerName" class="text-xs text-gray-400">
                  Broker: {{ lead.brokerName }}
                </p>
              </div>
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                statusColors[lead.status]
              ]">
                {{ lead.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card de Performance da Equipe (apenas para Broker) -->
        <div v-if="authStore.userRole === 'broker'" class="bg-white rounded-2xl p-6 border border-[#01FBA1]/30 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Performance da Equipe</h3>
          <div class="space-y-4">
            <div v-for="member in dashboardData.teamPerformance" 
                 :key="member.realtorId" 
                 class="p-4 rounded-xl bg-white border border-[#01FBA1]/20 hover:border-[#01FBA1] transition-all duration-300">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">{{ member.realtorName }}</span>
                <span class="text-sm text-gray-500">
                  {{ new Date(member.lastActivity).toLocaleDateString('pt-BR') }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <p class="text-xs text-gray-500">Leads</p>
                  <p class="font-medium">{{ member.leadsCount }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Conversões</p>
                  <p class="font-medium">{{ member.conversions }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Comissão</p>
                  <p class="font-medium">R$ {{ (member.commission / 1000).toFixed(1) }}K</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Próximos Eventos -->
        <div v-if="['broker', 'realtor'].includes(authStore.userRole)" class="bg-white rounded-2xl p-6 border border-[#01FBA1]/30 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Próximos Eventos</h3>
          <div class="space-y-4">
            <div v-for="event in dashboardData.upcomingEvents" 
                 :key="event.id" 
                 class="p-4 rounded-xl bg-white border border-[#01FBA1]/20 hover:border-[#01FBA1] transition-all duration-300">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">{{ event.title }}</span>
                <span class="text-sm text-[#01FBA1]">{{ event.time }}</span>
              </div>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <span>{{ new Date(event.date).toLocaleDateString('pt-BR') }}</span>
                <span>•</span>
                <span class="capitalize">{{ event.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Propriedades Recentes (apenas para Broker e Realtor) -->
        <div v-if="['broker', 'realtor'].includes(authStore.userRole)" class="bg-white rounded-2xl p-6 border border-[#01FBA1]/30 shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Propriedades Recentes</h3>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="property in dashboardData.recentProperties" 
                 :key="property.id" 
                 class="group relative rounded-xl overflow-hidden">
              <img :src="property.image" :alt="property.title" class="w-full h-32 object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h4 class="text-sm font-medium truncate">{{ property.title }}</h4>
                <p class="text-xs">R$ {{ (property.price / 1000000).toFixed(1) }}M</p>
              </div>
              <span :class="[
                'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
                property.status === 'ativo' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
              ]">
                {{ property.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Seção de Atividades -->
    <div class="activity-section p-6" v-if="dashboardData.recentActivities?.length">
      <div class="bg-white rounded-2xl p-6 border border-[#01FBA1]/30 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Atividades Recentes</h2>
          <button class="text-[#01FBA1] hover:text-[#01FBA1]/80 transition-colors duration-300">
            Ver todas
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="activity in dashboardData.recentActivities" 
               :key="activity.id" 
               class="p-4 rounded-xl bg-white border border-[#01FBA1]/20 hover:border-[#01FBA1] transition-all duration-300">
            <div class="flex items-start space-x-4">
              <div class="w-8 h-8 rounded-lg bg-[#01FBA1]/10 flex items-center justify-center group-hover:bg-[#01FBA1]/20 transition-all duration-300">
                <component :is="activity.icon" class="w-4 h-4 text-[#01FBA1]" />
              </div>
              <div class="flex-1">
                <p class="text-gray-900 font-medium">{{ activity.title }}</p>
                <p class="text-gray-600 text-sm">{{ activity.description }}</p>
                <p class="text-gray-400 text-xs mt-2">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const authStore = useAuthStore();
const isLoading = ref(true);
const error = ref(null);

// Dados do dashboard
const dashboardData = ref({
  stats: null,
  recentLeads: [],
  teamPerformance: [],
  upcomingEvents: [],
  recentProperties: [],
  recentActivities: []
});

// Estatísticas principais baseadas no tipo de usuário
const mainStats = computed(() => {
  if (!dashboardData.value.stats) return [];

  const stats = dashboardData.value.stats;
  const baseStats = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads.toString(),
      trend: ((stats.newLeadsThisMonth / stats.totalLeads) * 100) || 0,
      icon: UserGroupIcon
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats.conversionRate}%`,
      trend: stats.conversionRate - (stats.lastMonthConversionRate || 0),
      icon: ChartBarIcon
    }
  ];

  // Stats específicos para cada role
  if (authStore.userRole === 'broker') {
    return [
      ...baseStats,
      {
        title: 'Imóveis Ativos',
        value: stats.activeProperties.toString(),
        trend: ((stats.newProperties / stats.activeProperties) * 100) || 0,
        icon: HomeIcon
      },
      {
        title: 'Comissão Mensal',
        value: `R$ ${(stats.monthlyCommission / 1000).toFixed(1)}K`,
        trend: stats.commissionTrend,
        icon: CurrencyDollarIcon
      }
    ];
  } else if (authStore.userRole === 'realtor') {
    return [
      ...baseStats,
      {
        title: 'Leads Ativos',
        value: stats.activeLeads.toString(),
        trend: ((stats.newLeadsThisMonth / stats.activeLeads) * 100) || 0,
        icon: UserIcon
      },
      {
        title: 'Comissão Mensal',
        value: `R$ ${(stats.monthlyCommission / 1000).toFixed(1)}K`,
        trend: stats.commissionTrend,
        icon: CurrencyDollarIcon
      }
    ];
  } else { // partner
    return [
      ...baseStats,
      {
        title: 'Leads Indicados',
        value: stats.referredLeads.toString(),
        trend: ((stats.newReferredLeads / stats.referredLeads) * 100) || 0,
        icon: DocumentTextIcon
      },
      {
        title: 'Comissão Mensal',
        value: `R$ ${(stats.monthlyCommission / 1000).toFixed(1)}K`,
        trend: stats.commissionTrend,
        icon: CurrencyDollarIcon
      }
    ];
  }
});

// Carregar dados do dashboard
const loadDashboardData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Carregar estatísticas baseadas no tipo de usuário
    const stats = await dashboardService.getStats(
      authStore.userId,
      authStore.userRole
    );
    dashboardData.value.stats = stats;

    // Carregar leads recentes
    const recentLeads = await dashboardService.getRecentLeads(
      authStore.userId,
      authStore.userRole
    );
    dashboardData.value.recentLeads = recentLeads;

    // Se for broker, carregar performance da equipe
    if (authStore.userRole === 'broker') {
      const teamPerformance = await dashboardService.getTeamPerformance(
        authStore.userId
      );
      dashboardData.value.teamPerformance = teamPerformance;
    }

    // Carregar eventos próximos
    const upcomingEvents = await dashboardService.getUpcomingEvents(
      authStore.userId,
      authStore.userRole
    );
    dashboardData.value.upcomingEvents = upcomingEvents;

    // Carregar propriedades recentes (apenas para broker e realtor)
    if (['broker', 'realtor'].includes(authStore.userRole)) {
      const recentProperties = await dashboardService.getRecentProperties(
        authStore.userId,
        authStore.userRole
      );
      dashboardData.value.recentProperties = recentProperties;
    }

    // Carregar atividades recentes
    const recentActivities = await dashboardService.getRecentActivities(
      authStore.userId,
      authStore.userRole
    );
    dashboardData.value.recentActivities = recentActivities;

  } catch (err) {
    console.error('Erro ao carregar dados do dashboard:', err);
    error.value = 'Erro ao carregar dados do dashboard';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAdmin) {
    router.replace('/admin/users');
  } else {
    const role = authStore.userRole;
    if (role === 'broker') {
      router.replace('/dashboard/broker');
    } else if (role === 'realtor') {
      router.replace('/dashboard/realtor');
    } else if (role === 'partner') {
      router.replace('/dashboard/partner');
    } else {
      loadDashboardData();
    }
  }
});

const periods = ['7D', '30D', '90D', 'YTD'];
const activePeriod = ref('30D');

const setActivePeriod = (period) => {
  activePeriod.value = period;
  // Recarregar dados do gráfico baseado no período
};

const statusColors = {
  'Novo': 'bg-blue-100 text-blue-800',
  'Em Progresso': 'bg-yellow-100 text-yellow-800',
  'Convertido': 'bg-green-100 text-green-800',
  'Perdido': 'bg-red-100 text-red-800'
};
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -2px rgba(99, 102, 241, 0.05);
}
</style>