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
      <div v-for="item in filteredNavigation" :key="item.path" class="relative">
        <!-- Item de menu principal -->
        <div
          class="relative mx-3 group"
          :class="{ 'mb-1': hasChildItems(item.translationKey || '') }"
        >
          <div
            class="flex items-center justify-between gap-3 p-2 text-gray-600 rounded-lg transition-all duration-200 cursor-pointer"
            :class="{
              'text-[#012928] bg-[#01FBA1]/5': isActiveRoute(item.path),
              'hover:text-[#012928] hover:bg-gray-50': !isActiveRoute(item.path)
            }"
            @click="handleMenuItemClick(item)"
          >
            <div class="flex items-center gap-3">
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
            
            <!-- Ícone de expansão para itens com subitens -->
            <svg 
              v-if="hasChildItems(item.translationKey || '')" 
              class="w-4 h-4 transition-transform" 
              :class="{ 'rotate-180': expandedItems[item.translationKey || ''] }"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <!-- Indicador de item ativo -->
          <div
            v-if="isActiveRoute(item.path)"
            class="absolute left-0 top-2 h-[calc(100%-16px)] w-1 bg-[#01FBA1] rounded-r-full"
          ></div>
        </div>
        
        <!-- Subitens -->
        <div 
          v-if="hasChildItems(item.translationKey || '') && expandedItems[item.translationKey || '']"
          class="pl-8 space-y-1 mt-1 mb-2"
        >
          <router-link
            v-for="subItem in getChildItems(item.translationKey || '')"
            :key="subItem.path"
            :to="subItem.path"
            v-slot="{ isActive }"
          >
            <div class="relative mx-3 group">
              <div
                class="flex items-center gap-3 p-2 text-gray-600 rounded-lg transition-all duration-200"
                :class="{
                  'text-[#012928] bg-[#01FBA1]/5': isActive,
                  'hover:text-[#012928] hover:bg-gray-50': !isActive
                }"
              >
                <span class="text-sm font-medium">{{ subItem.name }}</span>
              </div>
              
              <!-- Indicador de subitem ativo -->
              <div
                v-if="isActive"
                class="absolute left-0 top-2 h-[calc(100%-16px)] w-1 bg-[#012928] rounded-r-full"
              ></div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Perfil e Logout -->
    <div class="flex-shrink-0 p-4 border-t border-gray-100">
      <div class="flex flex-col space-y-4">
        <!-- Informações do Usuário -->
        <div class="flex items-start space-x-3">
          <!-- Foto do Perfil -->
          <div class="relative">
            <img
              class="w-10 h-10 rounded-full object-cover ring-2 ring-[#012928]/20"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTranslation } from '../composables/useTranslation';
import { userService } from '../services/userService';
import { navigationConfig } from '../config/navigation';
import { menuPermissionService } from '../services/menuPermissionService';
import logoNome from '../assets/images/The Hub Realtors_nome.svg';
import type { UserRole } from '../types/models';
import type { NavigationItem } from '../config/navigation';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useTranslation(); // Usar nossa implementação personalizada

// Estado
const brokerData = ref<any>(null);
const menuItems = ref<NavigationItem[]>([]);
const isLoadingMenu = ref(true);
const forceRefresh = ref(0); // Ref para forçar atualizações

// Estado para controlar quais itens de menu estão expandidos
const expandedItems = ref<Record<string, boolean>>({});

// Função para alternar a expansão de um item de menu
const toggleExpand = (key: string) => {
  expandedItems.value[key] = !expandedItems.value[key];
};

// Verificar se um item tem subitens
const hasChildItems = (key: string) => {
  return menuItems.value.some(item => item.parent === key);
};

// Função para lidar com o clique em um item de menu
const handleMenuItemClick = (item: NavigationItem) => {
  const key = item.translationKey || '';
  
  // Se o item tem subitens, alternar a expansão
  if (hasChildItems(key)) {
    toggleExpand(key);
  }
  
  // Se o item tem um caminho válido, navegar para ele
  if (item.path && item.path !== '#') {
    router.push(item.path);
  }
};

// Função para verificar se uma rota é ativa
const isActiveRoute = (path: string) => {
  const currentPath = router.currentRoute.value.path;
  
  // Caso especial para o Dashboard
  if (path === '/') {
    // Se o item for o Dashboard (path = '/'), ele deve ser ativo quando estamos na raiz
    return currentPath === '/' || currentPath === '/dashboard' || currentPath === '';
  }
  
  // Para outros itens, verificar se a rota atual começa com o caminho do item
  // Isso garante que subrotas também ativem o item pai
  return currentPath === path || 
         (path !== '/' && currentPath.startsWith(path + '/'));
};

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

// Carregar itens de menu com base nas permissões
const loadMenuItems = async () => {
  try {
    isLoadingMenu.value = true;
    
    // Carregar configurações de permissões de menu
    await menuPermissionService.loadMenuConfig();
    
    // Filtrar itens de menu com base no perfil do usuário
    const userRole = authStore.userRole as UserRole;
    let items = await menuPermissionService.getMenuItemsForRole(userRole);
    
    // Remover itens duplicados (mesmo translationKey ou path)
    const uniqueKeys = new Map();
    items.forEach(item => {
      const key = item.translationKey || item.path;
      // Se já existe um item com essa chave, verificar qual manter
      if (uniqueKeys.has(key)) {
        // Se o item atual tem parent e o existente não, manter o existente
        if (item.parent && !uniqueKeys.get(key).parent) {
          return;
        }
        // Se o item existente tem parent e o atual não, substituir
        if (!item.parent && uniqueKeys.get(key).parent) {
          uniqueKeys.set(key, item);
          return;
        }
      }
      uniqueKeys.set(key, item);
    });
    
    // Converter o Map de volta para array
    menuItems.value = Array.from(uniqueKeys.values());
    
    console.log(`Navigation: ${menuItems.value.length} itens de menu carregados para o perfil ${userRole}`);
  } catch (error) {
    console.error('Navigation: Erro ao carregar itens de menu:', error);
    // Fallback para configuração padrão
    menuItems.value = navigationConfig;
  } finally {
    isLoadingMenu.value = false;
  }
};

