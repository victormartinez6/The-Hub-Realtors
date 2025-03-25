<script setup lang="ts">
import { ref, onMounted, computed, defineProps, defineEmits } from 'vue';
import { useUserManagementStore } from '../stores/userManagement';
import { logger } from '../utils/logger';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const props = defineProps({
  lead: {
    type: Object,
    required: true
  },
  showArchiveButton: {
    type: Boolean,
    default: false
  },
  userType: {
    type: String,
    required: true
  }
});

// Função para pré-carregar os dados dos usuários relacionados ao lead
const preloadUserData = async () => {
  console.log('Pré-carregando dados dos usuários relacionados ao lead');
  
  const userIds = new Set<string>();
  
  // Adiciona o broker
  if (props.lead.brokerId) {
    userIds.add(props.lead.brokerId);
  }
  
  // Adiciona os realtors
  if (props.lead.assignedRealtors && props.lead.assignedRealtors.length > 0) {
    props.lead.assignedRealtors.forEach((id: string) => userIds.add(id));
  }
  
  // Adiciona os partners
  if (props.lead.assignedPartners && props.lead.assignedPartners.length > 0) {
    props.lead.assignedPartners.forEach((id: string) => userIds.add(id));
  }
  
  console.log(`Total de usuários a carregar: ${userIds.size}`);
  
  // Carrega os dados de cada usuário
  const promises = Array.from(userIds).map(async (userId) => {
    try {
      // Primeiro tenta buscar do store
      if (!userManagementStore.users.some(u => u.id === userId)) {
        console.log(`Buscando dados do usuário ${userId} no Firestore`);
        
        // Busca diretamente do Firestore para garantir dados atualizados
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`Dados do usuário ${userId} obtidos do Firestore:`, userData);
          
          // Pré-carrega a foto do usuário
          if (userData.photoURL) {
            console.log(`Pré-carregando photoURL para ${userId}: ${userData.photoURL}`);
            Object.assign(userPhotoCache.value, { [userId]: userData.photoURL });
          } else if (userData.profilePicture) {
            console.log(`Pré-carregando profilePicture para ${userId}: ${userData.profilePicture}`);
            Object.assign(userPhotoCache.value, { [userId]: userData.profilePicture });
          } else {
            // Se não tiver foto, deixa vazio para mostrar as iniciais
            console.log(`Usuário ${userId} não tem foto de perfil`);
            Object.assign(userPhotoCache.value, { [userId]: '' });
          }
          
          // Pré-carrega o nome do usuário
          Object.assign(userNameCache.value, { [userId]: userData.displayName || 'Usuário' });
        } else {
          console.error(`Usuário ${userId} não encontrado no Firestore`);
        }
      } else {
        console.log(`Usuário ${userId} já está carregado no store`);
        const user = userManagementStore.users.find(u => u.id === userId);
        if (user) {
          // Pré-carrega a foto do usuário
          if (user.photoURL) {
            Object.assign(userPhotoCache.value, { [userId]: user.photoURL });
          } else if (user.profilePicture) {
            Object.assign(userPhotoCache.value, { [userId]: user.profilePicture });
          } else {
            // Se não tiver foto, deixa vazio para mostrar as iniciais
            Object.assign(userPhotoCache.value, { [userId]: '' });
          }
          
          // Pré-carrega o nome do usuário
          Object.assign(userNameCache.value, { [userId]: user.displayName || 'Usuário' });
        }
      }
    } catch (error) {
      console.error(`Erro ao carregar dados do usuário ${userId}:`, error);
    }
  });
  
  // Aguarda todas as promessas serem resolvidas
  await Promise.all(promises);
  console.log('Pré-carregamento de dados dos usuários concluído');
};

// Carrega os dados dos usuários quando o componente é montado
onMounted(async () => {
  console.log('LeadCard montado, carregando dados dos usuários');
  await preloadUserData();
});

const emit = defineEmits([
  'edit',
  'archive',
  'openNotes',
  'reactivate',
  'view-files'
]);

const userManagementStore = useUserManagementStore();

