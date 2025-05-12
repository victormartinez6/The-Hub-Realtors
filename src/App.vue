<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useNotificationStore } from './stores/notifications/notificationStore';
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from './components/AppLayout.vue';
import HighPriorityNotificationModal from './components/notifications/HighPriorityNotificationModal.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

// Estado para controlar a exibição do modal de notificações de alta prioridade
const showHighPriorityModal = ref(false);

const isAuthPage = computed(() => {
  return ['/login', '/register', '/forgot-password'].includes(route.path);
});

// Notificações de alta prioridade
const highPriorityNotifications = computed(() => {
  return notificationStore.notifications.filter(
    notification => notification.highPriority && !notification.read
  );
});

// Observar mudanças nas notificações de alta prioridade
watch(
  highPriorityNotifications,
  (newNotifications) => {
    if (newNotifications.length > 0 && authStore.user && !isAuthPage.value) {
      showHighPriorityModal.value = true;
    } else {
      showHighPriorityModal.value = false;
    }
  },
  { immediate: true }
);

// Inicializar autenticação uma única vez
onMounted(async () => {
  try {
    await authStore.initAuth();
    
    // Carregar notificações após a autenticação
    if (authStore.user) {
      console.log('Usuário autenticado, carregando notificações...');
      
      // Usar reloadNotifications em vez de loadNotifications para garantir que todas as notificações sejam carregadas
      await notificationStore.reloadNotifications();
      
      console.log('Notificações carregadas:', notificationStore.notifications.length);
      console.log('Notificações de alta prioridade:', highPriorityNotifications.value.length);
      
      // Verificar se há notificações de alta prioridade
      if (highPriorityNotifications.value.length > 0 && !isAuthPage.value) {
        console.log('Exibindo modal de notificações de alta prioridade');
        showHighPriorityModal.value = true;
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar autenticação:', error);
  }
});

// Manipuladores de eventos
const handleModalClose = () => {
  console.log('Fechando modal de notificações de alta prioridade');
  showHighPriorityModal.value = false;
};

const handleMarkAsRead = async () => {
  console.log('Marcando notificações como lidas e recarregando');
  // Recarregar notificações para atualizar o estado
  await notificationStore.reloadNotifications();
};
</script>

<template>
  <template v-if="authStore.initialized">
    <AppLayout v-if="authStore.user && !isAuthPage">
      <RouterView />
    </AppLayout>
    <RouterView v-else />
    
    <!-- Modal de notificações de alta prioridade -->
    <HighPriorityNotificationModal
      :show="showHighPriorityModal"
      :notifications="highPriorityNotifications"
      @close="handleModalClose"
      @markAsRead="handleMarkAsRead"
    />
  </template>
  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
</template>
