<template>
  <nav class="flex flex-col h-full bg-white border-r border-gray-100">
    <!-- Logo -->
    <div class="flex items-center justify-center flex-shrink-0 py-8 border-b border-gray-100">
      <a href="#" class="flex items-center">
        <img :src="logoNome" alt="The Hub Realtors" class="h-12 w-auto">
      </a>
    </div>

    <!-- Links de Navegação -->
    <div class="flex-1 py-4 space-y-1 overflow-hidden hover:overflow-y-auto">
      <router-link
        v-for="item in filteredNavigation"
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive }"
      >
        <div
          class="relative mx-3 group"
        >
          <div
            class="flex items-center gap-3 p-2 text-gray-600 rounded-lg transition-all duration-200"
            :class="{
              'text-[#012928] bg-[#01FBA1]/5': isActive,
              'hover:text-[#012928] hover:bg-gray-50': !isActive
            }"
          >
            <svg
              class="w-5 h-5 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="item.icon"
              />
            </svg>
            <span class="text-sm font-medium">{{ item.name }}</span>
          </div>
          
          <!-- Indicador de item ativo -->
          <div
            v-if="isActive"
            class="absolute left-0 top-2 h-[calc(100%-16px)] w-1 bg-[#01FBA1] rounded-r-full"
          ></div>
        </div>
      </router-link>
    </div>

    <!-- Perfil e Logout -->
    <div class="flex-shrink-0 p-4 border-t border-gray-100">
      <div class="flex flex-col space-y-4">
        <!-- Informações do Usuário -->
        <div class="flex items-start space-x-3">
          <!-- Foto do Perfil -->
          <div class="relative">
            <img
              class="w-10 h-10 rounded-full object-cover ring-2 ring-[#01FBA1]/20"
              :src="userPhotoUrl || 'https://ui-avatars.com/api/?name=' + userName"
              :alt="userName"
            >
            <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          
          <!-- Informações -->
          <div class="flex-1 min-w-0">
            <!-- Realtor Info -->
            <div class="mb-1">
              <p class="text-sm font-medium text-[#012928] truncate">
                {{ authStore.userData?.displayName }}
              </p>
              <p class="text-xs text-gray-500">
                {{ userRole }}
              </p>
            </div>
            
            <!-- Broker Info (se for Realtor) -->
            <div v-if="authStore.isRealtor" class="mt-2">
              <p class="text-sm font-medium text-[#012928] truncate">
                {{ brokerName }}
              </p>
              <p class="text-xs text-gray-500">
                Broker
              </p>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex gap-2 w-full">
          <!-- Link para Perfil -->
          <router-link
            to="/profile"
            class="flex items-center justify-center flex-1 px-3 py-1.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 mr-2 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Perfil
          </router-link>

          <!-- Botão de Logout -->
          <button
            @click="handleLogout"
            class="flex items-center justify-center flex-1 px-3 py-1.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 mr-2 transition-transform duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { userService } from '../services/userService';
import { navigationConfig } from '../config/navigation';
import logoNome from '../assets/images/The Hub Realtors_nome.svg';

const router = useRouter();
const authStore = useAuthStore();

// Estado
const brokerData = ref(null);

// Computed Properties
const userName = computed(() => {
  if (authStore.isRealtor) {
    return authStore.userData?.displayName || 'Realtor';
  }
  return authStore.userData?.displayName || 'Usuário';
});

const userRole = computed(() => {
  switch (authStore.userRole) {
    case 'super_admin': return 'Super Admin';
    case 'broker': return 'Broker';
    case 'realtor': return 'Realtor';
    case 'partner': return 'Parceiro';
    default: return 'Usuário';
  }
});

const userPhotoUrl = computed(() => authStore.userData?.photoURL || null);

const brokerName = computed(() => brokerData.value?.displayName || '');

const filteredNavigation = computed(() => {
  return navigationConfig.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(authStore.userRole);
  });
});

// Métodos
const handleLogout = async () => {
  try {
    const result = await authStore.logout();
    if (result && result.success) {
      router.push('/login');
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};

// Carregar dados do broker se for um realtor
const loadBrokerData = async () => {
  if (authStore.isRealtor && authStore.userData?.brokerId) {
    try {
      const broker = await userService.getUserBroker(authStore.userData.uid);
      brokerData.value = broker;
    } catch (error) {
      console.error('Erro ao carregar dados do broker:', error);
    }
  }
};

// Observar mudanças no userData para recarregar dados do broker
watch(() => authStore.userData, (newUserData) => {
  if (newUserData) {
    loadBrokerData();
  }
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
  if (authStore.userData) {
    loadBrokerData();
  }
});
</script>
