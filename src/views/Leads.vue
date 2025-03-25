<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useLeadsStore } from '../stores/leads';
import { useAuthStore } from '../stores/auth';
import { useKanbanStore } from '../stores/kanban';
import { useUserManagementStore } from '../stores/userManagement';
import { useRouter } from 'vue-router';
import { auth } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from '../components/Modal.vue';
import LeadForm from '../components/LeadForm.vue';
import LeadKanban from '../components/LeadKanban.vue';
import ConfirmationModal from '../components/ConfirmationModal.vue';
import FileUploader from '../components/FileUploader.vue';
import PartnerSelect from '../components/PartnerSelect.vue'; // Importar o componente PartnerSelect
import RealtorSelect from '../components/RealtorSelect.vue'; // Importar o componente RealtorSelect
import { uploadFile, deleteFile, formatFileSize } from '../services/fileService';
import { getStorage, ref as storageRef } from 'firebase/storage';
import { leadService } from '../services/leadService';

const router = useRouter();
const authStore = useAuthStore();
const leadsStore = useLeadsStore();
const kanbanStore = useKanbanStore();
const userManagementStore = useUserManagementStore();

const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedPriority = ref('all');
const selectedSource = ref('all');
const selectedRealtors = ref([]);
const selectedPartners = ref<string[]>([]);
const partnerSearchQuery = ref('');
const leadSearchQuery = ref(''); // Adicionada variável de busca
const valueRange = ref({
  min: 0,
  max: 10000000
});
const showFilters = ref(false);
const showModal = ref(false);
const isEditMode = ref(false);
const editingLead = ref(null);
const viewMode = ref('kanban');
const showNotesModal = ref(false);
const selectedLead = ref(null);
const newNote = ref('');
const isSaving = ref(false);
const saveError = ref('');
const isLoading = ref(true);
const isUploading = ref(false);
const uploadError = ref('');
const uploadProgress = ref(0);

const showDeleteConfirmation = ref(false);
const showArchiveConfirmation = ref(false);
const showReactivateConfirmation = ref(false);
const leadToDelete = ref(null);
const leadToArchive = ref(null);
const leadToReactivate = ref(null);

const statuses = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' }
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' }
];

const sources = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'other', label: 'Other' }
];

const filteredLeads = computed(() => {
  return leadsStore.leads.filter(lead => {
    const searchText = searchQuery.value.toLowerCase();
    const matchesSearch = searchText === '' || 
      lead.name.toLowerCase().includes(searchText) ||
      lead.email.toLowerCase().includes(searchText) ||
      lead.phone.includes(searchText);
    
    const matchesStatus = selectedStatus.value === 'all' || lead.status === selectedStatus.value;
    const matchesPriority = selectedPriority.value === 'all' || lead.priority === selectedPriority.value;
    const matchesSource = selectedSource.value === 'all' || lead.source === selectedSource.value;
    
    const matchesValue = !lead.propertyValue || 
      (lead.propertyValue >= valueRange.value.min && lead.propertyValue <= valueRange.value.max);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesValue;
  });
});

// Computed para filtrar leads baseado na busca
const filteredLeadsBySearch = computed(() => {
  const query = leadSearchQuery.value.toLowerCase().trim();
  if (!query) return filteredLeads.value;
  
  return filteredLeads.value.filter(lead => {
    const name = (lead.name || '').toLowerCase();
    const email = (lead.email || '').toLowerCase();
    const phone = (lead.phone || '').toLowerCase();
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });
});

const getLeadsByColumn = computed(() => {
  const grouped = {};
  kanbanStore.sortedColumns.forEach(column => {
    grouped[column.id] = filteredLeads.value
      .filter(lead => !lead.archived && lead.kanbanColumn === column.id);
  });
  return grouped;
});

const getStatusColor = (status) => {
  return statuses.find(s => s.value === status)?.color || 'bg-gray-500';
};

const getPriorityColor = (priority) => {
  return priorities.find(p => p.value === priority)?.color || 'bg-gray-500';
};

