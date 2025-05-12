<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Configurações Gerais</h1>
      
      <div v-if="isLoading" class="text-center py-4">
        <p class="text-gray-600">Carregando...</p>
      </div>
      
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card de configurações de email SendGrid -->
          <div 
            v-if="hasPermission('email_sendgrid')"
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <svg class="h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">SendGrid</h3>
                <p class="mt-1 text-sm text-gray-600">Configure o serviço de email SendGrid para envio de emails.</p>
                <div class="mt-3">
                  <router-link 
                    to="/dashboard/broker/email_sendgrid" 
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Configurar SendGrid
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Card de configurações de email SMTP -->
          <div 
            v-if="hasPermission('email_smtp')"
            class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <svg class="h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">SMTP</h3>
                <p class="mt-1 text-sm text-gray-600">Configure seu próprio servidor SMTP para envio de emails.</p>
                <div class="mt-3">
                  <router-link 
                    to="/dashboard/broker/email_smtp" 
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Configurar SMTP
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!hasAnyEmailServicePermission" class="mt-6">
          <p class="text-gray-600">Você não tem permissão para acessar nenhuma configuração.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { menuPermissionService } from '../services/menuPermissionService';

const authStore = useAuthStore();
const isLoading = ref(true);

// Verificar se o usuário tem permissão para acessar uma funcionalidade específica
const hasPermission = (permissionKey: string) => {
  const role = authStore.userData?.role;
  if (!role) return false;
  
  return menuPermissionService.hasPermission(permissionKey, role);
};

// Verificar se o usuário tem permissão para acessar pelo menos uma das configurações de email
const hasAnyEmailServicePermission = computed(() => {
  return hasPermission('email_sendgrid') || hasPermission('email_smtp');
});

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
  await menuPermissionService.loadMenuConfig();

  console.log('Settings montado.');
  console.log('User role:', authStore.userData?.role);
  console.log('Tem permissão para configurações de email?', hasAnyEmailServicePermission.value);
  isLoading.value = false;
});
</script>
