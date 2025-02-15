<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Meus Corretores</h1>
      <button 
        @click="openNewUserModal"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Novo Corretor
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Busca -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Nome, email ou telefone"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
      {{ error }}
    </div>

    <!-- Lista de Corretores -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Corretor
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último Acesso
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img 
                    :src="user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`" 
                    :alt="user.displayName"
                    class="h-10 w-10 rounded-full"
                  >
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.displayName }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                  <div class="text-sm text-gray-500">{{ user.phone }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': user.status === 'active',
                  'bg-gray-100 text-gray-800': user.status === 'inactive',
                  'bg-red-100 text-red-800': user.status === 'blocked'
                }"
              >
                {{ formatStatus(user.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ formatDate(user.lastLogin) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button 
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button 
                  v-if="user.status !== 'blocked'"
                  @click="blockUser(user.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Bloquear
                </button>
                <button 
                  v-else
                  @click="unblockUser(user.id)"
                  class="text-green-600 hover:text-green-900"
                >
                  Desbloquear
                </button>
                <button 
                  @click="resetPassword(user.email)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Resetar Senha
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="text-center py-8">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vector-effect="non-scaling-stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum corretor encontrado</h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece criando um novo corretor ou ajuste os filtros de busca.
        </p>
        <div class="mt-6">
          <button
            @click="openNewUserModal"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Novo Corretor
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Novo/Editar Corretor -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  {{ editingUser ? 'Editar Corretor' : 'Novo Corretor' }}
                </DialogTitle>

                <!-- Mensagem de Erro -->
                <div v-if="formError" class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {{ formError }}
                </div>

                <form @submit.prevent="saveUser" class="mt-4 space-y-4">
                  <!-- Nome -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      v-model="userForm.displayName"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      v-model="userForm.email"
                      required
                      :disabled="editingUser"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <!-- Telefone -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      type="tel"
                      v-model="userForm.phone"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <!-- Status -->
                  <div v-if="editingUser">
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      v-model="userForm.status"
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>

                  <div class="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      @click="closeModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {{ editingUser ? 'Salvar' : 'Criar' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { useUserManagementStore } from '../../stores/userManagement';
import { useAuthStore } from '../../stores/auth';
import { storeToRefs } from 'pinia';

const userManagementStore = useUserManagementStore();
const authStore = useAuthStore();
const { users, loading, error } = storeToRefs(userManagementStore);
const { currentUser } = storeToRefs(authStore);

// Estado do modal e formulário
const isModalOpen = ref(false);
const editingUser = ref<string | null>(null);
const formError = ref('');

const userForm = ref({
  displayName: '',
  email: '',
  phone: '',
  role: 'realtor' as const,
  brokerId: '',
  brokerName: '',
  status: 'active' as const
});

// Watchers para atualizar o broker quando currentUser mudar
watch(currentUser, (newUser) => {
  if (newUser) {
    userForm.value.brokerId = newUser.id;
    userForm.value.brokerName = newUser.displayName;
  }
}, { immediate: true });

// Filtros
const filters = ref({
  search: '',
  status: 'all'
});

// Computed para usuários filtrados
const filteredUsers = computed(() => {
  // Filtrar apenas corretores deste broker
  let filtered = users.value.filter(user => 
    user.role === 'realtor' && user.brokerId === currentUser.value?.id
  );

  // Filtrar por busca
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(user => 
      user.displayName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.phone && user.phone.includes(search))
    );
  }

  // Filtrar por status
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(user => user.status === filters.value.status);
  }

  return filtered;
});

// Formatadores
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    blocked: 'Bloqueado'
  };
  return statusMap[status] || status;
};

const formatDate = (date: Date) => {
  if (!date) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Ações
const openNewUserModal = () => {
  if (!currentUser.value?.id) {
    alert('Erro: Não foi possível identificar o broker atual');
    return;
  }

  editingUser.value = null;
  userForm.value = {
    displayName: '',
    email: '',
    phone: '',
    role: 'realtor',
    brokerId: currentUser.value.id,
    brokerName: currentUser.value.displayName || '',
    status: 'active'
  };
  isModalOpen.value = true;
};

const editUser = (user: any) => {
  editingUser.value = user.id;
  userForm.value = { ...user };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingUser.value = null;
  formError.value = '';
};

const saveUser = async () => {
  formError.value = '';
  try {
    if (!currentUser.value?.id) {
      throw new Error('Erro: Não foi possível identificar o broker atual');
    }

    const userData = {
      ...userForm.value,
      brokerId: currentUser.value.id,
      brokerName: currentUser.value.displayName || ''
    };

    if (editingUser.value) {
      await userManagementStore.updateUser(editingUser.value, userData);
    } else {
      await userManagementStore.createUser(userData);
    }
    closeModal();
  } catch (err: any) {
    formError.value = err.message || 'Erro ao salvar usuário';
    console.error('Erro ao salvar usuário:', err);
  }
};

const blockUser = async (userId: string) => {
  if (confirm('Tem certeza que deseja bloquear este corretor?')) {
    try {
      await userManagementStore.blockUser(userId);
    } catch (err) {
      console.error('Erro ao bloquear corretor:', err);
    }
  }
};

const unblockUser = async (userId: string) => {
  try {
    await userManagementStore.unblockUser(userId);
  } catch (err) {
    console.error('Erro ao desbloquear corretor:', err);
  }
};

const resetPassword = async (email: string) => {
  if (confirm('Enviar email de redefinição de senha para este corretor?')) {
    try {
      await userManagementStore.resetPassword(email);
      alert('Email de redefinição de senha enviado com sucesso!');
    } catch (err) {
      console.error('Erro ao enviar email de redefinição:', err);
    }
  }
};

// Carregar dados iniciais
onMounted(() => {
  userManagementStore.fetchUsers();
});
</script>