// Função para formatar a data
const formatDate = (date: Date | string | number) => {
  try {
    if (!date) return 'Data não disponível';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Data inválida';

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const openNewLeadModal = () => {
  isEditMode.value = false;
  editingLead.value = null;
  selectedPartners.value = [];
  showModal.value = true;

  // Carregar usuários se for realtor ou broker
  if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
    userManagementStore.fetchUsers();
  }
};

const openEditLeadModal = async (lead) => {
  isEditMode.value = true;

  // Garantir que os usuários sejam carregados antes de abrir o modal
  if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
    await userManagementStore.fetchUsers();
  }

  // Garantir que os arrays de realtors e partners sejam sempre arrays válidos
  const assignedRealtors = Array.isArray(lead.assignedRealtors) ? lead.assignedRealtors : [];
  const assignedPartners = Array.isArray(lead.assignedPartners) ? lead.assignedPartners : [];
  const familyMembers = Array.isArray(lead.familyMembers) ? lead.familyMembers : [];

  // Log para debug
  console.log('[openEditLeadModal] Lead original:', lead);

  // Carregar todos os dados do lead para edição
  editingLead.value = {
    id: lead.id,
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    propertyType: lead.propertyType || '',
    propertyValue: lead.propertyValue || 100000,
    countryCode: lead.countryCode || '55',
    source: lead.source || 'website',
    priority: lead.priority || 'medium',
    status: lead.status || 'new',
    notes: lead.notes || [],
    attachments: lead.attachments || [],
    familyMembers: familyMembers,
    assignedRealtors: assignedRealtors,
    assignedPartners: assignedPartners,
    brokerId: lead.brokerId || '',
    createdBy: lead.createdBy || '',
    createdAt: lead.createdAt || new Date().toISOString(),
    updatedAt: lead.updatedAt || new Date().toISOString(),
    // Outros campos específicos do lead
    propertyAddress: lead.propertyAddress || '',
    propertyCity: lead.propertyCity || '',
    propertyState: lead.propertyState || '',
    propertyZip: lead.propertyZip || '',
    propertyDescription: lead.propertyDescription || '',
    observations: lead.observations || ''
  };

  console.log('[openEditLeadModal] Lead preparado para edição:', editingLead.value);

  selectedPartners.value = assignedPartners;
  showModal.value = true;
};

const openNotesModal = async (lead) => {
  try {
    // Buscar os dados mais recentes do lead no Firestore
    const refreshedLead = await leadService.getLead(lead.id);
    console.log('Lead carregado para o modal de observações:', refreshedLead);
    console.log('Anexos do lead:', refreshedLead.attachments);
    
    // Atualizar o lead selecionado com os dados mais recentes
    selectedLead.value = refreshedLead;
    
    // Abrir o modal
    showNotesModal.value = true;
    newNote.value = '';
  } catch (error) {
    console.error('Erro ao abrir modal de observações:', error);
    alert('Erro ao carregar dados do lead. Por favor, tente novamente.');
  }
};

const addNote = async () => {
  if (!newNote.value.trim()) return;

  const note = {
    text: newNote.value.trim(),
    timestamp: new Date().toISOString(),
    author: authStore.user?.displayName || 'Usuário'
  };

  if (!selectedLead.value?.notes) {
    selectedLead.value.notes = [];
  }

  selectedLead.value.notes.unshift(note);

  try {
    await leadsStore.updateLead(selectedLead.value.id, selectedLead.value);
    newNote.value = '';
  } catch (error) {
    console.error('Erro ao adicionar nota:', error);
  }
};

const handleLeadSubmit = async (leadData: any) => {
  try {
    isSaving.value = true;
    
    // Se estiver editando, mantém todos os dados originais
    if (isEditMode.value) {
      const leadToSave = {
        ...editingLead.value, // Mantém todos os dados originais
        ...leadData, // Sobrescreve com os novos dados
        updatedAt: new Date().toISOString()
      };

      // Garante que os arrays sejam sempre arrays válidos
      leadToSave.assignedRealtors = Array.isArray(leadToSave.assignedRealtors) ? leadToSave.assignedRealtors : [];
      leadToSave.assignedPartners = Array.isArray(leadToSave.assignedPartners) ? leadToSave.assignedPartners : [];
      leadToSave.familyMembers = Array.isArray(leadToSave.familyMembers) ? leadToSave.familyMembers : [];
      leadToSave.notes = Array.isArray(leadToSave.notes) ? leadToSave.notes : [];
      leadToSave.attachments = Array.isArray(leadToSave.attachments) ? leadToSave.attachments : [];

      console.log('[handleLeadSubmit] Atualizando lead:', editingLead.value.id, leadToSave);
      await leadService.updateLead(editingLead.value.id, leadToSave);
    } else {
      // Se for um novo lead
      const finalData = {
        ...leadData,
        assignedPartners: selectedPartners.value,
        assignedRealtors: selectedRealtors.value, // Adicionar explicitamente os realtors selecionados
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        attachments: [],
        status: 'new',
        priority: 'medium'
      };

      // Se for realtor, busca o broker vinculado a ele
      if (authStore.userRole === 'realtor') {
        const userDoc = await getDoc(doc(db, 'users', authStore.user?.uid || ''));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          finalData.brokerId = userData.brokerId || '';
        }
      } else if (authStore.userRole === 'broker') {
        finalData.brokerId = authStore.user?.uid || '';
      }

      finalData.createdBy = authStore.user?.uid || '';

      // Se for broker, usa os corretores selecionados
      if (authStore.userRole === 'broker' && finalData.assignedRealtors?.length > 0) {
        finalData.createdBy = finalData.assignedRealtors[0];
      }

      console.log('[handleLeadSubmit] Criando novo lead:', finalData);
      await leadService.addLead(finalData);
    }
    
    // Fecha o modal e atualiza a lista
    showModal.value = false;
    await leadsStore.fetchLeads();
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
  } finally {
    isSaving.value = false;
  }
};

