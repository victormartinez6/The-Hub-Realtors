<template>
  <!-- ... -->
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useAuthStore } from '../stores/auth';
import router from '../router';
import { dashboardService } from '../services/dashboardService';

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
  // ...
});

// Carregar dados do dashboard
const loadDashboardData = async () => {
  // ...
};

onMounted(() => {
  if (authStore.isAdmin) {
    router.replace('/admin/users');
  } else {
    // Verificar se a autenticação já foi inicializada
    if (!authStore.initialized) {
      console.log('Aguardando inicialização da autenticação...');
      // Verificar periodicamente se a autenticação foi inicializada
      const checkAuth = setInterval(() => {
        if (authStore.initialized) {
          clearInterval(checkAuth);
          handleDashboardNavigation();
        }
      }, 500);
    } else {
      handleDashboardNavigation();
    }
  }
});

// Função para lidar com a navegação do dashboard após a autenticação
const handleDashboardNavigation = () => {
  const role = authStore.userRole;
  console.log('Navegando para dashboard com role:', role);
  
  if (role === 'broker') {
    router.replace('/dashboard/broker');
  } else if (role === 'realtor') {
    router.replace('/dashboard/realtor');
  } else if (role === 'partner') {
    router.replace('/dashboard/partner');
  } else {
    // Garantir que userId e userRole existam antes de carregar dados
    if (authStore.userId && authStore.userRole) {
      loadDashboardData();
    } else {
      console.error('Erro: userId ou userRole indefinidos');
      error.value = 'Erro ao carregar dados do usuário';
    }
  }
};

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