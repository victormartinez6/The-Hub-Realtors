<template>
  <section class="flex flex-col md:flex-row h-screen items-center">
    <!-- Imagem de fundo -->
    <div class="hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
      <img :src="bgLogin" alt="" class="w-full h-full object-cover">
    </div>

    <!-- Formulário -->
    <div class="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
      <div class="w-full h-100">
        <img :src="logoFull" alt="The Hub Realtors" class="h-16 mx-auto mb-8">

        <h1 class="text-xl md:text-2xl font-bold leading-tight mt-12">Esqueceu sua senha?</h1>
        <p class="text-gray-600 mt-2">
          Digite seu email abaixo e enviaremos um link para redefinir sua senha.
        </p>

        <form class="mt-6" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-gray-700">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="h-5 w-5 text-[#012928]" />
              </div>
              <input 
                type="email" 
                placeholder="Digite seu email" 
                v-model="email"
                class="w-full pl-10 px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-[#01FBA1] focus:bg-white focus:outline-none transition-all duration-200" 
                required
                autofocus
              >
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full block bg-[#012928] hover:bg-[#01FBA1] focus:bg-[#01FBA1] text-white font-semibold rounded-lg
                   px-4 py-3 mt-6 transform hover:scale-[1.02] transition-all duration-200 
                   focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div class="flex items-center justify-center">
              <span v-if="!loading">Enviar Link</span>
              <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="loading">Enviando...</span>
            </div>
          </button>
        </form>

        <!-- Mensagens -->
        <div 
          v-if="successMessage" 
          class="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
        >
          <p class="font-bold">Email enviado!</p>
          <p>{{ successMessage }}</p>
          <p class="mt-2 text-sm">
            Não recebeu? Verifique sua pasta de spam ou 
            <button 
              @click="handleSubmit" 
              class="text-[#012928] hover:text-[#01FBA1] font-semibold"
              :disabled="loading"
            >
              tente novamente
            </button>
          </p>
        </div>

        <div 
          v-if="error" 
          class="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
        >
          <p class="font-bold">Erro!</p>
          <p>{{ error }}</p>
        </div>

        <p class="mt-8 text-center">
          Lembrou sua senha? 
          <router-link 
            to="/login" 
            class="text-[#012928] hover:text-[#01FBA1] font-semibold"
          >
            Fazer login
          </router-link>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { EnvelopeIcon } from '@heroicons/vue/24/outline';
import logoFull from '../assets/images/The Hub Realtors_Logo.svg';
import bgLogin from '../assets/images/background_login.jpg';

const authStore = useAuthStore();
const email = ref('');
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    await authStore.sendPasswordResetEmail(email.value);
    successMessage.value = 'Enviamos um link de redefinição de senha para o seu email. Por favor, verifique sua caixa de entrada.';
  } catch (err: any) {
    console.error('Erro ao enviar email:', err);
    error.value = err.message || 'Ocorreu um erro ao enviar o email. Por favor, tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>
