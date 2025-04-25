<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fundo -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Centraliza o modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
        @click.stop
      >
        <!-- Botão de fechar -->
        <button 
          @click="closeModal" 
          class="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex flex-col md:flex-row">
          <!-- Carrossel de imagens (lado esquerdo) -->
          <div class="md:w-1/2 relative bg-gray-100">
            <!-- Indicador de carregamento -->
            <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01FBA1]"></div>
            </div>
            
            <!-- Imagens do post -->
            <div class="relative" style="height: 500px;">
              <transition name="fade" mode="out-in">
                <img 
                  v-if="post.mediaFiles && post.mediaFiles.length > 0" 
                  :key="currentMediaIndex" 
                  :src="sanitizeUrl(post.mediaFiles[currentMediaIndex])" 
                  alt="Imagem do imóvel" 
                  class="w-full h-full object-cover"
                  @load="isLoading = false"
                  @error="handleImageError"
                />
              </transition>
              
              <!-- Indicador de múltiplas imagens -->
              <div 
                v-if="post.mediaFiles && post.mediaFiles.length > 1" 
                class="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full px-2 py-1 text-white text-xs font-medium"
              >
                {{ currentMediaIndex + 1 }}/{{ post.mediaFiles.length }}
              </div>
              
              <!-- Botões de navegação do carrossel -->
              <button 
                v-if="post.mediaFiles && post.mediaFiles.length > 1" 
                @click="previousImage"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                v-if="post.mediaFiles && post.mediaFiles.length > 1" 
                @click="nextImage"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Detalhes do post (lado direito) -->
          <div class="md:w-1/2 p-6 max-h-[500px] overflow-y-auto">
            <!-- Abas -->
            <div class="flex border-b border-gray-200 mb-4">
              <button 
                @click="activeTab = 'details'"
                class="px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 focus:outline-none"
                :class="activeTab === 'details' ? 'border-[#01FBA1] text-[#01FBA1]' : 'border-transparent text-gray-500 hover:text-gray-700'"
              >
                Detalhes
              </button>
              <button 
                @click="activeTab = 'comments'"
                class="px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 focus:outline-none"
                :class="activeTab === 'comments' ? 'border-[#01FBA1] text-[#01FBA1]' : 'border-transparent text-gray-500 hover:text-gray-700'"
              >
                Comentários ({{ post.comments?.length || 0 }})
              </button>
            </div>
            
            <!-- Conteúdo da aba Detalhes -->
            <div v-if="activeTab === 'details'">
              <!-- Autor do post -->
              <div class="flex items-center space-x-3 mb-4">
                <div class="flex items-center space-x-3 cursor-pointer" @click="showUserCard(post.author)">
                  <img 
                    :src="sanitizeUrl(post.author.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg')" 
                    alt="Avatar" 
                    class="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    @error="handleImageError"
                  >
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ post.author.name }}</h3>
                    <p class="text-xs text-gray-500">{{ t(`roles.${post.author.role || 'user'}`) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Título e preço -->
              <div class="flex justify-between items-start mb-2">
                <h2 class="text-xl font-bold text-gray-800">{{ post.title }}</h2>
                <p v-if="post.propertyInfo?.price" class="text-lg font-bold text-[#01FBA1]">
                  {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(post.propertyInfo.price) }}
                </p>
              </div>
              
              <!-- Categoria -->
              <div class="mb-3">
                <span 
                  v-if="post.category" 
                  class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {{ post.category }}
                </span>
              </div>
              
              <!-- Localização -->
              <div v-if="post.propertyInfo?.location" class="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ post.propertyInfo.location }}
              </div>
              
              <!-- Conteúdo do post -->
              <p class="text-gray-700 mb-4">{{ post.content }}</p>
              
              <!-- Características do imóvel -->
              <div v-if="post.propertyInfo?.features" class="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 class="font-medium text-gray-800 mb-2">Características do Imóvel</h3>
                <div class="grid grid-cols-2 gap-2">
                  <div v-if="post.propertyInfo.features.bedrooms !== undefined" class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{{ post.propertyInfo.features.bedrooms }} Quartos</span>
                  </div>
                  <div v-if="post.propertyInfo.features.bathrooms !== undefined" class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ post.propertyInfo.features.bathrooms }} Banheiros</span>
                  </div>
                  <div v-if="post.propertyInfo.features.area !== undefined" class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-3m-6 0h-3m6 0V7m3 14V7" />
                    </svg>
                    <span>{{ post.propertyInfo.features.area }}m²</span>
                  </div>
                  <div v-if="post.propertyInfo.features.garage !== undefined" class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-3m-6 0h-3m6 0V7m3 14V7" />
                    </svg>
                    <span>{{ post.propertyInfo.features.garage }} Vagas</span>
                  </div>
                </div>
              </div>
              
              <!-- Estatísticas de engajamento -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <!-- Curtir -->
                  <button 
                    @click="toggleLike(post.id)"
                    class="flex items-center gap-1 text-gray-500 hover:text-[#01FBA1] transition-colors duration-200"
                    :class="{ 'text-[#01FBA1]': post.likedBy?.includes(authStore.user?.uid) }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ post.likedBy?.length || 0 }}</span>
                  </button>
                  
                  <!-- Comentar -->
                  <button 
                    @click="activeTab = 'comments'"
                    class="flex items-center gap-1 text-gray-500 hover:text-[#01FBA1] transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ post.comments?.length || 0 }}</span>
                  </button>
                </div>
                
                <!-- Tenho Interesse -->
                <button 
                  @click="toggleInteresse(post.id)"
                  class="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200"
                  :class="post.interesseBy?.includes(authStore.user?.uid) 
                    ? 'bg-[#01FBA1] text-[#012928]' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>{{ post.interesseBy?.includes(authStore.user?.uid) ? 'Tenho Interesse' : 'Marcar Interesse' }}</span>
                  <span v-if="post.interesseBy?.length" class="ml-1">({{ post.interesseBy.length }})</span>
                </button>
              </div>
              
              <!-- Data de publicação -->
              <p class="text-xs text-gray-500 mb-4">Publicado em {{ formatDate(post.createdAt) }}</p>
              
              <!-- Botão "Ver no Feed" -->
              <button 
                @click="goToPostInFeed"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#012928] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver no Feed
              </button>
            </div>
            
            <!-- Conteúdo da aba Comentários -->
            <div v-if="activeTab === 'comments'">
              <!-- Lista de comentários -->
              <div v-if="post.comments && post.comments.length > 0" class="mb-4 space-y-4">
                <div v-for="(comment, index) in post.comments" :key="index" class="bg-gray-50 p-3 rounded-lg">
                  <div class="flex items-start space-x-3">
                    <img 
                      :src="sanitizeUrl(comment.author.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg')" 
                      alt="Avatar" 
                      class="w-8 h-8 rounded-full object-cover border border-gray-200 mt-1"
                      @error="handleImageError"
                    >
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-medium text-gray-800">{{ comment.author.name }}</h4>
                        <p class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</p>
                      </div>
                      <p class="text-gray-700">{{ comment.text }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
              
              <!-- Formulário de comentário -->
              <div class="mt-4">
                <div class="flex items-start space-x-3">
                  <img 
                    :src="sanitizeUrl(authStore.user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg')" 
                    alt="Avatar" 
                    class="w-8 h-8 rounded-full object-cover border border-gray-200"
                    @error="handleImageError"
                  >
                  <div class="flex-1">
                    <textarea 
                      v-model="commentText" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-transparent"
                      placeholder="Adicione um comentário..."
                      rows="3"
                    ></textarea>
                    <div class="mt-2 flex justify-end">
                      <button 
                        @click="addComment"
                        :disabled="!commentText.trim()"
                        class="px-4 py-2 bg-[#01FBA1] text-[#012928] rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { useTranslation } from '@/composables/useTranslation';
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useInstaHubStore } from '@/stores/instaHubStore';
import { useRouter } from 'vue-router';

