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

        <h1 class="text-xl md:text-2xl font-bold leading-tight mt-12">Nova Senha</h1>
        <p class="text-gray-600 mt-2">
          Digite sua nova senha abaixo.
        </p>

        <form v-if="isValidCode" class="mt-6" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-gray-700">Nova Senha</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-[#012928]" />
              </div>
              <input 
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua nova senha" 
                v-model="password"
                class="w-full pl-10 px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-[#01FBA1] focus:bg-white focus:outline-none transition-all duration-200" 
                required
                minlength="8"
              >
              <div 
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-[#012928] hover:text-[#01FBA1]" />
                <EyeSlashIcon v-else class="h-5 w-5 text-[#012928] hover:text-[#01FBA1]" />
              </div>
            </div>

            <!-- Requisitos da senha -->
            <div class="mt-2 text-sm">
              <p :class="hasMinLength ? 'text-green-600' : 'text-gray-500'">
                ✓ Mínimo de 8 caracteres
              </p>
              <p :class="hasUpperCase ? 'text-green-600' : 'text-gray-500'">
                ✓ Uma letra maiúscula
              </p>
              <p :class="hasNumber ? 'text-green-600' : 'text-gray-500'">
                ✓ Um número
              </p>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-gray-700">Confirmar Senha</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-[#012928]" />
              </div>
              <input 
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirme sua nova senha" 
                v-model="confirmPassword"
                class="w-full pl-10 px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-[#01FBA1] focus:bg-white focus:outline-none transition-all duration-200" 
                required
              >
            </div>
          </div>

          <button
            type="submit"
            class="w-full block bg-[#012928] hover:bg-[#01FBA1] focus:bg-[#01FBA1] text-white font-semibold rounded-lg
                   px-4 py-3 mt-6 transform hover:scale-[1.02] transition-all duration-200 
                   focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :disabled="loading || !isValidForm"
          >
            <div class="flex items-center justify-center">
              <span v-if="!loading">Alterar Senha</span>
              <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="loading">Alterando...</span>
            </div>
          </button>
        </form>

        <!-- Mensagens -->
        <div 
          v-if="successMessage" 
          class="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
        >
          <p class="font-bold">Senha alterada!</p>
          <p>{{ successMessage }}</p>
          <p class="mt-2">
            <router-link 
              to="/login" 
              class="text-[#012928] hover:text-[#01FBA1] font-semibold"
            >
              Clique aqui para fazer login
            </router-link>
          </p>
        </div>

        <div 
          v-if="error" 
          class="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
        >
          <p class="font-bold">Erro!</p>
          <p>{{ error }}</p>
          <p v-if="!isValidCode" class="mt-2">
            <router-link 
              to="/forgot-password" 
              class="text-[#012928] hover:text-[#01FBA1] font-semibold"
            >
              Solicitar novo link
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import logoFull from '../assets/images/The Hub Realtors_Logo.svg';
import bgLogin from '../assets/images/background_login.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const isValidCode = ref(false);
const showPassword = ref(false);

// Validações de senha
const hasMinLength = computed(() => password.value.length >= 8);
const hasUpperCase = computed(() => /[A-Z]/.test(password.value));
const hasNumber = computed(() => /[0-9]/.test(password.value));

const isValidForm = computed(() => {
  return hasMinLength.value && 
         hasUpperCase.value && 
         hasNumber.value && 
         password.value === confirmPassword.value;
});

// Verificar o código na URL quando o componente é montado
onMounted(async () => {
  const code = route.query.oobCode;
  
  if (!code) {
    // Se não houver código, redireciona para a página de solicitar link
    router.replace('/forgot-password');
    return;
  }
  
  try {
    // Verificar se o código é válido
    await authStore.verifyPasswordResetCode(code as string);
    isValidCode.value = true;
  } catch (err: any) {
    console.error('Erro ao verificar código:', err);
    error.value = err.message || 'Este link de redefinição de senha expirou ou já foi usado.';
    // Se o código for inválido, também redireciona
    router.replace('/forgot-password');
  }
});

// Redefinir a senha
const handleSubmit = async () => {
  if (!isValidForm.value) {
    error.value = 'Por favor, verifique se a senha atende a todos os requisitos.';
    return;
  }

  loading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    await authStore.resetPassword(route.query.oobCode as string, password.value);
    successMessage.value = 'Sua senha foi alterada com sucesso!';
  } catch (err: any) {
    console.error('Erro ao redefinir senha:', err);
    error.value = err.message || 'Ocorreu um erro ao redefinir a senha. Tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>
