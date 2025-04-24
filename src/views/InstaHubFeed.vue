<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Cabeçalho do InstaHub -->
    <InstaHubHeader />
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      <!-- Coluna principal (feed) - ocupa 2/3 da largura em telas grandes -->
      <div class="lg:col-span-2">
        <!-- Componente de criação de post -->
        <CreateInstaHubPost />
        
        <!-- Filtros de categoria -->
        <InstaHubFilters @update:category="selectCategory" />
        
        <!-- Indicador de carregamento -->
        <div v-if="isLoading" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01FBA1]"></div>
        </div>
        
        <!-- Mensagem de erro -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">{{ $t('instahub.error') }}</strong>
          <span class="block sm:inline"> {{ error }}</span>
        </div>
        
        <!-- Posts filtrados por categoria -->
        <div v-else class="grid grid-cols-1 gap-8">
          <div v-for="(post, index) in filteredPosts" :key="post.id" class="relative">
            <InstaHubPostCard 
              :post="post"
              @openModal="openPostModal"
              @showUserCard="showUserCard"
              @delete="handlePostDelete"
            />
            <!-- Separador entre posts (exceto no último) -->
            <div v-if="index < filteredPosts.length - 1" class="h-px w-full bg-gray-200 my-8"></div>
          </div>
        </div>
      </div>
      
      <!-- Coluna lateral (Top Properties) - ocupa 1/3 da largura em telas grandes -->
      <div class="hidden lg:block">
        <div class="bg-white p-4 rounded-lg shadow-md sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
          <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#01FBA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Top Properties of the Week
          </h2>
          
          <div v-if="isLoadingTopProperties" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01FBA1]"></div>
          </div>
          
          <div v-else-if="topWeeklyProperties.length === 0" class="py-8 text-center text-gray-500">
            <p>Nenhuma propriedade em destaque esta semana.</p>
          </div>
          
          <!-- Lista de propriedades em destaque com scroll interno -->
          <div v-else class="space-y-4 overflow-y-auto pr-2 flex-grow">
            <TopPropertyCard 
              v-for="(property, index) in topWeeklyProperties" 
              :key="property.id" 
              :property="property"
              :ranking="index + 1"
              @click="navigateToPost(property)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de post -->
    <InstaHubPostModal 
      v-if="selectedPost" 
      :post="selectedPost" 
      @close="closePostModal"
      @showUserCard="showUserCard"
    />
    
    <!-- Card de usuário -->
    <InstaHubUserCard 
      v-if="selectedUser" 
      :user="selectedUser" 
      @close="closeUserCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useInstaHubStore } from '@/stores/instaHubStore';

// Componentes
import InstaHubHeader from '@/components/InstaHub/InstaHubHeader.vue';
import InstaHubFilters from '@/components/InstaHub/InstaHubFilters.vue';
import InstaHubPostCard from '@/components/InstaHub/InstaHubPostCard.vue';
import InstaHubPostModal from '@/components/InstaHub/InstaHubPostModal.vue';
import InstaHubUserCard from '@/components/InstaHub/InstaHubUserCard.vue';
import CreateInstaHubPost from '@/components/InstaHub/CreateInstaHubPost.vue';
import TopPropertyCard from '@/components/InstaHub/TopPropertyCard.vue';

// Store e composables
const instaHubStore = useInstaHubStore();
const route = useRoute();

// Estado local
const selectedPost = ref<any>(null);
const selectedUser = ref<any>(null);
const isLoadingTopProperties = ref(true);

// Computed properties
const isLoading = computed(() => instaHubStore.isLoading);
const error = computed(() => instaHubStore.error);
const filteredPosts = computed(() => instaHubStore.filteredPosts);
const topWeeklyProperties = computed(() => instaHubStore.topWeeklyProperties);

// Métodos
function selectCategory(category: string) {
  instaHubStore.setCategory(category);
}

function openPostModal(post: any) {
  selectedPost.value = post;
}

function closePostModal() {
  selectedPost.value = null;
}

function showUserCard(user: any) {
  selectedUser.value = user;
}

function closeUserCard() {
  selectedUser.value = null;
}

function handlePostDelete(postId: string) {
  // Se o post excluído for o post selecionado no modal, feche o modal
  if (selectedPost.value && selectedPost.value.id === postId) {
    closePostModal();
  }
}

function navigateToPost(post: any) {
  // Atualizar a URL com o ID do post
  const query = { ...route.query, postId: post.id };
  
  // Usar replaceState para não adicionar uma nova entrada no histórico
  window.history.replaceState(
    {}, 
    '', 
    `${window.location.pathname}?postId=${post.id}`
  );
  
  // Abrir o modal do post
  selectedPost.value = post;
  
  // Rolar até o post no feed principal (se existir)
  setTimeout(() => {
    const postElement = document.getElementById(`post-${post.id}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Destacar o post por um momento
      postElement.classList.add('highlight-post');
      setTimeout(() => {
        postElement.classList.remove('highlight-post');
      }, 2000);
    }
  }, 300);
}

async function loadPosts() {
  await instaHubStore.fetchAllPosts();
}

// Lifecycle hooks
onMounted(async () => {
  await loadPosts();
  
  // Verificar se há um ID de post na URL para abrir automaticamente
  if (route.query.postId && instaHubStore.posts.length > 0) {
    const postId = route.query.postId as string;
    const post = instaHubStore.posts.find((p: any) => p.id === postId);
    if (post) {
      openPostModal(post);
    }
  }
  
  // Carregar as propriedades em destaque da semana
  try {
    await instaHubStore.fetchTopWeeklyProperties();
  } catch (error) {
    console.error('Erro ao carregar propriedades em destaque:', error);
  } finally {
    isLoadingTopProperties.value = false;
  }
});

// Observar mudanças na rota para verificar se há um ID de post na URL
watch(route, (newRoute) => {
  if (instaHubStore.posts.length > 0 && newRoute.query.postId) {
    const postId = newRoute.query.postId as string;
    const post = instaHubStore.posts.find((p: any) => p.id === postId);
    if (post) {
      openPostModal(post);
    }
  } else if (!newRoute.query.postId) {
    closePostModal();
  }
});
</script>

<style scoped>
.highlight-post {
  animation: pulse 2s;
  box-shadow: 0 0 0 15px rgba(1, 251, 161, 0);
  border: 2px solid #01FBA1;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(1, 251, 161, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(1, 251, 161, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(1, 251, 161, 0);
  }
}
</style>
