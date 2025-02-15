<template>
  <div class="p-6">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gerenciamento de Corretores</h1>
      <button
        @click="openNewUserModal"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#012928] hover:bg-[#012928]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
      >
        Novo Corretor
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por nome ou email..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
        />
      </div>
      <div class="w-48">
        <select
          v-model="selectedStatus"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-[#012928]">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando...
      </div>
    </div>

    <!-- Lista de Corretores -->
    <div v-else>
      <div v-if="filteredRealtors.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum corretor encontrado</h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece adicionando um novo corretor à sua equipe.
        </p>
      </div>

      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-200">
          <li v-for="realtor in filteredRealtors" :key="realtor.uid" class="px-4 py-4">
            <UserListItem :user="realtor" @edit="editUser" @toggle-status="toggleUserStatus" @delete="deleteUser" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal de Usuário -->
    <Modal :show="isModalOpen" @close="closeModal">
      <template #title>
        {{ editingUser ? 'Editar Corretor' : 'Novo Corretor' }}
      </template>
      <template #content>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              v-model="userForm.displayName"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              v-model="userForm.email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
              required
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-[#012928] border border-transparent rounded-md shadow-sm hover:bg-[#012928]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
            >
              {{ editingUser ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { userService } from '../../services/userService';
import Modal from '../../components/Modal.vue';
import UserListItem from '../../components/UserListItem.vue';
import { useUserManagementStore } from '../../stores/userManagement';

const authStore = useAuthStore();
const userManagementStore = useUserManagementStore();
const loading = ref(true);
const realtors = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const isModalOpen = ref(false);
const editingUser = ref(null);
const userForm = ref({
  displayName: '',
  email: '',
});

// Computed para filtrar realtors
const filteredRealtors = computed(() => {
  return realtors.value.filter(realtor => {
    const matchesSearch = searchQuery.value === '' ||
      realtor.displayName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      realtor.email.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus = selectedStatus.value === 'all' ||
      (selectedStatus.value === 'active' && realtor.active) ||
      (selectedStatus.value === 'blocked' && !realtor.active);

    return matchesSearch && matchesStatus;
  });
});

// Carregar realtors do broker atual
const loadRealtors = async () => {
  loading.value = true;
  try {
    const currentUser = authStore.user;
    if (!currentUser) throw new Error('Usuário não autenticado');

    // Buscar realtors usando o userManagementStore
    await userManagementStore.fetchBrokerRealtors(currentUser.uid);
    realtors.value = userManagementStore.getBrokerRealtors(currentUser.uid);
  } catch (error) {
    console.error('Erro ao carregar realtors:', error);
  } finally {
    loading.value = false;
  }
};

// Métodos do modal
const openNewUserModal = () => {
  editingUser.value = null;
  userForm.value = {
    displayName: '',
    email: '',
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingUser.value = null;
};

const editUser = (user) => {
  editingUser.value = user;
  userForm.value = {
    displayName: user.displayName,
    email: user.email,
  };
  isModalOpen.value = true;
};

// Ações de usuário
const saveUser = async () => {
  try {
    const currentUser = authStore.user;
    if (!currentUser) throw new Error('Usuário não autenticado');

    if (editingUser.value) {
      // Atualizar usuário existente
      await userManagementStore.updateUser(editingUser.value, {
        displayName: userForm.value.displayName,
      });
    } else {
      // Criar novo realtor
      const userData = {
        displayName: userForm.value.displayName,
        email: userForm.value.email,
        role: 'realtor',
        brokerId: currentUser.uid,
        brokerName: currentUser.displayName,
        status: 'active'
      };

      // Criar usuário usando o userManagementStore
      await userManagementStore.createUser(userData);

      // Fechar o modal e recarregar a lista
      closeModal();
      await loadRealtors();
    }

    closeModal();
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    alert(error.message || 'Erro ao salvar usuário. Por favor, tente novamente.');
  }
};

const deleteUser = async (userId: string) => {
  if (confirm('Tem certeza que deseja excluir este corretor?')) {
    try {
      await userManagementStore.deleteUser(userId);
      await loadRealtors();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert(error.message || 'Erro ao excluir usuário. Por favor, tente novamente.');
    }
  }
};

const toggleUserStatus = async (userId: string, currentStatus: string) => {
  console.log('Alterando status do usuário:', { userId, currentStatus });
  if (!userId) {
    console.error('ID do usuário não fornecido');
    return;
  }

  try {
    if (currentStatus === 'active') {
      await userManagementStore.blockUser(userId);
    } else {
      await userManagementStore.unblockUser(userId);
    }
    // Recarregar os dados após alteração
    await loadRealtors();
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
  }
};

let refreshInterval: number | null = null;

onMounted(async () => {
  await loadRealtors();
  // Atualizar a lista a cada 30 segundos
  refreshInterval = window.setInterval(loadRealtors, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