const handleDeleteClick = (lead) => {
  leadToDelete.value = lead;
  showDeleteConfirmation.value = true;
};

const handleArchiveClick = (lead) => {
  leadToArchive.value = lead;
  showArchiveConfirmation.value = true;
};

const handleReactivateClick = (lead) => {
  leadToReactivate.value = lead;
  showReactivateConfirmation.value = true;
};

const confirmDelete = async () => {
  if (leadToDelete.value) {
    await leadsStore.deleteLead(leadToDelete.value.id);
    showDeleteConfirmation.value = false;
    leadToDelete.value = null;
  }
};

const confirmArchive = async () => {
  if (leadToArchive.value) {
    await leadsStore.updateLead(leadToArchive.value.id, {
      ...leadToArchive.value,
      archived: true
    });
    showArchiveConfirmation.value = false;
    leadToArchive.value = null;
  }
};

const confirmReactivate = async () => {
  if (leadToReactivate.value) {
    try {
      await leadService.unarchiveLead(leadToReactivate.value.id);
      await leadsStore.fetchLeads();
      showReactivateConfirmation.value = false;
      leadToReactivate.value = null;
    } catch (error) {
      console.error('Erro ao reativar lead:', error);
    }
  }
};

const handleDeleteLead = (id) => {
  if (confirm('Tem certeza que deseja excluir este lead?')) {
    leadsStore.deleteLead(id);
  }
};

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'kanban' ? 'table' : 'kanban';
};

const resetFilters = () => {
  selectedStatus.value = 'all';
  selectedPriority.value = 'all';
  selectedSource.value = 'all';
  selectedRealtors.value = [];
  selectedPartners.value = [];
  valueRange.value = {
    min: 0,
    max: 10000000
  };
  leadSearchQuery.value = ''; // Limpar busca
};

