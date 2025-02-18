<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Configurações Gerais</h1>
      
      <div v-if="isLoading" class="text-center py-4">
        <p class="text-gray-600">Carregando...</p>
      </div>
      
      <template v-else>
        <div v-if="isSuperAdmin">
          <SmtpSettings />
        </div>
        <div v-else>
          <p class="text-gray-600">Você não tem permissão para acessar estas configurações.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import SmtpSettings from '../components/SmtpSettings.vue';

const authStore = useAuthStore();
const isLoading = ref(true);

const isSuperAdmin = computed(() => {
  const role = authStore.userData?.role;
  console.log('Verificando role:', role);
  return role === 'super_admin';
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

  console.log('Settings montado. Super admin?', isSuperAdmin.value);
  console.log('User role:', authStore.userData?.role);
  isLoading.value = false;
});
</script>
