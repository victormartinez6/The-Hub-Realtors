<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from './components/AppLayout.vue';

const authStore = useAuthStore();
const route = useRoute();

const isAuthPage = computed(() => {
  return ['/login', '/register', '/forgot-password'].includes(route.path);
});

// Inicializar autenticação uma única vez
onMounted(async () => {
  try {
    await authStore.initAuth();
  } catch (error) {
    console.error('Erro ao inicializar autenticação:', error);
  }
});
</script>

<template>
  <template v-if="authStore.initialized">
    <AppLayout v-if="authStore.user && !isAuthPage">
      <RouterView />
    </AppLayout>
    <RouterView v-else />
  </template>
  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
</template>