const formatDate = (value: Date | string | null | undefined): string => {
  if (!value) return 'N/A';
  return new Date(value as string | number | Date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatCurrency = (value: any) => {
  logger.debug('Formatando valor:', value, typeof value);
  
  // Se o valor for falsy (0, null, undefined, etc)
  if (value === null || value === undefined) {
    logger.debug('Valor é null ou undefined');
    return 'Valor não definido';
  }
  
  // Garante que o valor seja um número
  const numValue = Number(value);
  logger.debug('Valor convertido para número:', numValue, typeof numValue);
  
  if (isNaN(numValue)) {
    logger.error('Valor inválido para formatação:', value);
    return 'Valor não definido';
  }

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
    logger.debug('Valor formatado:', formatted);
    return formatted;
  } catch (error) {
    logger.error('Erro ao formatar valor:', error);
    return 'Valor não definido';
  }
};

const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

const hasNotes = computed(() => props.lead.notes && props.lead.notes.length > 0);

// Cache para armazenar as URLs das fotos dos usuários
const userPhotoCache = ref<Record<string, string>>({});

// Função síncrona que retorna a URL da foto do usuário do cache ou inicia a busca assíncrona
const getUserPhotoUrl = (userId: string): string => {
  // Verificação de segurança
  if (!userId) {
    console.warn('getUserPhotoUrl chamado com userId vazio');
    return '';
  }

  // Se a URL já estiver no cache, retorna imediatamente
  if (userPhotoCache.value[userId]) {
    console.log(`Usando URL do cache para ${userId}: ${userPhotoCache.value[userId]}`);
    return userPhotoCache.value[userId];
  }
  
  // Verifica se o usuário já está na lista
  const user = userManagementStore.users.find(u => u.id === userId);
  if (user) {
    console.log(`Usuário encontrado na lista para ${userId}: ${user.displayName}`);
    
    // Busca a foto do perfil do usuário
    if (user.photoURL) {
      console.log(`Usando photoURL para ${userId}: ${user.photoURL}`);
      Object.assign(userPhotoCache.value, { [userId]: user.photoURL });
      return user.photoURL;
    } 
    else if (user.profilePicture) {
      console.log(`Usando profilePicture para ${userId}: ${user.profilePicture}`);
      Object.assign(userPhotoCache.value, { [userId]: user.profilePicture });
      return user.profilePicture;
    }
    
    // Se não tiver foto, busca diretamente no Firestore
    console.log(`Usuário ${userId} não tem foto no cache, buscando no Firestore...`);
  }
  
  console.log(`Usuário não encontrado na lista para ${userId}, buscando no Firestore...`);
  
  // URL vazia enquanto a busca assíncrona está em andamento
  const loadingUrl = '';
  
  // Inicia a busca assíncrona e atualiza o cache quando concluída
  getDoc(doc(db, 'users', userId)).then(userDoc => {
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`Dados do usuário ${userId} obtidos diretamente do Firestore:`, userData);
      
      let photoUrl = null;
      
      if (userData.photoURL) {
        photoUrl = userData.photoURL;
        console.log(`Usando photoURL do Firestore para ${userId}: ${photoUrl}`);
      } else if (userData.profilePicture) {
        photoUrl = userData.profilePicture;
        console.log(`Usando profilePicture do Firestore para ${userId}: ${photoUrl}`);
      }
      
      if (photoUrl) {
        console.log(`Atualizando cache com foto do Firestore para ${userId}: ${photoUrl}`);
        Object.assign(userPhotoCache.value, { [userId]: photoUrl });
      } else {
        // Se não tiver foto, deixa vazio para mostrar as iniciais
        console.log(`Usuário ${userId} não tem foto de perfil`);
        Object.assign(userPhotoCache.value, { [userId]: '' });
      }
    } else {
      console.error(`Usuário ${userId} não encontrado no Firestore`);
      Object.assign(userPhotoCache.value, { [userId]: '' });
    }
  }).catch(error => {
    console.error(`Erro ao buscar usuário ${userId} no Firestore:`, error);
    Object.assign(userPhotoCache.value, { [userId]: '' });
  });
  
  // Retorna a URL vazia enquanto a busca assíncrona está em andamento
  return loadingUrl;
};

