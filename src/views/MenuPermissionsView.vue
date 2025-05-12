<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ t('menu_permissions.title') }}</h1>
    
    <!-- Descrição da página -->
    <div class="bg-blue-50 p-4 rounded-lg mb-6">
      <p class="text-blue-800">{{ t('menu_permissions.description') }}</p>
    </div>
    
    <!-- Painel principal -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <!-- Tabs para diferentes perfis -->
      <div class="border-b border-gray-200 mb-6">
        <ul class="flex flex-wrap -mb-px">
          <li v-for="role in availableRoles" :key="role" class="mr-2">
            <button 
              @click="selectedRole = role" 
              class="inline-block py-3 px-5 font-medium text-center rounded-t-lg border-b-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#451A37]"
              :class="selectedRole === role 
                ? 'text-white bg-[#451A37] border-[#451A37] shadow-md' 
                : 'text-gray-600 border-transparent hover:text-[#451A37] hover:border-[#451A37] hover:bg-gray-50'"
            >
              {{ getRoleTranslation(role) }}
            </button>
          </li>
        </ul>
      </div>
      
      <!-- Tabela de itens de menu -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('menu_permissions.menu_item') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('menu_permissions.path') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('menu_permissions.menu_description') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('menu_permissions.access') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in navigationConfig" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center text-gray-500">
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getTranslatedName(item) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ item.path }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">{{ item.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    :id="`menu-${index}`" 
                    :checked="hasAccess(item, selectedRole)"
                    @change="toggleAccess(item, selectedRole)"
                    class="h-4 w-4 text-[#451A37] focus:ring-[#451A37] border-gray-300 rounded"
                  />
                  <label :for="`menu-${index}`" class="ml-2 block text-sm text-gray-900">
                    {{ hasAccess(item, selectedRole) ? t('common.yes') : t('common.no') }}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Botões de ação -->
      <div class="flex justify-end mt-6 space-x-3">
        <button 
          @click="resetChanges" 
          class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          {{ t('common.cancel') }}
        </button>
        <button 
          @click="saveChanges" 
          class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#451A37] hover:bg-[#451A37]/90 focus:outline-none"
          :disabled="!hasChanges"
        >
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTranslation } from '../composables/useTranslation';
import { useAuthStore } from '../stores/auth';
import { menuPermissionsService } from '../services/menuPermissions.service';
import type { NavigationItem } from '../services/menuPermissions.service';
import { navigationConfig as originalNavigationConfig } from '../config/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const { t } = useTranslation();
const authStore = useAuthStore();

// Estado local
const isLoading = ref(false);
const selectedRole = ref('super_admin');
const navigationConfig = ref<NavigationItem[]>([]);
const originalConfig = ref<NavigationItem[]>([]);

// Lista de papéis disponíveis
const availableRoles = ref([
  'super_admin',
  'admin',
  'broker',
  'realtor',
  'partner',
  'user'
]);

// Verificar se houve alterações
const hasChanges = computed(() => {
  return JSON.stringify(navigationConfig.value) !== JSON.stringify(originalConfig.value);
});

// Verificar se um perfil tem acesso a um item de menu
function hasAccess(item: NavigationItem, role: string): boolean {
  return item.roles?.includes(role) || false;
}

// Função para obter o nome traduzido de um item de menu
function getTranslatedName(item: NavigationItem): string {
  if (item.translationKey) {
    const key = `nav.${item.translationKey}`;
    const translation = t(key);
    
    // Verificar se a tradução foi encontrada
    if (translation !== key) {
      return translation;
    }
  }
  
  // Fallback para o nome original se não houver tradução
  return item.name;
}

// Função para obter a tradução de um role
function getRoleTranslation(role: string): string {
  const key = `roles.${role}`;
  const translation = t(key);
  
  // Verificar se a tradução foi encontrada
  if (translation !== key) {
    return translation;
  }
  
  // Fallback para nomes padrão
  switch (role) {
    case 'super_admin': return 'Super Administrador';
    case 'admin': return 'Administrador';
    case 'broker': return 'Imobiliária';
    case 'realtor': return 'Corretor';
    case 'partner': return 'Parceiro';
    default: return 'Usuário';
  }
}

// Alternar acesso de um perfil a um item de menu
function toggleAccess(item: NavigationItem, role: string): void {
  const index = navigationConfig.value.findIndex(
    (navItem: NavigationItem) => navItem.path === item.path && navItem.name === item.name
  );
  
  if (index === -1) return;
  
  const updatedItem = { ...navigationConfig.value[index] };
  
  if (!updatedItem.roles) {
    updatedItem.roles = [role];
  } else if (updatedItem.roles.includes(role)) {
    updatedItem.roles = updatedItem.roles.filter((r: string) => r !== role);
  } else {
    updatedItem.roles = [...updatedItem.roles, role];
  }
  
  // Atualizar o item no array
  navigationConfig.value = [
    ...navigationConfig.value.slice(0, index),
    updatedItem,
    ...navigationConfig.value.slice(index + 1)
  ];
}

// Carregar configuração de menu do Firestore
async function loadMenuConfig() {
  isLoading.value = true;
  
  try {
    const menuConfigRef = doc(db, 'appConfig', 'menuPermissions');
    const menuConfigDoc = await getDoc(menuConfigRef);
    
    if (menuConfigDoc.exists()) {
      const data = menuConfigDoc.data();
      navigationConfig.value = data.navigationConfig;
      
      // Verificar se há itens no menu padrão que não existem na configuração carregada
      for (const item of originalNavigationConfig) {
        const existingIndex = navigationConfig.value.findIndex(navItem => navItem.path === item.path);
        if (existingIndex === -1) {
          // Se não existir, adicionar
          navigationConfig.value.push({...item});
        }
      }
    } else {
      // Se não existir configuração no Firestore, usar a configuração padrão
      navigationConfig.value = [...originalNavigationConfig];
    }
    
    // Salvar uma cópia para comparação
    originalConfig.value = JSON.parse(JSON.stringify(navigationConfig.value));
  } catch (error) {
    console.error('Erro ao carregar configurações de menu:', error);
    alert(t('menu_permissions.load_error'));
  } finally {
    isLoading.value = false;
  }
}

// Salvar alterações no Firestore
async function saveChanges() {
  isLoading.value = true;
  
  try {
    const menuConfigRef = doc(db, 'appConfig', 'menuPermissions');
    await setDoc(menuConfigRef, {
      navigationConfig: navigationConfig.value,
      updatedAt: new Date(),
      updatedBy: authStore.user?.uid
    });
    
    // Atualizar a cópia original
    originalConfig.value = JSON.parse(JSON.stringify(navigationConfig.value));
    
    // Atualizar o serviço de permissões de menu
    await menuPermissionsService.loadMenuConfig();
    
    alert(t('menu_permissions.save_success'));
  } catch (error) {
    console.error('Erro ao salvar configurações de menu:', error);
    alert(t('menu_permissions.save_error'));
  } finally {
    isLoading.value = false;
  }
}

// Resetar alterações
function resetChanges() {
  navigationConfig.value = JSON.parse(JSON.stringify(originalConfig.value));
}

// Carregar dados quando o componente é montado
onMounted(() => {
  loadMenuConfig();
});
</script>
