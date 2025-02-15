<script setup lang="ts">
import { defineProps, defineEmits, computed, onMounted } from 'vue';
import { useLeadsStore } from '../stores/leads';
import { useUserManagementStore } from '../stores/userManagement';

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

onMounted(async () => {
  console.log('Lead recebido no card:', props.lead);
  console.log('Assigned Partners:', props.lead.assignedPartners);
  console.log('Valor do imóvel:', props.lead.propertyValue, typeof props.lead.propertyValue);
  
  // Carrega os usuários se ainda não foram carregados
  if (userManagementStore.users.length === 0) {
    await userManagementStore.fetchUsers();
  }
});

const emit = defineEmits([
  'edit',
  'delete',
  'archive',
  'openNotes',
  'reactivate',
  'view-files'
]);

const leadsStore = useLeadsStore();
const userManagementStore = useUserManagementStore();

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value) => {
  console.log('Formatando valor:', value, typeof value);
  
  // Se o valor for falsy (0, null, undefined, etc)
  if (value === null || value === undefined) {
    console.log('Valor é null ou undefined');
    return 'Valor não definido';
  }
  
  // Garante que o valor seja um número
  const numValue = Number(value);
  console.log('Valor convertido para número:', numValue, typeof numValue);
  
  if (isNaN(numValue)) {
    console.error('Valor inválido para formatação:', value);
    return 'Valor não definido';
  }

  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
    console.log('Valor formatado:', formatted);
    return formatted;
  } catch (error) {
    console.error('Erro ao formatar valor:', error);
    return 'Valor não definido';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contacted':
      return 'bg-yellow-100 text-yellow-800';
    case 'qualified':
      return 'bg-green-100 text-green-800';
    case 'lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
};

const hasNotes = computed(() => props.lead.notes && props.lead.notes.length > 0);

const getUserPhotoUrl = (userId) => {
  const user = userManagementStore.users.find(u => u.id === userId);
  return user?.photoURL || '/default-avatar.png';
};

const getUserName = (userId) => {
  const user = userManagementStore.users.find(u => u.id === userId);
  if (!user) {
    console.warn(`Usuário não encontrado para o ID: ${userId}`);
    return 'Carregando...';
  }
  return user.displayName || user.email || 'Sem nome';
};

const deleteLead = async () => {
  if (confirm('Tem certeza que deseja excluir este lead?')) {
    try {
      await leadsStore.deleteLead(props.lead.id);
      emit('delete', props.lead.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir lead');
    }
  }
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
            @click.stop="$emit('open-notes', lead)"
            class="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-indigo-50"
            :class="{ 'text-indigo-600 bg-indigo-50': hasNotes }"
            :title="hasNotes ? 'Ver observações' : 'Sem observações'"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                <img
                  :src="getUserPhotoUrl(lead.brokerId)"
                  :alt="getUserName(lead.brokerId)"
                  class="w-8 h-8 rounded-full border-2 border-white object-cover"
                >
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                  Broker: {{ getUserName(lead.brokerId) }}
                </div>
              </div>
              <template v-if="lead.assignedRealtors && lead.assignedRealtors.length > 0">
                <div v-for="realtorId in lead.assignedRealtors" :key="realtorId" class="relative group">
                  <img
                    :src="getUserPhotoUrl(realtorId)"
                    :alt="getUserName(realtorId)"
                    class="w-8 h-8 rounded-full border-2 border-white object-cover"
                  >
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                    Realtor: {{ getUserName(realtorId) }}
                  </div>
                </div>
              </template>
            </template>
            <!-- Para realtor/broker: mostrar partners -->
            <template v-else>
              <div v-for="partnerId in lead.assignedPartners" :key="partnerId" class="relative group">
                <img
                  :src="getUserPhotoUrl(partnerId)"
                  :alt="getUserName(partnerId)"
                  class="w-8 h-8 rounded-full border-2 border-white object-cover"
                >
                <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                  {{ getUserName(partnerId) }}
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
