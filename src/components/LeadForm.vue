<script setup lang="ts">
import { ref, defineEmits, defineProps, watch, computed, onMounted } from 'vue';
import { useKanbanStore } from '../stores/kanban';
import { useAuthStore } from '../stores/auth';
import { useUserManagementStore } from '../stores/userManagement';
import RealtorSelect from './RealtorSelect.vue';
import PartnerSelect from './PartnerSelect.vue';
import Modal from './Modal.vue';

// Definição de tipos
interface FamilyMember {
  name: string;
  relationship: string;
  phone: string;
  countryCode: string;
  email: string;
}

interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  status: string;
  source: string;
  priority: string;
  budget: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  notes: string;
  familyMembers: FamilyMember[];
  assignedRealtors: any[];
  assignedPartners: any[];
  archived?: boolean;
  kanbanColumn?: string;
  propertyValue?: number;
}

const props = defineProps({
  lead: {
    type: Object as () => Lead,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'cancel', 'update:partners', 'update:realtors']);
const kanbanStore = useKanbanStore();
const authStore = useAuthStore();
const userManagementStore = useUserManagementStore();
const isSubmitting = ref(false);
const isCheckingEmail = ref(false);
const emailTimeout = ref<number | null>(null);
const showDuplicateModal = ref(false);
const duplicateLead = ref<Lead | null>(null);
const activeTab = ref('basic');
const tabs = [
  { id: 'basic', name: 'Dados Básicos', icon: 'user' },
  { id: 'family', name: 'Família', icon: 'users' },
  { id: 'details', name: 'Detalhes', icon: 'clipboard' },
  { id: 'assignments', name: 'Atribuições', icon: 'user-plus' }
];
const formData = ref({
  name: props.lead?.name || '',
  email: props.lead?.email || '',
  phone: props.lead?.phone || '',
  countryCode: props.lead?.countryCode || '55',
  status: props.lead?.status || 'new',
  kanbanColumn: '',
  source: 'website',
  priority: 'medium',
  notes: '',
  familyMembers: props.lead?.familyMembers || [],
  propertyValue: 100000,
  assignedRealtors: props.lead?.assignedRealtors || [], // Garantir que seja sempre um array
  assignedPartners: props.lead?.assignedPartners || []  // Garantir que seja sempre um array
});
const showNotification = ref(false);
const notificationMessage = ref('');

// Se for um realtor criando um novo lead, atribuir automaticamente
if (!props.isEdit && authStore.userRole === 'realtor') {
  formData.value.assignedRealtors = [authStore.user.uid];
} else if (!props.isEdit && authStore.userRole === 'partner') {
  formData.value.assignedPartners = [authStore.user.uid];
}

watch(() => props.lead, async (newLead) => {
  if (newLead) {
    // Carregar usuários antes de atualizar o formData
    if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
      await userManagementStore.fetchUsers();
    }

    // Garantir que os arrays de realtors e partners sejam sempre arrays válidos
    const assignedRealtors = Array.isArray(newLead.assignedRealtors) ? [...newLead.assignedRealtors] : [];
    const assignedPartners = Array.isArray(newLead.assignedPartners) ? [...newLead.assignedPartners] : [];

    // Log para debug
    console.log('[LeadForm] Realtors atribuídos:', assignedRealtors);
    console.log('[LeadForm] Partners atribuídos:', assignedPartners);

    formData.value = {
      ...formData.value, // Manter os valores padrão para campos não definidos
      ...newLead,
      assignedRealtors,
      assignedPartners,
      familyMembers: (newLead.familyMembers || []).map(member => ({
        ...member,
        countryCode: member.countryCode || '55',
        email: member.email || ''
      }))
    };

    // Emitir eventos para atualizar os selects no componente pai
    if (authStore.userRole === 'realtor') {
      emit('update:partners', assignedPartners);
    } else if (authStore.userRole === 'broker') {
      emit('update:realtors', assignedRealtors);
      emit('update:partners', assignedPartners);
    }

    console.log('[LeadForm] Dados atualizados:', formData.value);
  }
}, { immediate: true, deep: true });

