<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { UserRole } from '../types/models';
import { brokerService } from '../services/brokerService';

const router = useRouter();
const authStore = useAuthStore();

interface FormData {
  email: string;
  password: string;
  name: string;
  role: UserRole | '';
  companyName?: string;
  brokerId?: string;
  phoneNumber?: string;
}

const formData = ref<FormData>({
  email: '',
  password: '',
  name: '',
  role: '',
});

const loading = ref(false);
const error = ref('');
const brokers = ref([]);

onMounted(async () => {
  try {
    // Carregar lista de brokers para seleção
    brokers.value = await brokerService.getActiveBrokers();
  } catch (err) {
    console.error('Erro ao carregar brokers:', err);
  }
});

const handleRegister = async () => {
  if (!formData.value.role) {
    error.value = 'Por favor, selecione um tipo de usuário';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const success = await authStore.register(
      formData.value.email,
      formData.value.password,
      formData.value.role as UserRole,
      {
        name: formData.value.name,
        companyName: formData.value.companyName,
        brokerId: formData.value.brokerId,
        phoneNumber: formData.value.phoneNumber
      }
    );

    if (success) {
      router.push('/');
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao registrar usuário';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="text-center text-3xl font-bold text-indigo-600">The Hub Realtors</h1>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            faça login em sua conta
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Nome completo -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nome completo</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              v-model="formData.name"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Seu nome completo"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              v-model="formData.email"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="seu@email.com"
            />
          </div>

          <!-- Senha -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="formData.password"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="********"
            />
          </div>

          <!-- Tipo de usuário -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Tipo de usuário</label>
            <select
              id="role"
              name="role"
              required
              v-model="formData.role"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Selecione um tipo</option>
              <option value="broker">Broker</option>
              <option value="realtor">Realtor</option>
              <option value="partner">Parceiro</option>
            </select>
          </div>

          <!-- Campos específicos para Broker -->
          <div v-if="formData.role === 'broker'" class="space-y-4">
            <div>
              <label for="companyName" class="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                v-model="formData.companyName"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nome da sua empresa"
              />
            </div>
          </div>

          <!-- Campos específicos para Realtor -->
          <div v-if="formData.role === 'realtor'" class="space-y-4">
            <div>
              <label for="brokerId" class="block text-sm font-medium text-gray-700">Broker</label>
              <select
                id="brokerId"
                name="brokerId"
                required
                v-model="formData.brokerId"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Selecione um broker</option>
                <option v-for="broker in brokers" :key="broker.uid" :value="broker.uid">
                  {{ broker.companyName }} - {{ broker.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Telefone (opcional) -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Telefone (opcional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              v-model="formData.phoneNumber"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                v-if="!loading"
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ loading ? 'Registrando...' : 'Registrar' }}
          </button>
        </div>

        <!-- Mensagem de erro -->
        <div v-if="error" class="mt-4 text-center text-sm text-red-600">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>