<template>
  <section class="flex flex-col md:flex-row h-screen items-center">
    <!-- Lado Esquerdo - Imagem -->
    <div class="hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
      <img :src="bgLogin" alt="" class="w-full h-full object-cover">
    </div>

    <!-- Lado Direito - Login -->
    <div class="bg-white w-full md:max-w-md lg:max-w-full md:mx-auto md:mx-0 md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12
          flex items-center justify-center">
      <div class="w-full h-100">
        <div class="flex justify-center mb-12">
          <img :src="logoFull" alt="The Hub Realtors" class="h-48 w-auto" />
        </div>

        <form class="mt-6" @submit.prevent="handleLogin">
          <div v-if="authStore.error" class="mb-4 text-red-500">{{ authStore.error }}</div>
          
          <div>
            <label class="block text-[#012928]">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="h-5 w-5 text-[#012928]" />
              </div>
              <input 
                v-model="email"
                type="email" 
                placeholder="Digite seu email" 
                class="w-full pl-10 px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-[#01FBA1] focus:bg-white focus:outline-none transition-all duration-200" 
                autofocus 
                required
              >
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-[#012928]">Senha</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-[#012928]" />
              </div>
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua senha" 
                minlength="6" 
                class="w-full pl-10 px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-[#01FBA1] focus:bg-white focus:outline-none transition-all duration-200" 
                required
              >
              <div 
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-[#012928] hover:text-[#01FBA1]" />
                <EyeSlashIcon v-else class="h-5 w-5 text-[#012928] hover:text-[#01FBA1]" />
              </div>
            </div>
          </div>

          <div class="text-right mt-2">
            <router-link 
              to="/reset-password" 
              class="text-sm font-semibold text-[#012928] hover:text-[#01FBA1] transition-colors duration-200"
            >
              Esqueceu sua senha?
            </router-link>
          </div>

          <button 
            type="submit" 
            class="w-full block bg-[#012928] hover:bg-[#01FBA1] focus:bg-[#01FBA1] text-white font-semibold rounded-lg
                   px-4 py-3 mt-6 transform hover:scale-[1.02] transition-all duration-200 
                   focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :disabled="authStore.loading"
          >
            <div class="flex items-center justify-center">
              <span v-if="!authStore.loading">Entrar</span>
              <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="authStore.loading">Entrando...</span>
            </div>
          </button>

          <hr class="my-6 border-gray-300 w-full">

          <p class="mt-8 text-center">Precisa de uma conta? <a href="#" class="text-[#012928] hover:text-[#01FBA1] font-semibold">Criar conta</a></p>

        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline';
import logoFull from '../assets/images/The Hub Realtors_Logo.svg';
import bgLogin from '../assets/images/background_login.jpg';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  try {
    const result = await authStore.login(email.value, password.value);
    
    if (result.success) {
      switch (result.role) {
        case 'super_admin':
          router.push('/admin/users');
          break;
        case 'broker':
          router.push('/dashboard/broker');
          break;
        case 'realtor':
          router.push('/dashboard/realtor');
          break;
        case 'partner':
          router.push('/dashboard/partner');
          break;
        default:
          router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('Erro no login:', error);
  }
};
</script>