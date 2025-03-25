<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex items-center justify-between mb-8">
      <!-- Logo do InstaHub -->
      <div class="h-16">
        <img src="@/assets/images/InstaHub_Logo.svg" alt="InstaHub" class="h-full" />
      </div>
      
      <!-- Perfil do usuário atual -->
      <div class="flex items-center space-x-3">
        <router-link :to="`/instahub/profile/${currentUser.id}`" class="flex items-center space-x-3">
          <img 
            :src="currentUser.avatar" 
            alt="Seu perfil" 
            class="w-10 h-10 rounded-full object-cover border-2 border-[#01FBA1] hover:border-4 transition-all duration-200"
          >
          <div>
            <h3 class="font-semibold text-gray-800">{{ currentUser.name }}</h3>
            <p class="text-xs text-gray-500">{{ currentUser.role }}</p>
          </div>
        </router-link>
      </div>
    </div>
    
    <div class="max-w-3xl mx-auto">
      <!-- Componente de criação de post -->
      <CreateInstaHubPost />
      
      <!-- Filtros de categoria -->
      <div class="mb-8">
        <div class="flex flex-wrap items-center justify-start space-x-2 overflow-x-auto pb-2">
          <button 
            v-for="category in categories" 
            :key="category" 
            @click="setCategory(category)"
            class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none"
            :class="[
              selectedCategory === category 
                ? 'bg-[#01FBA1] text-[#012928] shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>
      
      <!-- Indicador de carregamento -->
      <div v-if="instaHubStore.isLoading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01FBA1]"></div>
      </div>
      
      <!-- Mensagem de erro -->
      <div v-else-if="instaHubStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
        <strong class="font-bold">Erro!</strong>
        <span class="block sm:inline"> {{ instaHubStore.error }}</span>
      </div>
      
      <!-- Posts filtrados por categoria -->
      <div v-else class="grid grid-cols-1 gap-8">
        <!-- Post individual -->
        <div 
          v-for="post in filteredPosts" 
          :key="post.id" 
          class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
        >
          <!-- Cabeçalho do Post -->
          <div class="p-4 flex items-center space-x-3">
            <router-link :to="`/instahub/profile/${post.author.id}`" class="flex items-center space-x-3">
              <img :src="post.author.avatar" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
              <div>
                <h3 class="font-semibold text-gray-800">{{ post.author.name }}</h3>
                <p class="text-xs text-gray-500">{{ post.author.role }}</p>
              </div>
            </router-link>
            
            <div class="ml-auto">
              <span class="text-xs text-gray-500">
                {{ new Date(post.createdAt).toLocaleDateString('pt-BR') }}
              </span>
              <span class="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                {{ post.category }}
              </span>
            </div>
          </div>
          
          <!-- Conteúdo de mídia do Post (Carrossel) -->
          <div class="relative">
            <!-- Inicializar currentMediaIndex se não existir -->
            <div v-if="!post.currentMediaIndex" style="display: none;">
              {{ post.currentMediaIndex = 0 }}
            </div>
            
            <!-- Container da mídia atual -->
            <div class="relative">
              <!-- Imagem -->
              <img 
                v-if="isImage(post.mediaFiles[post.currentMediaIndex]?.url)" 
                :src="post.mediaFiles[post.currentMediaIndex]?.url" 
                alt="Post media" 
                class="w-full h-auto max-h-[500px] object-contain bg-black"
              >
              
              <!-- Vídeo -->
              <video 
                v-else-if="isVideo(post.mediaFiles[post.currentMediaIndex]?.url)"
                :src="post.mediaFiles[post.currentMediaIndex]?.url" 
                controls 
                class="w-full h-auto max-h-[500px] object-contain bg-black"
              ></video>
            </div>
            
            <!-- Controles do carrossel (apenas se houver mais de uma mídia) -->
            <div v-if="post.mediaFiles.length > 1" class="absolute inset-0 flex items-center justify-between">
              <!-- Botão anterior -->
              <button 
                @click="prevMedia(post)" 
                class="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 ml-2 focus:outline-none transition-all duration-200"
                :class="{ 'opacity-50 cursor-not-allowed': post.currentMediaIndex === 0 }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <!-- Botão próximo -->
              <button 
                @click="nextMedia(post)" 
                class="bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full p-2 mr-2 focus:outline-none transition-all duration-200"
                :class="{ 'opacity-50 cursor-not-allowed': post.currentMediaIndex === post.mediaFiles.length - 1 }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <!-- Indicadores de posição (bolinhas) -->
            <div 
              v-if="post.mediaFiles.length > 1" 
              class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
            >
              <button 
                v-for="(_, index) in post.mediaFiles" 
                :key="index"
                @click="setMediaIndex(post, index)"
                class="w-2.5 h-2.5 rounded-full focus:outline-none transition-all duration-200"
                :class="post.currentMediaIndex === index ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'"
              ></button>
            </div>
          </div>
          
          <!-- Legenda e interações -->
          <div class="p-4">
            <div class="flex items-center space-x-4 mb-3">
              <button 
                @click="toggleLike(post)" 
                class="flex items-center space-x-1 focus:outline-none"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-6 w-6" 
                  :class="post.likedBy.includes(currentUser.id) ? 'text-red-500 fill-current' : 'text-gray-500'"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                <span class="text-sm">{{ post.likes }}</span>
              </button>
              
              <button class="flex items-center space-x-1 text-gray-500 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span class="text-sm">{{ post.comments.length }}</span>
              </button>
            </div>
            
            <p class="text-gray-800 mb-4">{{ post.caption }}</p>
            
            <!-- Comentários -->
            <div class="border-t border-gray-100 pt-3">
              <h4 class="font-medium text-sm text-gray-700 mb-2">Comentários</h4>
              
              <div class="space-y-2 mb-3 max-h-40 overflow-y-auto">
                <div v-for="comment in post.comments" :key="comment.id" class="flex space-x-2">
                  <router-link :to="`/instahub/profile/${comment.authorId}`" class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {{ comment.author.charAt(0) }}
                    </div>
                  </router-link>
                  <div class="flex-1">
                    <div class="bg-gray-100 rounded-lg p-2">
                      <router-link :to="`/instahub/profile/${comment.authorId}`" class="font-medium text-sm text-gray-800">
                        {{ comment.author }}
                      </router-link>
                      <p class="text-sm text-gray-700">{{ comment.text }}</p>
                    </div>
                    <span class="text-xs text-gray-500 mt-1">
                      {{ new Date(comment.createdAt).toLocaleDateString('pt-BR') }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Formulário de comentário -->
              <form @submit.prevent="addComment(post)" class="flex items-center">
                <input 
                  v-model="newComments[post.id || '']" 
                  type="text" 
                  placeholder="Adicione um comentário..." 
                  class="flex-1 bg-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1]"
                >
                <button 
                  type="submit" 
                  class="ml-2 bg-[#01FBA1] text-[#012928] rounded-full p-2 focus:outline-none hover:bg-opacity-90 transition-colors duration-200"
                  :disabled="!newComments[post.id || ''] || newComments[post.id || ''].trim() === ''"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Mensagem quando não há posts na categoria selecionada -->
        <div v-if="filteredPosts.length === 0" class="text-center py-8">
          <p class="text-gray-500 text-lg">Nenhum post encontrado na categoria "{{ selectedCategory }}".</p>
          <p class="text-gray-400 mt-2">Seja o primeiro a criar um post nesta categoria!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CreateInstaHubPost from '../components/CreateInstaHubPost.vue';
import { useInstaHubStore } from '../stores/instaHubStore';
import { getAuth } from 'firebase/auth';

// Store do InstaHub
const instaHubStore = useInstaHubStore();

// Usuário atual (mockado para demonstração)
// Em uma implementação real, isso viria do Firebase Auth
const currentUser = ref({
  id: 'user123',
  name: 'Você',
  role: 'Corretor',
  avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
});

// Categoria selecionada
const selectedCategory = ref('Todos');

// Comentário sendo digitado
const newComments = ref<Record<string, string>>({});

// Carregar posts ao montar o componente
onMounted(async () => {
  try {
    await instaHubStore.fetchAllPosts();
    
    // Atualizar informações do usuário atual
    const auth = getAuth();
    if (auth.currentUser) {
      currentUser.value = {
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName || 'Você',
        role: 'Corretor', // Isso seria obtido do perfil do usuário
        avatar: auth.currentUser.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
      };
    }
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
  }
});

// Categorias disponíveis
const categories = computed(() => instaHubStore.categories);

// Posts filtrados com base na categoria selecionada
const filteredPosts = computed(() => {
  if (selectedCategory.value === 'Todos') {
    return instaHubStore.posts;
  }
  return instaHubStore.posts.filter(post => post.category === selectedCategory.value);
});

// Função para verificar se a mídia é uma imagem
const isImage = (url: string): boolean => {
  return !isVideo(url);
};

// Função para verificar se a mídia é um vídeo
const isVideo = (url: string): boolean => {
  return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || 
         url.includes('video') || url.includes('/videos/');
};

// Função para curtir/descurtir um post
const toggleLike = async (post: any): Promise<void> => {
  if (!post.id) return;
  
  try {
    await instaHubStore.toggleLike(post.id);
  } catch (error) {
    console.error('Erro ao curtir/descurtir post:', error);
  }
};

// Função para adicionar um comentário
const addComment = async (post: any): Promise<void> => {
  if (!post.id) return;
  
  const commentText = newComments.value[post.id];
  if (!commentText || commentText.trim() === '') return;
  
  try {
    await instaHubStore.addComment(post.id, commentText);
    newComments.value[post.id] = ''; // Limpar o campo após enviar
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
  }
};

// Função para navegar para a mídia anterior
const prevMedia = (post: any) => {
  if (!post.currentMediaIndex) post.currentMediaIndex = 0;
  if (post.currentMediaIndex > 0) {
    post.currentMediaIndex--;
  }
};

// Função para navegar para a próxima mídia
const nextMedia = (post: any) => {
  if (!post.currentMediaIndex) post.currentMediaIndex = 0;
  if (post.currentMediaIndex < post.mediaFiles.length - 1) {
    post.currentMediaIndex++;
  }
};

// Função para definir o índice da mídia atual
const setMediaIndex = (post: any, index: number) => {
  post.currentMediaIndex = index;
};

// Função para alterar a categoria
const setCategory = (category: string) => {
  selectedCategory.value = category;
};
</script>