const handleFileSelected = async (file: File) => {
  if (!selectedLead.value) return;
  
  isUploading.value = true;
  uploadError.value = '';
  
  try {
    const attachment = await uploadFile(
      file,
      `leads/${selectedLead.value.id}/attachments`,
      (progress) => {
        uploadProgress.value = progress;
      }
    );

    // Atualizar o lead com o novo anexo
    const currentAttachments = selectedLead.value.attachments || [];
    const updatedLead = await leadsStore.updateLead(selectedLead.value.id, {
      attachments: [...currentAttachments, attachment]
    });

    // Buscar os dados atualizados do lead para garantir sincronização
    try {
      const refreshedLead = await leadService.getLead(selectedLead.value.id);
      selectedLead.value = refreshedLead;
    } catch (refreshError) {
      console.error('Erro ao atualizar dados do lead após upload de arquivo:', refreshError);
      // Fallback para os dados retornados pelo updateLead
      selectedLead.value = updatedLead;
    }
    
    // Atualizar a lista de leads no store
    const leadIndex = leadsStore.leads.findIndex(l => l.id === updatedLead.id);
    if (leadIndex !== -1) {
      leadsStore.leads[leadIndex] = selectedLead.value;
    }
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    uploadError.value = 'Erro ao fazer upload do arquivo. Tente novamente.';
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const handleFileDelete = async (attachment) => {
  if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
  
  try {
    await deleteFile(attachment.path);
    // Criar uma cópia do lead atual
    const updatedLead = { ...selectedLead.value };
    updatedLead.attachments = updatedLead.attachments?.filter(a => a.id !== attachment.id);
    
    // Atualizar no Firestore
    await leadsStore.updateLead(updatedLead.id!, {
      attachments: updatedLead.attachments
    });
    
    // Buscar os dados atualizados do lead para garantir sincronização
    try {
      const refreshedLead = await leadService.getLead(updatedLead.id!);
      selectedLead.value = refreshedLead;
    } catch (refreshError) {
      console.error('Erro ao atualizar dados do lead após exclusão de arquivo:', refreshError);
    }
    
    // Atualizar a lista de leads no store
    const leadIndex = leadsStore.leads.findIndex(l => l.id === updatedLead.id);
    if (leadIndex !== -1) {
      leadsStore.leads[leadIndex] = selectedLead.value;
    }
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    alert('Erro ao excluir arquivo. Tente novamente.');
  }
};

// Variáveis para edição de observação
const editingObservation = ref<string | null>(null);
const editedObservationText = ref('');

// Funções para gerenciar observações
const startEditingObservation = (observationId: string, text: string) => {
  editingObservation.value = observationId;
  editedObservationText.value = text;
};

const cancelEditingObservation = () => {
  editingObservation.value = null;
  editedObservationText.value = '';
};

const saveObservation = async (observationId: string) => {
  try {
    if (!selectedLead.value?.id) return;
    
    // Fazer uma cópia do array atual de notas
    const currentNotes = [...(selectedLead.value.notes || [])];
    
    // Encontrar o índice da nota a ser editada
    const noteIndex = currentNotes.findIndex(note => note.id === observationId);
    
    if (noteIndex === -1) {
      console.error('Observação não encontrada');
      return;
    }
    
    // Atualizar apenas os campos necessários mantendo o resto
    currentNotes[noteIndex] = {
      ...currentNotes[noteIndex],
      text: editedObservationText.value,
      timestamp: new Date().toISOString()
    };
    
    // Atualizar no Firestore
    await leadsStore.updateLead(selectedLead.value.id, {
      notes: currentNotes
    });
    
    // Atualizar localmente
    selectedLead.value.notes = currentNotes;
    
    // Limpar estado de edição
    cancelEditingObservation();
  } catch (error) {
    console.error('Erro ao salvar observação:', error);
  }
};

const deleteObservation = async (observationId: string) => {
  try {
    if (!selectedLead.value?.id) return;
    
    if (!confirm('Tem certeza que deseja excluir esta observação?')) return;
    
    // Fazer uma cópia do array atual de notas
    const currentNotes = [...(selectedLead.value.notes || [])];
    
    // Encontrar o índice da nota a ser excluída
    const noteIndex = currentNotes.findIndex(note => note.id === observationId);
    
    if (noteIndex === -1) {
      console.error('Observação não encontrada');
      return;
    }
    
    // Remover apenas a nota específica usando splice
    currentNotes.splice(noteIndex, 1);
    
    // Atualizar no Firestore
    await leadsStore.updateLead(selectedLead.value.id, {
      notes: currentNotes
    });
    
    // Atualizar localmente
    selectedLead.value.notes = currentNotes;
  } catch (error) {
    console.error('Erro ao excluir observação:', error);
  }
};

// Inicializar realtors e partners selecionados com base no usuário atual
const initializeSelectedUsers = () => {
  console.log('[Leads] Inicializando usuários selecionados...');
  
  if (authStore.userRole === 'realtor') {
    // Se for um realtor, seleciona a si mesmo
    selectedRealtors.value = [authStore.user?.uid || ''];
    console.log('[Leads] Realtor selecionado:', selectedRealtors.value);
  } else if (authStore.userRole === 'partner') {
    // Se for um parceiro, seleciona a si mesmo
    selectedPartners.value = [authStore.user?.uid || ''];
    console.log('[Leads] Partner selecionado:', selectedPartners.value);
  }
};

// Carregar leads quando o usuário estiver autenticado
onMounted(async () => {
  isLoading.value = true;
  try {
    // Inicializar usuários selecionados
    initializeSelectedUsers();
    
    // Carregar usuários
    if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
      await userManagementStore.fetchUsers();
    }

    // Carregar leads
    await leadsStore.fetchLeads();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    isLoading.value = false;
  }
});

// Watch para carregar usuários quando necessário
watch(() => showModal.value, async (newValue) => {
  if (newValue && (authStore.userRole === 'realtor' || authStore.userRole === 'broker')) {
    await userManagementStore.fetchUsers();
  }
});

// Observar mudanças na rota
watch(() => router.currentRoute.value.path, () => {
  showNotesModal.value = false;
  selectedLead.value = null;
  newNote.value = '';
  editingObservation.value = null;
  editedObservationText.value = '';
});

// Verificar autenticação ao montar o componente e quando o estado de autenticação mudar
watch(() => authStore.user, async (user) => {
  if (!user) {
    router.push('/login');
    return;
  }

  try {
    // Inicializar usuários selecionados
    initializeSelectedUsers();
    
    // Carregar usuários
    if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
      await userManagementStore.fetchUsers();
    }

    // Carregar leads
    await leadsStore.fetchLeads();
  } catch (error) {
    console.error('Error loading leads:', error);
  }
}, { immediate: true });

// Watch para atualizar selectedPartners quando editingLead mudar
watch(editingLead, (newLead) => {
  if (newLead && newLead.assignedPartners) {
    selectedPartners.value = [...newLead.assignedPartners];
  } else {
    selectedPartners.value = [];
  }
});

// Computed properties para filtrar usuários por papel
const availableRealtors = computed(() => {
  return userManagementStore.users.filter(user => 
    user.role === 'realtor' && 
    user.status === 'active' && 
    user.brokerId === authStore.user?.uid
  );
});

const availablePartners = computed(() => {
  return userManagementStore.users.filter(user => 
    user.role === 'partner' && 
    user.status === 'active'
  );
});

// Computed para filtrar parceiros baseado na busca
const filteredPartners = computed(() => {
  const query = partnerSearchQuery.value.toLowerCase().trim();
  if (!query) return availablePartners.value;
  
  return availablePartners.value.filter(partner => {
    const name = (partner.displayName || '').toLowerCase();
    const email = (partner.email || '').toLowerCase();
    return name.includes(query) || email.includes(query);
  });
});