// Cache para armazenar os nomes dos usuários
const userNameCache = ref<Record<string, string>>({});

// Função síncrona que retorna o nome do usuário do cache ou inicia a busca assíncrona
const getUserName = (userId: string): string => {
  // Verificação de segurança
  if (!userId) {
    console.warn('getUserName chamado com userId vazio');
    return 'Usuário';
  }

  // Se o nome já estiver no cache, retorna imediatamente
  if (userNameCache.value[userId]) {
    return userNameCache.value[userId];
  }
  
  // Nome padrão enquanto a busca assíncrona está em andamento
  const defaultName = 'Carregando...';
  
  // Verifica se o usuário já está na lista
  const user = userManagementStore.users.find(u => u.id === userId);
  if (user) {
    const name = user.displayName || 'Usuário';
    Object.assign(userNameCache.value, { [userId]: name });
    return name;
  }
  
  // Inicia a busca assíncrona e atualiza o cache quando concluída
  getDoc(doc(db, 'users', userId)).then(userDoc => {
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const name = userData.displayName || 'Usuário';
      console.log(`Nome do usuário ${userId} obtido do Firestore: ${name}`);
      Object.assign(userNameCache.value, { [userId]: name });
    } else {
      console.error(`Usuário ${userId} não encontrado no Firestore`);
      Object.assign(userNameCache.value, { [userId]: 'Usuário não encontrado' });
    }
  }).catch(error => {
    console.error(`Erro ao buscar nome do usuário ${userId}:`, error);
    Object.assign(userNameCache.value, { [userId]: 'Erro' });
  });
  
  return defaultName;
};

const handleCardClick = () => {
  // Adicione a lógica de clique no cartão aqui
};

const getWhatsAppLink = (countryCode: string, phone: string) => {
  const fullNumber = `${countryCode}${phone}`.replace(/\D/g, '');
  return `https://wa.me/${fullNumber}`;
};

const formatPhoneDisplay = (countryCode: string, phone: string) => {
  return `+${countryCode} ${phone}`;
};

</script>

