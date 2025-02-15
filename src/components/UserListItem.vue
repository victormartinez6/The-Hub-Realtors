<template>
  <div class="flex items-center justify-between py-4">
    <div class="flex items-center flex-1 min-w-0">
      <!-- Avatar -->
      <div class="flex-shrink-0 h-10 w-10">
        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-white">
          <span v-if="!user.photoURL" class="text-gray-500 font-medium text-sm">
            {{ getInitials(user.displayName) }}
          </span>
          <img
            v-else
            :src="user.photoURL"
            :alt="user.displayName"
            class="h-10 w-10 object-cover"
          />
        </div>
      </div>

      <!-- Informações do usuário -->
      <div class="ml-4 flex-1 min-w-0">
        <div class="flex items-center">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user.displayName }}</p>
          <!-- Badge de papel -->
          <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="getRoleBadgeClass(user.role)">
            {{ getRoleLabel(user.role) }}
          </span>
          <!-- Badge de status -->
          <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(user.status)">
            {{ getStatusLabel(user.status) }}
          </span>
        </div>
        <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
      </div>
    </div>

    <!-- Ações -->
    <div class="flex items-center gap-1 ml-4">
      <button
        @click="$emit('edit', user)"
        class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        title="Editar usuário"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </button>
      <button
        @click="$emit('toggle-status', user.id, user.status)"
        class="p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
        :class="user.status === 'active' ? 'text-gray-500 hover:text-red-600 focus:ring-red-500' : 'text-gray-500 hover:text-green-600 focus:ring-green-500'"
        :title="user.status === 'active' ? 'Bloquear usuário' : 'Ativar usuário'"
      >
        <svg v-if="user.status === 'active'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </button>
      <button
        @click="confirmDelete"
        class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        title="Excluir usuário"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  status: string;
  phone?: string;
  brokerId?: string;
  brokerName?: string;
}

const authStore = useAuthStore();

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  (e: 'edit', user: User): void;
  (e: 'toggle-status', userId: string, currentStatus: string): void;
  (e: 'delete', userId: string): void;
}>();

// Função para gerar iniciais do nome
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Classes para os badges de papel
const getRoleBadgeClass = (role: string) => {
  const classes = {
    super_admin: 'bg-purple-100 text-purple-800',
    broker: 'bg-blue-100 text-blue-800',
    realtor: 'bg-green-100 text-green-800',
    partner: 'bg-yellow-100 text-yellow-800'
  };
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

// Classes para os badges de status
const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800'
  };
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
};

// Labels para os papéis
const getRoleLabel = (role: string) => {
  const labels = {
    super_admin: 'Super Admin',
    broker: 'Broker',
    realtor: 'Corretor',
    partner: 'Parceiro'
  };
  return labels[role as keyof typeof labels] || role;
};

// Labels para os status
const getStatusLabel = (status: string) => {
  const labels = {
    active: 'Ativo',
    blocked: 'Bloqueado'
  };
  return labels[status as keyof typeof labels] || status;
};

// Função para confirmar e emitir evento de exclusão
const confirmDelete = () => {
  if (confirm('Tem certeza que deseja excluir o usuário?')) {
    emit('delete', props.user.id || props.user.uid);
  }
};
</script>
