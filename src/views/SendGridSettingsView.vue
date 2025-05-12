<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Configurações SendGrid</h1>
      
      <div v-if="isLoading" class="text-center py-4">
        <p class="text-gray-600">Carregando...</p>
      </div>
      
      <template v-else>
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white shadow-md rounded-lg p-6">
            <SendgridSettings />
          </div>
          
          <div class="flex justify-end">
            <router-link 
              to="/settings" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Voltar para Configurações
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { menuPermissionsService } from '../services/menuPermissionService';
import SendgridSettings from '../components/SendGridSettings.vue';

const authStore = useAuthStore();
const isLoading = ref(true);

onMounted(async () => {
  if (!authStore.initialized) {
    console.log('Aguardando inicialização do auth...');
    await authStore.initAuth();
  }
  
  if (!authStore.userData) {
    console.log('Recarregando dados do usuário...');
    await authStore.refreshUserData();
  }
  
  // Carregar configurações de permissões de menu
  await menuPermissionsService.loadMenuConfig();

  console.log('SendGridSettings montado.');
  console.log('User role:', authStore.userData?.role);
  isLoading.value = false;
});
</script>