// Observar mudanças nos realtors e parceiros atribuídos
watch(() => formData.value.assignedRealtors, (newRealtors) => {
  console.log('[LeadForm] Realtors atualizados:', newRealtors);
  emit('update:realtors', newRealtors);
}, { deep: true });

watch(() => formData.value.assignedPartners, (newPartners) => {
  console.log('[LeadForm] Partners atualizados:', newPartners);
  emit('update:partners', newPartners);
}, { deep: true });

const phoneError = ref('');

const formatCurrency = (value: number) => {
  if (!value) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const isValidPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return false;
  }
  
  // Verifica se tem pelo menos 8 dígitos (menor número possível para um telefone válido)
  if (cleaned.length < 8) {
    return false;
  }
  
  // Verifica se tem no máximo 15 dígitos (padrão internacional E.164)
  if (cleaned.length > 15) {
    return false;
  }
  
  return true;
};

const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Remove qualquer caractere que não seja número
  formData.value.phone = input.value.replace(/\D/g, '');
  if (!isValidPhone(formData.value.phone)) {
    phoneError.value = 'Número de telefone inválido';
  } else {
    phoneError.value = '';
  }
};

const handleCountryCodeInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Remove qualquer caractere que não seja número
  const value = input.value.replace(/\D/g, '');
  // Limita a 3 dígitos
  formData.value.countryCode = value.slice(0, 3);
  if (!isValidPhone(formData.value.phone)) {
    phoneError.value = 'Número de telefone inválido';
  } else {
    phoneError.value = '';
  }
};

const getWhatsAppLink = (phone: string, countryCode: string) => {
  const fullNumber = `+${countryCode}${phone}`;
  return `https://wa.me/${fullNumber}`;
};