// Função para alternar parceiros
const togglePartner = (partnerId: string) => {
  if (selectedPartners.value.includes(partnerId)) {
    selectedPartners.value = selectedPartners.value.filter(id => id !== partnerId);
  } else {
    selectedPartners.value.push(partnerId);
  }
};

// Funções para obter nomes de usuários
const getBrokerFromRealtor = (realtorId: string) => {
  const realtor = userManagementStore.users.find(user => user.id === realtorId);
  if (!realtor?.brokerId) {
    console.warn('Broker não encontrado para o realtor:', realtorId);
    return null;
  }
  return getBrokerName(realtor.brokerId);
};

const getBrokerName = (brokerId: string) => {
  const broker = userManagementStore.users.find(user => user.id === brokerId);
  if (!broker) {
    console.warn('Broker não encontrado:', brokerId);
  }
  return broker?.displayName || broker?.email || 'Broker não encontrado';
};

const getRealtorName = (realtorId: string) => {
  const realtor = userManagementStore.users.find(user => user.id === realtorId);
  return realtor?.displayName || realtor?.email || 'Corretor não encontrado';
};

const getPartnerName = (partnerId: string) => {
  const partner = userManagementStore.users.find(user => user.id === partnerId);
  return partner?.displayName || partner?.email || 'Parceiro não encontrado';
};

