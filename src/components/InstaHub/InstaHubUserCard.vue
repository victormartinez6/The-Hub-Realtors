<template>
  <div v-if="showCard" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fundo -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeCard"></div>

      <!-- Centraliza o cartão -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Cartão de visitas -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
        @click.stop
      >
        <!-- Botão de fechar -->
        <button 
          @click="closeCard" 
          class="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Conteúdo do cartão -->
        <div class="p-6">
          <!-- Foto e nome -->
          <div class="flex items-center space-x-4 mb-6">
            <img 
              :src="sanitizeUrl(user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg')" 
              alt="Avatar" 
              class="w-16 h-16 rounded-full object-cover border-2 border-[#01FBA1]"
              @error="handleImageError"
            >
            <div>
              <h3 class="text-xl font-bold text-gray-800">{{ user.name }}</h3>
              <p class="text-sm text-gray-500">{{ t(`roles.${user.role || 'user'}`) }}</p>
            </div>
          </div>
          
          <!-- Informações de contato -->
          <div class="space-y-3 mb-6">
            <div v-if="user.email" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="#" @click.prevent="sendEmail" class="text-gray-700 hover:text-[#012928] hover:underline">{{ user.email }}</a>
            </div>
            <div v-if="user.phone" class="flex items-center gap-2">
              <!-- Ícone do WhatsApp -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <a href="#" @click.prevent="openWhatsApp" class="text-gray-700 hover:text-green-600 hover:underline">{{ user.phone }}</a>
            </div>
            <div v-if="user.website" class="flex items-center gap-2">
              <!-- Ícone do Website -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a href="#" @click.prevent="openWebsite" class="text-blue-600 hover:underline">{{ user.website }}</a>
            </div>
            <div v-if="user.creci" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#01FBA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span class="text-gray-700">CRECI: {{ user.creci }}</span>
            </div>
          </div>
          
          <!-- Bio -->
          <div v-if="user.bio" class="mb-6">
            <h4 class="text-sm font-medium text-gray-500 mb-1">Sobre</h4>
            <p class="text-gray-700">{{ user.bio }}</p>
          </div>
          
          <!-- Botões de ação -->
          <div class="flex gap-2">
            <button 
              @click="goToProfile"
              class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#012928] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Ver Perfil
            </button>
            <button 
              v-if="user.email"
              @click="sendEmail"
              class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contatar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { useTranslation } from '@/composables/useTranslation';
import { defineProps, defineEmits } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

// Props e Emits
const props = defineProps({
  showCard: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

// Stores e Router
const authStore = useAuthStore();
const router = useRouter();

// Função para fechar o cartão
function closeCard() {
  emit('close');
}

// Função para ir para o perfil do usuário
function goToProfile() {
  if (props.user.id) {
    router.push(`/instahub/profile/${props.user.id}`);
    closeCard();
  }
}

// Função para enviar email
function sendEmail() {
  if (props.user.email) {
    window.location.href = `mailto:${props.user.email}`;
  }
}

// Função para abrir website
function openWebsite() {
  if (props.user.website) {
    window.open(props.user.website, '_blank');
  }
}

// Função para abrir WhatsApp
function openWhatsApp() {
  if (props.user.phone) {
    // Remover caracteres não numéricos do telefone
    const phoneNumber = props.user.phone.replace(/\D/g, '');
    // Abrir WhatsApp com o número formatado
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  }
}

// Função para sanitizar URLs
function sanitizeUrl(url?: any): string {
  if (!url) {
    return authStore.user?.photoURL || '';
  }
  
  if (typeof url === 'object' && url !== null) {
    if (url.url && typeof url.url === 'string') {
      return url.url;
    }
    return '';
  }
  
  if (typeof url !== 'string') {
    return '';
  }
  
  if (url.startsWith('@/')) {
    return url.replace('@/', '/');
  }
  
  return url;
}

// Função para lidar com erro de imagem
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (authStore.user?.photoURL) {
    target.src = authStore.user.photoURL;
  } else {
    target.style.display = 'none';
  }
}

// Internacionalização
const { t } = useTranslation();
</script>