const handleSubmit = async () => {
  // Verifica se o formulário é válido
  const isValid = validateForm();
  
  if (!isValid) {
    // Mostra notificação de erro
    showNotification.value = true;
    notificationMessage.value = 'Por favor, preencha todos os campos obrigatórios.';
    
    // Esconde a notificação após 5 segundos
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);
    
    return;
  }
  
  // Verifica se o número de telefone é válido
  if (formData.value.phone && !isValidPhone(formData.value.phone)) {
    showNotification.value = true;
    notificationMessage.value = 'Por favor, insira um número de telefone válido.';
    
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);
    
    return;
  }
  
  // Se chegou aqui, o formulário é válido
  isSubmitting.value = true;
  
  try {
    // Garantir que os arrays existam e incluam o usuário atual se for realtor/partner
    const assignedRealtors = Array.isArray(formData.value.assignedRealtors) ? [...formData.value.assignedRealtors] : [];
    const assignedPartners = Array.isArray(formData.value.assignedPartners) ? [...formData.value.assignedPartners] : [];

    if (!props.isEdit) {
      if (authStore.userRole === 'realtor' && !assignedRealtors.includes(authStore.user.uid)) {
        assignedRealtors.push(authStore.user.uid);
      } else if (authStore.userRole === 'partner' && !assignedPartners.includes(authStore.user.uid)) {
        assignedPartners.push(authStore.user.uid);
      }
    }

    // Formata os dados antes de enviar
    const formattedData = {
      ...formData.value,
      assignedRealtors,
      assignedPartners,
      familyMembers: formData.value.familyMembers || []
    };

    emit('submit', formattedData);
  } catch (error) {
    console.error('Erro ao enviar formulário:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleEmailBlur = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const email = target.value;
  if (!email || props.isEdit) return;

  if (emailTimeout.value) {
    clearTimeout(emailTimeout.value);
  }

  emailTimeout.value = setTimeout(async () => {
    await checkDuplicateEmail(email);
  }, 500) as unknown as number;
};

const handleReactivateLead = () => {
  if (duplicateLead.value) {
    emit('submit', { 
      ...duplicateLead.value,
      archived: false,
      status: 'new'
    });
    showDuplicateModal.value = false;
  }
};

const handleModalClose = () => {
  showDuplicateModal.value = false;
  duplicateLead.value = null;
};

const priorities = [
  { 
    value: 'low', 
    label: 'Baixa', 
    icon: '⬇️', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  { 
    value: 'medium', 
    label: 'Média', 
    icon: '➡️', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  { 
    value: 'high', 
    label: 'Alta', 
    icon: '⬆️', 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
];

const sources = [
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'referral', label: 'Indicação', icon: '👥' },
  { value: 'social', label: 'Redes Sociais', icon: '📱' },
  { value: 'other', label: 'Outro', icon: '📌' }
];

// Se não houver coluna selecionada, usar a primeira coluna como padrão
watch(() => formData.value, () => {
  if (!formData.value.kanbanColumn && kanbanStore.sortedColumns.length > 0) {
    formData.value.kanbanColumn = kanbanStore.sortedColumns[0].id;
  }
}, { immediate: true });

// Watch para garantir que propertyValue seja sempre um número
watch(() => formData.value.propertyValue, (newValue) => {
  if (newValue) {
    // Converte para número e remove casas decimais
    formData.value.propertyValue = Math.floor(Number(newValue));
  }
});

const getPriorityStyle = (priority: string) => {
  const priorityObj = priorities.find(p => p.value === priority);
  return priorityObj ? `${priorityObj.bgColor} ${priorityObj.borderColor}` : '';
};

const addFamilyMember = () => {
  formData.value.familyMembers.push({
    name: '',
    relationship: '',
    phone: '',
    countryCode: '+55',
    email: ''
  });
};

const removeFamilyMember = (index: number) => {
  formData.value.familyMembers.splice(index, 1);
};

const formatPhoneForMember = (phone: string, countryCode: string, index: number) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  formData.value.familyMembers[index].phone = cleaned;
  return cleaned;
};

const handleFamilyMemberPhoneInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  formData.value.familyMembers[index].phone = input.value.replace(/\D/g, '');
};

const handleFamilyMemberCountryCodeInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  formData.value.familyMembers[index].countryCode = input.value.replace(/\D/g, '');
};

onMounted(async () => {
  // Carregar usuários se for realtor ou broker
  if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
    await userManagementStore.fetchUsers();
  }
});

const realtors = computed(() => userManagementStore.usersByBroker || []);
const partners = computed(() => userManagementStore.usersByRole.partner || []);

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};

// Função para verificar se o email já existe
const checkDuplicateEmail = async (email: string) => {
  if (!email) return;
  
  try {
    isCheckingEmail.value = true;
    
    // Aqui você deve implementar a chamada ao serviço que verifica duplicatas
    // Por exemplo:
    // const response = await leadService.checkDuplicateEmail(email);
    // if (response.duplicate) {
    //   duplicateLead.value = response.lead;
    //   showDuplicateModal.value = true;
    // }
    
    // Simulação para demonstração
    const isDuplicate = false; // Substitua pela lógica real
    
    if (isDuplicate) {
      showDuplicateModal.value = true;
    }
  } catch (error) {
    console.error('Erro ao verificar email duplicado:', error);
  } finally {
    isCheckingEmail.value = false;
    emailTimeout.value = null;
  }
};

const validateForm = () => {
  const form = document.getElementById('leadForm') as HTMLFormElement;
  return form.checkValidity();
};

</script>

