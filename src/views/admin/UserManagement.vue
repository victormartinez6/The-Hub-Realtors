<template>
  <div class="p-6">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gerenciamento de Usuários</h1>
      <button
        @click="openNewUserModal"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Novo Usuário
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por nome ou email..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div class="w-48">
        <select
          v-model="selectedRole"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="all">Todos os papéis</option>
          <option value="super_admin">Super Admin</option>
          <option value="broker">Broker</option>
          <option value="realtor">Realtor</option>
          <option value="partner">Partner</option>
        </select>
      </div>
      <div class="w-48">
        <select
          v-model="selectedStatus"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando...
      </div>
    </div>

    <!-- Lista de Usuários -->
    <div v-else class="space-y-6">
      <!-- Super Admins -->
      <div v-if="superAdmins.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Super Admins</h3>
        </div>
        <ul class="divide-y divide-gray-200">
          <li v-for="user in superAdmins" :key="user.id" class="relative">
            <div class="px-4">
              <UserListItem :user="user" @edit="editUser" @toggle-status="toggleUserStatus" @delete="deleteUser" />
            </div>
            <div class="absolute bottom-0 left-4 right-4 h-px bg-gray-200"></div>
          </li>
        </ul>
      </div>

      <!-- Brokers e seus Realtors -->
      <div v-if="brokers.length > 0" class="space-y-4">
        <div v-for="broker in brokers" :key="broker.id" class="bg-white shadow rounded-lg overflow-hidden">
          <!-- Cabeçalho do Broker -->
          <div 
            class="px-4 py-5 sm:px-6 bg-gray-50 cursor-pointer"
            @click="toggleBroker(broker.id)"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  {{ broker.displayName }}
                  <span class="ml-2 text-sm text-gray-500">({{ getBrokerRealtors(broker.id).length }} corretores)</span>
                </h3>
                <p class="mt-1 text-sm text-gray-500">{{ broker.email }}</p>
              </div>
              <button class="text-gray-400 hover:text-gray-600">
                <svg 
                  class="h-6 w-6 transform transition-transform duration-200"
                  :class="{ 'rotate-180': expandedBrokers.includes(broker.id) }"
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Lista de Realtors do Broker -->
          <div v-show="expandedBrokers.includes(broker.id)">
            <div class="border-t border-gray-200">
              <UserListItem :user="broker" @edit="editUser" @toggle-status="toggleUserStatus" @delete="deleteUser" />
            </div>
            <div v-if="getBrokerRealtors(broker.id).length > 0">
              <div class="px-4 py-3 bg-gray-50 border-t border-b border-gray-200">
                <h4 class="text-sm font-medium text-gray-700">Corretores</h4>
              </div>
              <ul class="divide-y divide-gray-200">
                <li v-for="realtor in getBrokerRealtors(broker.id)" :key="realtor.id" class="relative">
                  <div class="px-4">
                    <UserListItem 
                      :user="realtor" 
                      @edit="editUser" 
                      @toggle-status="toggleUserStatus" 
                      @delete="deleteUser" 
                    />
                  </div>
                  <div class="absolute bottom-0 left-4 right-4 h-px bg-gray-200"></div>
                </li>
              </ul>
            </div>
            <div v-else class="px-4 py-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
              Nenhum corretor cadastrado para este broker
            </div>
          </div>
        </div>
      </div>

      <!-- Partners -->
      <div v-if="partners.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Partners</h3>
        </div>
        <ul class="divide-y divide-gray-200">
          <li v-for="user in partners" :key="user.id" class="px-4 py-4">
            <UserListItem :user="user" @edit="editUser" @toggle-status="toggleUserStatus" @delete="deleteUser" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal de Usuário -->
    <Modal :show="isModalOpen" @close="closeModal">
      <template #title>
        {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
      </template>
      <template #content>
        <form @submit.prevent="saveUser">
          <div class="space-y-6">
            <div>
              <label for="displayName" class="block text-sm font-medium text-gray-700">Nome</label>
              <input 
                type="text" 
                id="displayName" 
                v-model="userForm.displayName" 
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="userForm.email" 
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">Telefone</label>
              <input 
                type="text" 
                id="phone" 
                v-model="userForm.phone" 
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">Papel</label>
              <select 
                id="role" 
                v-model="userForm.role" 
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="super_admin">Super Admin</option>
                <option value="broker">Broker</option>
                <option value="realtor">Realtor</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div v-if="userForm.role === 'realtor'">
              <label for="brokerId" class="block text-sm font-medium text-gray-700">Broker</label>
              <select 
                id="brokerId" 
                v-model="userForm.brokerId" 
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Selecione um broker</option>
                <option v-for="broker in brokers" :key="broker.id" :value="broker.id">{{ broker.displayName }}</option>
              </select>
            </div>
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
              <select 
                id="status" 
                v-model="userForm.status" 
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="active">Ativo</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button 
              type="button" 
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="closeModal"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserManagementStore } from '../../stores/userManagement';
import { storeToRefs } from 'pinia';
import Modal from '../../components/Modal.vue';
import UserListItem from '../../components/UserListItem.vue';