// Observar mudanças no perfil do usuário
watch(() => authStore.userRole, () => {
  if (authStore.userRole === 'broker') {
    loadBrokerData();
  }
  
  // Recarregar itens de menu quando o perfil mudar
  loadMenuItems();
});

// Forçar atualização periódica para garantir que as traduções sejam atualizadas
onMounted(() => {
  // Função de callback para o evento de mudança de idioma
  const handleLocaleChange = () => {
    console.log('Evento locale-changed detectado no Navigation.vue');
    forceRefresh.value++;
  };

  // Adicionar um listener para o evento personalizado de mudança de idioma
  window.addEventListener('locale-changed', handleLocaleChange);

  // Limpar listener quando o componente for desmontado
  onUnmounted(() => {
    window.removeEventListener('locale-changed', handleLocaleChange);
    console.log('Listener de locale-changed removido');
  });
  
  // Carregar dados iniciais
  loadBrokerData();
  loadMenuItems();
});

// Computed Properties
const userName = computed(() => {
  if (authStore.isRealtor) {
    return authStore.userData?.displayName || t('roles.realtor');
  }
  return authStore.userData?.displayName || t('common.user');
});

const userRole = computed(() => {
  const role = authStore.userRole as UserRole;
  const roleKey = `roles.${role}`;
  const translation = t(roleKey);
  
  // Verificar se a tradução foi encontrada
  if (translation !== roleKey) {
    return translation;
  }
  
  // Fallback para nomes padrão se a tradução não for encontrada
  switch (role) {
    case 'super_admin': return 'Super Administrador';
    case 'broker': return 'Imobiliária';
    case 'realtor': return 'Corretor';
    case 'partner': return 'Parceiro';
    default: return 'Usuário';
  }
});

const userPhotoUrl = computed(() => authStore.userData?.photoURL || null);

const brokerName = computed(() => brokerData.value?.displayName || '');

const filteredNavigation = computed(() => {
  // Usar locale e forceRefresh como dependências para recalcular quando o idioma mudar
  locale.value; // Apenas para criar dependência reativa
  forceRefresh.value; // Forçar reatividade
  
  if (isLoadingMenu.value) return [];

  // Processar itens para adicionar nome traduzido
  const processedItems = menuItems.value.map(item => {
    // Simplificação: Adiciona 'nav.' ao translationKey antes de traduzir
    const keyToTranslate = item.translationKey ? `nav.${item.translationKey}` : null;
    
    // Tentar obter a tradução
    let translatedName = item.name; // Valor padrão é o nome original
    
    if (keyToTranslate) {
      const translation = t(keyToTranslate);
      // Usar a tradução apenas se ela não for igual à chave (ou seja, se a tradução foi encontrada)
      if (translation !== keyToTranslate) {
        translatedName = translation;
      }
    }
    
    return {
      ...item,
      name: translatedName,
      children: getChildItems(item.translationKey || '')
    };
  });

  // Filtrar apenas itens de nível superior (sem parent) e remover duplicados
  const uniqueItems = new Map();
  
  // Primeiro passo: coletar todos os itens de nível superior
  const topLevelItems = processedItems.filter(item => !item.parent);
  
  // Segundo passo: remover duplicados baseados no caminho (path)
  topLevelItems.forEach(item => {
    // Se já existe um item com esse caminho, não adicionar novamente
    if (!uniqueItems.has(item.path)) {
      uniqueItems.set(item.path, item);
    }
  });
  
  // Retornar array de itens únicos
  return Array.from(uniqueItems.values());
});

// Função para obter os subitens de um item de menu
const getChildItems = (parentKey: string) => {
  if (isLoadingMenu.value) return [];
  
  // Primeiro filtrar os itens com o parent correto
  const childItems = menuItems.value.filter(item => item.parent === parentKey);
  
  // Remover duplicados baseados no caminho (path)
  const uniqueItems = new Map();
  
  // Processar cada item filho
  const processedItems = childItems.map(item => {
    // Simplificação: Adiciona 'nav.' ao translationKey antes de traduzir
    const keyToTranslate = item.translationKey ? `nav.${item.translationKey}` : null;
    
    // Tentar obter a tradução
    let translatedName = item.name; // Valor padrão é o nome original
    
    if (keyToTranslate) {
      const translation = t(keyToTranslate);
      // Usar a tradução apenas se ela não for igual à chave (ou seja, se a tradução foi encontrada)
      if (translation !== keyToTranslate) {
        translatedName = translation;
      }
    }
    
    return {
      ...item,
      name: translatedName
    };
  });
  
  // Remover duplicados
  processedItems.forEach(item => {
    if (!uniqueItems.has(item.path)) {
      uniqueItems.set(item.path, item);
    }
  });
  
  // Retornar array de itens únicos
  return Array.from(uniqueItems.values());
};
</script>