<template>
  <form @submit.prevent="handleSubmit" id="leadForm" class="space-y-8">
    <!-- Notificação de erro -->
    <div 
      v-if="showNotification" 
      class="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50 max-w-md transition-all duration-300 transform"
      :class="{ 'translate-x-0 opacity-100': showNotification, 'translate-x-full opacity-0': !showNotification }"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm">{{ notificationMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button 
              @click="showNotification = false" 
              class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <span class="sr-only">Fechar</span>
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegação entre abas -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            type="button"
            @click="setActiveTab(tab.id)"
            :class="[
              'py-4 px-6 text-sm font-medium border-b-2 focus:outline-none transition-all duration-200 flex items-center',
              activeTab === tab.id 
                ? 'border-[#01FBA1] text-[#012928]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <!-- Ícones das abas -->
            <span v-if="tab.icon === 'user'" class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <span v-else-if="tab.icon === 'users'" class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <span v-else-if="tab.icon === 'clipboard'" class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <span v-else-if="tab.icon === 'user-plus'" class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </span>
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Conteúdo das abas -->
    <div class="space-y-8">
      <!-- Aba 1: Dados Básicos -->
      <div v-show="activeTab === 'basic'">
        <!-- Informações Básicas -->
        <div class="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 border-b pb-3">Informações do Lead Principal</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Nome e Email -->
            <div class="space-y-4">
              <!-- Nome -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  v-model="formData.name"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  :disabled="props.disabled"
                />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  v-model="formData.email"
                  required
                  @blur="handleEmailBlur"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  :disabled="props.disabled || isCheckingEmail"
                />
              </div>
            </div>

            <!-- Telefone e Valor -->
            <div class="space-y-4">
              <!-- Telefone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">
                  Telefone (WhatsApp)
                </label>
                <div class="flex gap-2 mt-1">
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">+</span>
                    <input
                      type="tel"
                      id="countryCode"
                      name="countryCode"
                      v-model="formData.countryCode"
                      required
                      placeholder="55"
                      maxlength="3"
                      @input="handleCountryCodeInput"
                      class="block w-20 pl-6 rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      :disabled="props.disabled"
                    />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    v-model="formData.phone"
                    required
                    placeholder="11999999999"
                    @input="handlePhoneInput"
                    class="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    :disabled="props.disabled"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500">Digite apenas números, sem espaços ou caracteres especiais</p>
                <p v-if="phoneError" class="mt-1 text-sm text-red-600">{{ phoneError }}</p>
              </div>

              <!-- Valor do Imóvel -->
              <div class="space-y-2">
                <label for="propertyValue" class="block text-sm font-medium text-gray-700">
                  Valor do imóvel: {{ formatCurrency(formData.propertyValue) }}
                </label>
                <input
                  id="propertyValue"
                  type="range"
                  v-model.number="formData.propertyValue"
                  :min="100000"
                  :max="10000000"
                  :step="50000"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  :disabled="props.disabled"
                />
                <div class="flex justify-between text-xs text-gray-600">
                  <span>$100k</span>
                  <span>$10M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba 2: Família -->
      <div v-show="activeTab === 'family'">
        <!-- Membros da Família -->
        <div class="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 border-b pb-3">Membros da Família</h3>
          
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-md font-medium text-gray-900">Membros da Família</h4>
              <button
                type="button"
                @click="addFamilyMember"
                class="inline-flex items-center bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1] disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="props.disabled"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Membro
              </button>
            </div>

            <div v-if="formData.familyMembers.length === 0" class="text-sm text-gray-500 text-center py-4">
              Nenhum membro da família adicionado
            </div>

            <div v-for="(member, index) in formData.familyMembers" :key="index" class="p-4 bg-gray-50 rounded-lg mb-4">
              <div class="flex justify-between items-center mb-4">
                <h5 class="text-sm font-medium text-gray-700">Membro {{ index + 1 }}</h5>
                <button
                  type="button"
                  @click="removeFamilyMember(index)"
                  class="text-gray-400 hover:text-red-600"
                  :disabled="props.disabled"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div class="space-y-4">
                <!-- Linha 1: Nome e Parentesco -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Nome do Membro -->
                  <div>
                    <label :for="'member-name-' + index" class="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <input
                      :id="'member-name-' + index"
                      type="text"
                      :name="'member-name-' + index"
                      v-model="member.name"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      :disabled="props.disabled"
                    />
                  </div>

                  <!-- Parentesco -->
                  <div>
                    <label :for="'member-relationship-' + index" class="block text-sm font-medium text-gray-700">
                      Parentesco
                    </label>
                    <input
                      :id="'member-relationship-' + index"
                      type="text"
                      :name="'member-relationship-' + index"
                      v-model="member.relationship"
                      placeholder="Ex: Cônjuge, Filho(a), Pai, Mãe"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      :disabled="props.disabled"
                    />
                  </div>
                </div>

                <!-- Linha 2: Telefone e Email -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Telefone do Membro -->
                  <div>
                    <label :for="'member-phone-' + index" class="block text-sm font-medium text-gray-700">
                      Telefone (WhatsApp)
                    </label>
                    <div class="flex gap-2 mt-1">
                      <div class="relative">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">+</span>
                        <input
                          type="tel"
                          :id="'member-countryCode-' + index"
                          :name="'member-countryCode-' + index"
                          v-model="member.countryCode"
                          placeholder="55"
                          maxlength="3"
                          @input="handleFamilyMemberCountryCodeInput($event, index)"
                          class="block w-16 pl-6 rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                          :disabled="props.disabled"
                        />
                      </div>
                      <input
                        type="tel"
                        :id="'member-phone-' + index"
                        :name="'member-phone-' + index"
                        v-model="member.phone"
                        placeholder="11999999999"
                        @input="handleFamilyMemberPhoneInput($event, index)"
                        class="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                        :disabled="props.disabled"
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Digite apenas números</p>
                  </div>

                  <!-- Email do Membro -->
                  <div>
                    <label :for="'member-email-' + index" class="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      :id="'member-email-' + index"
                      type="email"
                      :name="'member-email-' + index"
                      v-model="member.email"
                      placeholder="email@exemplo.com"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      :disabled="props.disabled"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba 3: Detalhes -->
      <div v-show="activeTab === 'details'">
        <!-- Status do Cliente -->
        <div class="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 class="text-lg font-medium text-gray-900 border-b pb-3">Status do Cliente</h3>
          
          <div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <template v-for="column in kanbanStore.sortedColumns" :key="column.id">
                <button
                  type="button"
                  @click="() => {
                    formData.status = column.id;
                    formData.kanbanColumn = column.id;
                  }"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md w-full text-center transition-colors duration-200',
                    formData.status === column.id
                      ? 'bg-[#012928] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                  :disabled="props.disabled"
                >
                  {{ column.title }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Prioridade e Fonte -->
        <div class="bg-white rounded-lg shadow p-6 space-y-6 mt-6">
          <h3 class="text-lg font-medium text-gray-900 border-b pb-3">Detalhes Adicionais</h3>
          
          <!-- Prioridade -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-3">Prioridade</label>
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="priority in priorities"
                :key="priority.value"
                @click="formData.priority = priority.value"
                :class="[
                  'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all duration-200',
                  formData.priority === priority.value 
                    ? 'border-[#01FBA1] ring-2 ring-[#01FBA1] bg-[#01FBA1]/5' 
                    : 'border-gray-300 hover:border-[#01FBA1]'
                ]"
              >
                <div class="flex w-full items-center justify-between">
                  <div class="flex items-center">
                    <span class="mr-2 text-xl">{{ priority.icon }}</span>
                    <span :class="[priority.color, 'font-medium']">{{ priority.label }}</span>
                  </div>
                  <div v-show="formData.priority === priority.value" class="text-[#01FBA1]">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fonte -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-3">Fonte</label>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="source in sources"
                :key="source.value"
                @click="formData.source = source.value"
                :class="[
                  'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all duration-200',
                  formData.source === source.value 
                    ? 'border-[#01FBA1] ring-2 ring-[#01FBA1] bg-[#01FBA1]/5' 
                    : 'border-gray-300 hover:border-[#01FBA1]'
                ]"
              >
                <div class="flex w-full items-center justify-between">
                  <div class="flex items-center">
                    <span class="mr-2 text-xl">{{ source.icon }}</span>
                    <span class="font-medium text-gray-900">{{ source.label }}</span>
                  </div>
                  <div v-show="formData.source === source.value" class="text-[#01FBA1]">
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Observações -->
          <div>
            <label class="block text-sm font-medium text-gray-900">Observações</label>
            <div class="mt-1">
              <textarea
                id="notes"
                name="notes"
                rows="3"
                :disabled="props.disabled"
                v-model="formData.notes"
                class="shadow-sm focus:ring-[#01FBA1] focus:border-[#01FBA1] block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Adicione observações importantes sobre o lead..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba 4: Atribuições -->
      <div v-show="activeTab === 'assignments'">
        <!-- Seleção de Realtor e Parceiros (apenas para Broker) -->
        <div v-if="authStore.isBroker" class="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 class="text-lg font-medium text-[#012928] border-b pb-3">Atribuição de Realtor e Parceiros</h3>
          
          <div class="space-y-6">
            <!-- Seletor de Realtor -->
            <RealtorSelect
              v-model="formData.assignedRealtors"
              label="Selecione o Realtor"
              placeholder="Buscar realtor..."
              :multiple="false"
            />

            <!-- Seletor de Parceiros -->
            <PartnerSelect
              v-model="formData.assignedPartners"
              label="Selecione os Parceiros"
              placeholder="Buscar parceiro..."
            />
          </div>
        </div>

        <!-- Atribuição de Parceiros para Realtor -->
        <div v-else-if="authStore.userRole === 'realtor'" class="bg-white rounded-lg shadow p-6 space-y-6">
          <h3 class="text-lg font-medium text-[#012928] border-b pb-3">Atribuição de Parceiros</h3>
          
          <div class="space-y-6">
            <!-- Seletor de Parceiros -->
            <PartnerSelect
              v-model="formData.assignedPartners"
              label="Selecione os Parceiros"
              placeholder="Buscar parceiro..."
            />
          </div>
        </div>
      </div>
    </div>
  </form>

  <!-- Modal de Lead Duplicado -->
  <Teleport to="body">
    <Modal
      v-if="showDuplicateModal"
      :show="showDuplicateModal"
      @close="handleModalClose"
      class="w-full max-w-lg mx-auto"
    >
      <template #title>
        <div class="flex items-center space-x-2 text-[#012928]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Lead Existente Encontrado</span>
        </div>
      </template>
      <template #content>
        <div class="space-y-6">
          <div class="bg-white border-l-4 border-[#012928] p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-[#012928]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-[#012928]">
                  Já existe um lead cadastrado com este email. Deseja reativar o lead existente?
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Informações do Lead Existente:</h4>
            <div v-if="duplicateLead" class="space-y-2 text-sm">
              <p><span class="font-medium">Nome:</span> {{ duplicateLead.name }}</p>
              <p><span class="font-medium">Email:</span> {{ duplicateLead.email }}</p>
              <p><span class="font-medium">Telefone:</span> +{{ duplicateLead.countryCode }} {{ duplicateLead.phone }}</p>
              <p><span class="font-medium">Status:</span> {{ duplicateLead.archived ? 'Arquivado' : duplicateLead.status }}</p>
              <p v-if="duplicateLead.notes"><span class="font-medium">Observações:</span> {{ duplicateLead.notes }}</p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="handleModalClose"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleReactivateLead"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#01FBA1] hover:bg-[#01FBA1]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
          >
            Reativar Lead
          </button>
        </div>
      </template>
    </Modal>
  </Teleport>
</template>