const newLead = ref({
  name: '',
  email: '',
  phone: '',
  source: '',
  status: 'new',
  priority: 'medium',
  assignedRealtors: [] as string[],
  assignedPartners: [] as string[],
  notes: [] as any[],
  attachments: [] as any[],
  brokerId: authStore.user?.uid || '',
  createdBy: authStore.user?.uid || '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const userType = computed(() => authStore.currentUser?.role || '');

const showFilesModal = ref(false);
const selectedLeadFiles = ref(null);

const openFilesModal = (lead) => {
  selectedLeadFiles.value = lead;
  showFilesModal.value = true;
};
</script>

<template>
  <div class="min-h-full bg-white py-8">
    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Leads</h2>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <!-- Campo de busca -->
            <div class="w-64 mr-3">
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="searchQuery"
                  class="focus:ring-[#012928] focus:border-[#012928] block w-full pl-8 pr-3 py-1.5 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Buscar leads..."
                >
              </div>
            </div>

            <button
              type="button"
              @click="toggleViewMode"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#012928] bg-white hover:border-[#01FBA1] focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
            >
              <svg 
                v-if="viewMode === 'table'"
                class="-ml-1 mr-2 h-5 w-5 text-gray-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <svg 
                v-else
                class="-ml-1 mr-2 h-5 w-5 text-gray-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ viewMode === 'kanban' ? 'Table View' : 'Kanban View' }}
            </button>

            <button
              @click="showFilters = !showFilters"
              class="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#012928] focus:ring-offset-2"
            >
              <svg class="h-5 w-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
              <span v-if="selectedStatus !== 'all' || selectedPriority !== 'all' || selectedSource !== 'all' || selectedRealtors.length > 0 || selectedPartners.length > 0 || valueRange.min > 0 || valueRange.max < 10000000" 
                class="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#012928] text-white"
              >
                Ativos
              </span>
            </button>

            <button
              type="button"
              @click="openNewLeadModal"
              class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#012928] hover:bg-[#023a39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Novo Lead
            </button>
          </div>
        </div>

        <!-- Painel de filtros -->
        <div v-if="showFilters" class="mt-4 p-4 bg-white border rounded-lg shadow-sm space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="selectedStatus"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#012928] focus:border-[#012928] sm:text-sm rounded-md"
              >
                <option value="all">Todos</option>
                <option v-for="status in statuses" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>

            <!-- Prioridade -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Prioridade</label>
              <select
                v-model="selectedPriority"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#012928] focus:border-[#012928] sm:text-sm rounded-md"
              >
                <option value="all">Todas</option>
                <option v-for="priority in priorities" :key="priority.value" :value="priority.value">
                  {{ priority.label }}
                </option>
              </select>
            </div>

            <!-- Fonte -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Fonte</label>
              <select
                v-model="selectedSource"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#012928] focus:border-[#012928] sm:text-sm rounded-md"
              >
                <option value="all">Todas</option>
                <option v-for="source in sources" :key="source.value" :value="source.value">
                  {{ source.label }}
                </option>
              </select>
            </div>

            <!-- Corretor -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Corretor</label>
              <select
                v-model="selectedRealtors"
                multiple
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#012928] focus:border-[#012928] sm:text-sm rounded-md"
              >
                <option value="all">Todos</option>
                <option v-for="realtor in availableRealtors" :key="realtor.id" :value="realtor.id">
                  {{ realtor.displayName }}
                </option>
              </select>
            </div>

            <!-- Parceiro -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Parceiro</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="partnerSearchQuery"
                  class="focus:ring-[#012928] focus:border-[#012928] block w-full pl-8 pr-3 py-1.5 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Buscar parceiros..."
                >
              </div>
              <select
                v-model="selectedPartners"
                multiple
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#012928] focus:border-[#012928] sm:text-sm rounded-md"
              >
                <option value="all">Todos</option>
                <option v-for="partner in filteredPartners" :key="partner.id" :value="partner.id">
                  {{ partner.displayName || partner.email }}
                </option>
              </select>
            </div>

            <!-- Busca de Leads -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Buscar Leads</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  v-model="leadSearchQuery"
                  class="focus:ring-[#012928] focus:border-[#012928] block w-full pl-8 pr-3 py-1.5 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Buscar leads..."
                >
              </div>
            </div>

            <!-- Faixa de Valor -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Faixa de valor do imóvel
              </label>
              <div class="px-2">
                <div class="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{{ formatCurrency(valueRange.min) }}</span>
                  <span>{{ formatCurrency(valueRange.max) }}</span>
                </div>
                <div class="space-y-4">
                  <input
                    type="range"
                    v-model.number="valueRange.min"
                    :min="0"
                    :max="10000000"
                    :step="50000"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#012928]"
                  >
                  <input
                    type="range"
                    v-model.number="valueRange.max"
                    :min="0"
                    :max="10000000"
                    :step="50000"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#012928]"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Botões de ação -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              @click="resetFilters"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-if="viewMode === 'table'" class="bg-white border border-gray-200 shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="lead in filteredLeadsBySearch" :key="lead.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ lead.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ lead.email }}</div>
                  <div class="text-sm text-gray-500">{{ lead.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                    :class="getStatusColor(lead.status)"
                  >
                    {{ lead.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                    :class="getPriorityColor(lead.priority)"
                  >
                    {{ lead.priority }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ lead.source }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(new Date(lead.createdAt)) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    @click="openNotesModal(lead)"
                    class="text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] rounded-md p-1"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10m-10 4h10M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                  </button>
                  <button
                    @click="openEditLeadModal(lead)"
                    class="text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] rounded-md p-1"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <!-- Botão de Reativar (apenas para leads arquivados) -->
                  <button
                    v-if="lead.archived"
                    @click="handleReactivateClick(lead)"
                    class="text-green-600 hover:text-green-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                    title="Reativar Lead"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </button>
                  <!-- Botão de Arquivar (apenas para leads não arquivados) -->
                  <button
                    v-if="!lead.archived"
                    @click="handleArchiveClick(lead)"
                    class="text-amber-600 hover:text-amber-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] rounded-md p-1"
                    title="Arquivar Lead"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteClick(lead)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] rounded-md p-1"
                  >
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Kanban Board -->
      <div v-else class="flex-1">
        <div v-if="filteredLeadsBySearch.length === 0" class="text-center py-10">
          <p class="text-gray-500">Nenhum lead encontrado com os filtros selecionados</p>
        </div>
        <div v-else>
          <LeadKanban
            :leads-by-column="getLeadsByColumn"
            :userType="authStore.userRole"
            @edit-lead="openEditLeadModal"
            @delete-lead="handleDeleteClick"
            @archive-lead="handleArchiveClick"
            @reactivate-lead="handleReactivateClick"
            @openNotes="openNotesModal"
            @view-files="openFilesModal"
          />
        </div>
      </div>

      <!-- Lead Modal -->
      <Modal
        v-if="showModal"
        :show="showModal"
        @close="showModal = false"
        :title="isEditMode ? 'Editar Lead' : 'Novo Lead'"
      >
        <template #content>
          <div class="space-y-6">
            <LeadForm
              :lead="isEditMode ? editingLead : {}"
              :is-edit="isEditMode"
              @submit="handleLeadSubmit"
              @cancel="showModal = false"
              @update:partners="selectedPartners = $event"
              @update:realtors="selectedRealtors = $event"
            />
          </div>
        </template>
        
        <template #footer>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-[#012928] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#01FBA1]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="leadForm"
              :disabled="isSaving"
              class="px-4 py-2 text-sm font-medium text-white bg-[#012928] rounded-lg hover:bg-[#01FBA1] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSaving" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
              <span v-else>{{ isEditMode ? 'Salvar Alterações' : 'Criar Lead' }}</span>
            </button>
          </div>
        </template>
      </Modal>

      <!-- Notes Modal -->
      <Modal :show="showNotesModal" @close="showNotesModal = false">
        <template #title>
          <div class="flex items-center space-x-2 text-[#012928]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-base sm:text-lg">Observações do Lead</span>
          </div>
        </template>
        <template #content>
          <div class="w-full space-y-4">
            <!-- Informações do Lead -->
            <div class="bg-gray-50 p-4 rounded-lg space-y-3">
              <!-- Nome e Data de Ativação -->
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-500">Lead:</span>
                  <span class="text-sm font-semibold text-gray-900">{{ selectedLead?.name }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-500">Ativo desde:</span>
                  <span class="text-sm text-gray-900">{{ formatDateTime(selectedLead?.createdAt) }}</span>
                </div>
              </div>
              
              <!-- Informações específicas baseadas no papel do usuário -->
              <!-- Para Parceiros -->
              <template v-if="authStore.userRole === 'partner'">
                <div class="space-y-1">
                  <span class="text-sm font-medium text-gray-500">Broker:</span>
                  <div class="pl-2">
                    <span class="text-sm text-gray-900">
                      {{ selectedLead?.createdBy ? getBrokerFromRealtor(selectedLead.createdBy) : 'Broker não atribuído' }}
                    </span>
                  </div>
                </div>
                <div class="space-y-1">
                  <span class="text-sm font-medium text-gray-500">Corretores:</span>
                  <div class="pl-2">
                    <div v-if="!selectedLead?.assignedRealtors?.length" class="text-sm text-gray-500 italic">
                      Lead ainda não atribuído a nenhum corretor
                    </div>
                    <div v-else v-for="realtorId in selectedLead.assignedRealtors" :key="realtorId" class="text-sm text-gray-900">
                      {{ getRealtorName(realtorId) }}
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- Para Corretores -->
              <template v-else-if="authStore.userRole === 'realtor'">
                <div class="space-y-1">
                  <span class="text-sm font-medium text-gray-500">Compartilhado com:</span>
                  <div class="pl-2">
                    <div v-if="!selectedLead?.assignedPartners?.length" class="text-sm text-gray-500 italic">
                      Lead ainda não compartilhado com nenhum parceiro
                    </div>
                    <div v-else v-for="partnerId in selectedLead.assignedPartners" :key="partnerId" class="text-sm text-gray-900">
                      {{ getPartnerName(partnerId) }}
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- Para Brokers -->
              <template v-else-if="authStore.userRole === 'broker'">
                <div class="space-y-1">
                  <span class="text-sm font-medium text-gray-500">Corretores:</span>
                  <div class="pl-2">
                    <div v-if="!selectedLead?.assignedRealtors?.length" class="text-sm text-gray-500 italic">
                      Lead ainda não atribuído a nenhum corretor
                    </div>
                    <div v-else v-for="realtorId in selectedLead.assignedRealtors" :key="realtorId" class="text-sm text-gray-900">
                      {{ getRealtorName(realtorId) }}
                    </div>
                  </div>
                </div>
                <div class="space-y-1">
                  <span class="text-sm font-medium text-gray-500">Parceiros com Acesso:</span>
                  <div class="pl-2">
                    <div v-if="!selectedLead?.assignedPartners?.length" class="text-sm text-gray-500 italic">
                      Lead ainda não compartilhado com nenhum parceiro
                    </div>
                    <div v-else v-for="partnerId in selectedLead.assignedPartners" :key="partnerId" class="text-sm text-gray-900">
                      {{ getPartnerName(partnerId) }}
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Add Note Form -->
            <div class="space-y-4">
              <textarea
                v-model="newNote"
                placeholder="Digite sua observação..."
                rows="4"
                class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-[#01FBA1] focus:border-[#01FBA1] resize-none"
              ></textarea>
              <button
                @click="addNote"
                :disabled="!newNote.trim()"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-[#012928] rounded-lg hover:bg-[#01FBA1] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar Observação
              </button>
            </div>

            <!-- Notes List -->
            <div class="space-y-4 max-h-[400px] overflow-y-auto scrollbar">
              <div v-for="note in selectedLead?.notes" :key="note.id" class="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <div v-if="editingObservation !== note.id" class="flex justify-between items-start">
                  <div>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ note.text }}</p>
                    <div class="mt-1 flex items-center text-xs text-gray-500">
                      <span>{{ formatDate(new Date(note.timestamp)) }}</span>
                      <span class="mx-1">•</span>
                      <span>{{ note.author }}</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-1 ml-3">
                    <!-- Botão de editar -->
                    <button
                      @click="startEditingObservation(note.id, note.text)"
                      class="text-gray-400 hover:text-gray-500 p-1 rounded hover:bg-gray-100"
                      title="Editar observação"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <!-- Botão de excluir -->
                    <button
                      @click="deleteObservation(note.id)"
                      class="text-red-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                      title="Excluir observação"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-else class="space-y-2">
                  <textarea
                    v-model="editedObservationText"
                    rows="3"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
                    placeholder="Digite sua observação..."
                  ></textarea>
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="cancelEditingObservation"
                      class="inline-flex items-center rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 sm:px-4 text-sm font-medium text-[#012928] shadow-sm hover:border-[#01FBA1] focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      @click="saveObservation(note.id)"
                      class="inline-flex items-center rounded-md border border-transparent text-sm font-medium text-white bg-[#012928] shadow-sm hover:bg-[#012928]/90 focus:outline-none focus:ring-2 focus:ring-[#012928] focus:ring-offset-2"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="!selectedLead?.notes?.length" class="text-gray-500 text-center py-4">
                Nenhuma observação ainda.
              </div>
            </div>

            <!-- Anexos -->
            <div class="space-y-3 sm:space-y-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Adicionar Arquivo
                </label>
                <div class="-mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-gray-50">
                  <FileUploader
                    @file-selected="handleFileSelected"
                    :maxSize="10 * 1024 * 1024"
                  />
                </div>
                <div v-if="isUploading" class="mt-2">
                  <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Fazendo upload...</span>
                    <span>{{ uploadProgress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      class="bg-[#012928] h-1.5 rounded-full transition-all duration-300"
                      :style="{ width: uploadProgress + '%' }"
                    ></div>
                  </div>
                </div>
                <p v-if="uploadError" class="mt-2 text-sm text-red-600">
                  {{ uploadError }}
                </p>
              </div>

              <div v-if="selectedLead?.attachments && selectedLead.attachments.length > 0" class="mt-3">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="text-xs font-medium text-gray-700">
                    Arquivos Anexados
                  </h3>
                  <span class="text-xs text-gray-500">
                    {{ selectedLead.attachments.length }} {{ selectedLead.attachments.length === 1 ? 'arquivo' : 'arquivos' }}
                  </span>
                </div>
                <ul class="border border-gray-100 divide-y divide-gray-100 rounded-md overflow-hidden">
                  <li 
                    v-for="attachment in selectedLead.attachments" 
                    :key="attachment.id" 
                    class="py-1.5 px-2 flex items-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div class="flex items-center space-x-3">
                      <!-- Ícone baseado no tipo de arquivo -->
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0112.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ attachment.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <!-- Botão de download -->
                      <a
                        :href="attachment.url"
                        target="_blank"
                        class="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-indigo-50"
                        title="Visualizar arquivo"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </a>
                      <!-- Botão de excluir -->
                      <button
                        @click="handleFileDelete(attachment)"
                        class="p-1.5 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-full hover:bg-red-50"
                        title="Excluir arquivo"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <button
              type="button"
              @click="showNotesModal = false"
              class="inline-flex items-center rounded-md border border-gray-300 bg-white py-1.5 sm:py-2 px-3 sm:px-4 text-sm font-medium text-[#012928] shadow-sm hover:border-[#01FBA1] focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
            >
              <svg class="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="text-sm sm:text-base">Fechar</span>
            </button>
          </div>
        </template>
      </Modal>

      <!-- Modal de Arquivos -->
      <Modal :show="showFilesModal" @close="showFilesModal = false">
        <template #title>
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span>Arquivos do Lead</span>
          </div>
        </template>
        <template #content>
          <div v-if="selectedLeadFiles" class="space-y-4">
            <div v-for="attachment in selectedLeadFiles.attachments" :key="attachment.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <!-- Ícone baseado no tipo de arquivo -->
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0112.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ attachment.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <!-- Botão de download -->
                <a
                  :href="attachment.url"
                  target="_blank"
                  class="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-indigo-50"
                  title="Baixar arquivo"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </a>
                <!-- Botão de excluir -->
                <button
                  @click="handleFileDelete(attachment)"
                  class="p-1.5 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-full hover:bg-red-50"
                  title="Excluir arquivo"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </Modal>

      <ConfirmationModal
        :show="showDeleteConfirmation"
        title="Excluir Lead"
        message="Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita e todos os dados associados serão permanentemente removidos do sistema."
        confirm-text="Excluir Lead"
        cancel-text="Cancelar"
        type="danger"
        @confirm="confirmDelete"
        @cancel="showDeleteConfirmation = false"
      />

      <ConfirmationModal
        :show="showArchiveConfirmation"
        title="Arquivar Lead"
        message="Tem certeza que deseja arquivar este lead? Leads arquivados não aparecerão na lista principal, mas todos os seus dados serão preservados e você poderá reativá-lo a qualquer momento."
        confirm-text="Arquivar Lead"
        cancel-text="Cancelar"
        type="warning"
        @confirm="confirmArchive"
        @cancel="showArchiveConfirmation = false"
      />

      <ConfirmationModal
        :show="showReactivateConfirmation"
        title="Reativar Lead"
        message="Tem certeza que deseja reativar este lead? Ele voltará a aparecer na lista principal e todas as suas informações serão restauradas ao estado anterior ao arquivamento."
        confirm-text="Reativar Lead"
        cancel-text="Cancelar"
        type="success"
        @confirm="confirmReactivate"
        @cancel="showReactivateConfirmation = false"
      />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.prose {
  max-width: 65ch;
  color: #374151;
}

.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}
</style>