<template>
  <div 
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
    @click="handleCardClick"
  >
    <!-- Cabeçalho com nome e status -->
    <div class="mb-2">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-medium text-gray-900 truncate">
          {{ lead.name }}
        </h3>
        <div class="flex items-center space-x-2">
          <button
            @click.stop="$emit('openNotes', lead)"
            class="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-indigo-50"
            :class="{ 'text-indigo-600 bg-indigo-50': hasNotes }"
            :title="hasNotes ? 'Ver observações' : 'Sem observações'"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10m-10 4h10M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
            </svg>
          </button>
        </div>
      </div>
      <span class="text-xs px-2 py-1 rounded-full inline-block mt-1" :class="getPriorityColor(lead.priority)">
        {{ lead.priority }}
      </span>
    </div>

    <!-- Informações de contato -->
    <div class="space-y-2 mb-4">
      <!-- Valor do Imóvel -->
      <div class="flex items-center text-sm text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ formatCurrency(lead.propertyValue) }}</span>
      </div>

      <!-- Email -->
      <div class="flex items-center text-sm text-gray-600">
        <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <a :href="'mailto:' + lead.email" class="hover:text-indigo-600 transition-colors duration-200">{{ lead.email }}</a>
      </div>

      <!-- Telefone -->
      <div class="flex items-center text-sm text-gray-600">
        <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <a 
          :href="getWhatsAppLink(lead.countryCode, lead.phone)" 
          target="_blank" 
          class="hover:text-indigo-600 transition-colors duration-200"
          @click.stop
        >
          {{ formatPhoneDisplay(lead.countryCode, lead.phone) }}
        </a>
      </div>

      <!-- Usuários compartilhados -->
      <div class="pt-2" v-if="(userType !== 'partner' && lead.assignedPartners?.length > 0) || (userType === 'partner' && (lead.realtorId || lead.brokerId || lead.assignedRealtors?.length > 0))">
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <div class="flex items-center -space-x-2">
            <!-- Para partners: mostrar broker e realtor -->
            <template v-if="userType === 'partner'">
              <div v-if="lead.brokerId" class="relative group">
                <div class="relative w-8 h-8">
                  <img
                    v-if="getUserPhotoUrl(lead.brokerId)"
                    :src="getUserPhotoUrl(lead.brokerId)"
                    :alt="getUserName(lead.brokerId)"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover"
                    @error="() => { console.error(`Erro ao carregar imagem do parceiro ${lead.brokerId}`); Object.assign(userPhotoCache.value, { [lead.brokerId]: '' }); }"
                    @load="() => console.log(`Imagem carregada com sucesso para parceiro: ${lead.brokerId}`)"
                  >
                  <div 
                    v-else
                    class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-200" 
                  >
                    <span class="text-xs font-bold">{{ getUserName(lead.brokerId).substring(0, 2).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                  Broker: {{ getUserName(lead.brokerId) }}
                </div>
              </div>
              <template v-if="lead.assignedRealtors && lead.assignedRealtors.length > 0">
                <div v-for="realtorId in lead.assignedRealtors" :key="realtorId" class="relative group">
                  <div class="relative w-8 h-8">
                    <img
                      v-if="getUserPhotoUrl(realtorId)"
                      :src="getUserPhotoUrl(realtorId)"
                      :alt="getUserName(realtorId)"
                      class="w-8 h-8 rounded-full border-2 border-white object-cover"
                      @error="() => { console.error(`Erro ao carregar imagem do parceiro ${realtorId}`); Object.assign(userPhotoCache.value, { [realtorId]: '' }); }"
                      @load="() => console.log(`Imagem carregada com sucesso para parceiro: ${realtorId}`)"
                    >
                    <div 
                      v-else
                      class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-200" 
                    >
                      <span class="text-xs font-bold">{{ getUserName(realtorId).substring(0, 2).toUpperCase() }}</span>
                    </div>
                  </div>
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                    Realtor: {{ getUserName(realtorId) }}
                  </div>
                </div>
              </template>
            </template>
            <!-- Para realtor/broker: mostrar partners -->
            <template v-else>
              <div v-for="partnerId in lead.assignedPartners" :key="partnerId" class="relative group">
                <div class="relative w-8 h-8">
                  <img
                    v-if="getUserPhotoUrl(partnerId)"
                    :src="getUserPhotoUrl(partnerId)"
                    :alt="getUserName(partnerId)"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover"
                    @error="() => { console.error(`Erro ao carregar imagem do parceiro ${partnerId}`); Object.assign(userPhotoCache.value, { [partnerId]: '' }); }"
                    @load="() => console.log(`Imagem carregada com sucesso para parceiro: ${partnerId}`)"
                  >
                  <div 
                    v-else
                    class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-200" 
                  >
                    <span class="text-xs font-bold">{{ getUserName(partnerId).substring(0, 2).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                  Partner: {{ getUserName(partnerId) }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Rodapé com ícones de ação -->
    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
      <!-- Data de criação -->
      <div class="text-[11px] text-gray-400">
        Criado em: {{ formatDate(lead.createdAt) }}
      </div>

      <!-- Botões -->
      <div class="flex space-x-2">
        <!-- Botão de editar -->
        <button
          @click.stop="$emit('edit', lead)"
          class="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-indigo-50"
          title="Editar lead"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <!-- Botão de arquivar -->
        <button v-if="!lead.archived"
          @click.stop="$emit('archive', lead)"
          class="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors duration-200 rounded-full hover:bg-yellow-50"
          title="Arquivar lead"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </button>

        <!-- Botão de reativar (para leads arquivados) -->
        <button v-if="lead.archived"
          @click.stop="$emit('reactivate', lead)"
          class="p-1.5 text-gray-400 hover:text-green-600 transition-colors duration-200 rounded-full hover:bg-green-50"
          title="Reativar lead"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