// Props e Emits
const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  post: {
    type: Object,
    default: () => ({})
  },
  initialTab: {
    type: String,
    default: 'details'
  }
});

const emit = defineEmits(['close', 'showUserCard']);

// Stores e Router
const authStore = useAuthStore();
const instaHubStore = useInstaHubStore();
const router = useRouter();

// Estado local
const activeTab = ref(props.initialTab);
const currentMediaIndex = ref(0);
const isLoading = ref(true);
const commentText = ref('');

// Observar mudanças no post para resetar o índice da mídia
watch(() => props.post, () => {
  currentMediaIndex.value = 0;
  isLoading.value = true;
}, { deep: true });

// Observar mudanças na aba inicial
watch(() => props.initialTab, (newTab) => {
  activeTab.value = newTab;
});

// Funções para o carrossel de imagens
function nextImage() {
  if (props.post.mediaFiles && props.post.mediaFiles.length > 0) {
    currentMediaIndex.value = (currentMediaIndex.value + 1) % props.post.mediaFiles.length;
    isLoading.value = true;
  }
}

function previousImage() {
  if (props.post.mediaFiles && props.post.mediaFiles.length > 0) {
    currentMediaIndex.value = (currentMediaIndex.value - 1 + props.post.mediaFiles.length) % props.post.mediaFiles.length;
    isLoading.value = true;
  }
}

// Funções para interação com posts
function toggleLike(postId: string) {
  if (authStore.user?.uid) {
    instaHubStore.toggleLike(postId, authStore.user.uid);
  }
}

function toggleInteresse(postId: string) {
  if (authStore.user?.uid) {
    instaHubStore.toggleInteresse(postId, authStore.user.uid);
  }
}

// Função para adicionar comentário
function addComment() {
  if (commentText.value.trim() && props.post.id && authStore.user?.uid) {
    const authorData = {
      id: authStore.user.uid,
      name: authStore.user.displayName || 'Usuário',
      photoURL: authStore.user.photoURL || '',
      role: authStore.userData?.role || 'user'
    };
    
    instaHubStore.addComment(props.post.id, {
      text: commentText.value.trim(),
      author: authorData,
      createdAt: Date.now()
    });
    
    commentText.value = '';
  }
}

// Função para fechar o modal
function closeModal() {
  emit('close');
}

// Função para mostrar o cartão de usuário
function showUserCard(user: any) {
  emit('showUserCard', user);
  closeModal();
}

// Função para ir para o post no feed
function goToPostInFeed() {
  if (props.post.id) {
    router.push({ 
      path: '/instahub',
      query: { postId: props.post.id }
    });
    closeModal();
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

// Função para formatar datas
function formatDate(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    const date = typeof dateValue === 'number' 
      ? new Date(dateValue) 
      : dateValue instanceof Date 
        ? dateValue 
        : new Date(dateValue);
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

// Internacionalização
const { t } = useTranslation();
</script>

<style scoped>
/* Animação de transição para o carrossel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