const userManagementStore = useUserManagementStore();
const { users, loading } = storeToRefs(userManagementStore);

// Estado do modal
const isModalOpen = ref(false);
const editingUser = ref<string | null>(null);
const userForm = ref({
  displayName: '',
  email: '',
  phone: '',
  role: 'realtor',
  brokerId: '',
  status: 'active'
});

// Estado do acordeon
const expandedBrokers = ref<string[]>([]);

// Filtros
const searchQuery = ref('');
const selectedRole = ref('all');
const selectedStatus = ref('all');

// Função para filtrar usuários
const filteredUsers = computed(() => {
  // Função auxiliar para verificar se um usuário corresponde aos critérios de busca
  const matchesSearch = (user: any) => {
    if (!searchQuery.value) return true;
    
    const query = searchQuery.value.toLowerCase();
    const searchFields = [
      user.displayName,
      user.email,
      user.role
    ].filter(Boolean).map(field => field.toLowerCase());

    return searchFields.some(field => field.includes(query));
  };

  // Função auxiliar para verificar se um usuário corresponde aos filtros
  const matchesFilters = (user: any) => {
    const roleMatch = selectedRole.value === 'all' || user.role === selectedRole.value;
    const statusMatch = selectedStatus.value === 'all' || user.status === selectedStatus.value;
    return roleMatch && statusMatch;
  };

  return users.value.reduce((filteredList, user) => {
    // Se for um broker
    if (user.role === 'broker') {
      const matchingRealtors = (user.realtors || []).filter(realtor => 
        matchesFilters(realtor) && matchesSearch(realtor)
      );

      // Se o broker corresponde aos critérios OU tem corretores que correspondem
      if (matchesFilters(user) && matchesSearch(user)) {
        // Broker corresponde, incluir com todos os seus corretores que passam nos filtros
        filteredList.push({
          ...user,
          realtors: user.realtors || []
        });
      } else if (matchingRealtors.length > 0) {
        // Broker não corresponde mas tem corretores que correspondem
        filteredList.push({
          ...user,
          realtors: matchingRealtors
        });
      }
    } 
    // Para outros tipos de usuário
    else if (matchesFilters(user) && matchesSearch(user)) {
      filteredList.push(user);
    }

    return filteredList;
  }, []);
});

const superAdmins = computed(() => {
  return filteredUsers.value.filter(user => user.role === 'super_admin');
});

const brokers = computed(() => {
  return filteredUsers.value.filter(user => user.role === 'broker');
});

const partners = computed(() => {
  return filteredUsers.value.filter(user => user.role === 'partner');
});

// Método para obter realtors de um broker específico
const getBrokerRealtors = (brokerId: string) => {
  return filteredUsers.value.filter(user => 
    user.role === 'realtor' && user.brokerId === brokerId
  );
};

// Métodos do acordeon
const toggleBroker = (brokerId: string) => {
  const index = expandedBrokers.value.indexOf(brokerId);
  if (index === -1) {
    expandedBrokers.value.push(brokerId);
  } else {
    expandedBrokers.value.splice(index, 1);
  }
};

// Métodos do modal e ações de usuário
const openNewUserModal = () => {
  editingUser.value = null;
  userForm.value = {
    displayName: '',
    email: '',
    phone: '',
    role: 'realtor',
    brokerId: '',
    status: 'active'
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingUser.value = null;
};

const editUser = (user: any) => {
  editingUser.value = user.id;
  userForm.value = { ...user };
  isModalOpen.value = true;
};

const deleteUser = async (userId: string) => {
  console.log('Excluindo usuário:', userId);
  if (!userId) {
    console.error('ID do usuário não fornecido');
    return;
  }

  try {
    await userManagementStore.deleteUser(userId);
    // Recarregar os dados após exclusão
    await userManagementStore.fetchUsers();
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
  }
};

const toggleUserStatus = async (userId: string, currentStatus: string) => {
  console.log('Alterando status do usuário:', { userId, currentStatus });
  if (!userId) {
    console.error('ID do usuário não fornecido');
    return;
  }

  const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
  try {
    if (newStatus === 'blocked') {
      await userManagementStore.blockUser(userId);
    } else {
      await userManagementStore.unblockUser(userId);
    }
    // Recarregar os dados após alteração
    await userManagementStore.fetchUsers();
    if (authStore.user?.uid) {
      await userManagementStore.fetchBrokerRealtors(authStore.user.uid);
    }
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
  }
};

const saveUser = async () => {
  try {
    if (userForm.value.role === 'realtor' && !userForm.value.brokerId) {
      throw new Error('Por favor, selecione um broker para o corretor');
    }

    if (editingUser.value) {
      await userManagementStore.updateUser(editingUser.value, userForm.value);
    } else {
      await userManagementStore.createUser(userForm.value);
    }
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
  }
};

onMounted(() => {
  userManagementStore.fetchUsers();
});
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
