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
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#451A37]"></div>
        </div>
        
        <!-- Mensagem de erro -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong class="font-bold">{{ t('instahub.error') }}</strong>
          <span class="block sm:inline"> {{ error }}</span>
        </div>
        
        <!-- Posts filtrados por categoria -->
        <div v-else class="grid grid-cols-1 gap-8">
          <div v-for="(post, index) in filteredPosts" :key="post?.id || index" class="relative">
            <InstaHubPostCard 
              v-if="post"
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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#451A37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Top Properties of the Week
          </h2>
          
          <div v-if="isLoadingTopProperties" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#451A37]"></div>
          </div>
          
          <div v-else-if="!topWeeklyProperties || topWeeklyProperties.length === 0" class="py-8 text-center text-gray-500">
            <p>Nenhuma propriedade em destaque esta semana.</p>
          </div>
          
          <!-- Lista de propriedades em destaque com scroll interno -->
          <div v-else class="space-y-4 overflow-y-auto pr-2 flex-grow">
            <TopPropertyCard 
              v-for="(property, index) in topWeeklyProperties" 
              :key="property?.id || index" 
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
import { useI18n } from 'vue-i18n';
import { useConfigService } from './services/configService';

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
const { t } = useI18n();
const { timelineSettings, relevanceAlgorithm } = useConfigService();

// Estado local
const selectedPost = ref<any>(null);
const selectedUser = ref<any>(null);
const isLoadingTopProperties = ref(true);

// Computed properties
const isLoading = computed(() => instaHubStore.isLoading);
const error = computed(() => instaHubStore.error);
const filteredPosts = computed(() => {
  // Verificar se os posts existem
  if (!instaHubStore.posts || !Array.isArray(instaHubStore.posts)) {
    return [];
  }
  
  // Aplicar configurações de idade máxima aos posts filtrados
  const maxAgeDate = new Date();
  maxAgeDate.setDate(maxAgeDate.getDate() - timelineSettings.value.maxPostAge);
  
  // Filtrar por categoria e idade
  let filteredByCategory = instaHubStore.posts;
  
  // Aplicar filtro de categoria se não for "Todos"
  if (instaHubStore.selectedCategory !== 'Todos') {
    filteredByCategory = instaHubStore.posts.filter((post: any) => post && post.category === instaHubStore.selectedCategory);
  }
  
  // Função auxiliar para obter a data de um post de forma segura
  const getPostDate = (post: any): number => {
    if (!post || !post.createdAt) return 0;
    
    try {
      // Se for um Timestamp do Firestore
      if (post.createdAt.toDate && typeof post.createdAt.toDate === 'function') {
        return post.createdAt.toDate().getTime();
      }
      // Se já for um objeto Date
      else if (post.createdAt instanceof Date) {
        return post.createdAt.getTime();
      }
      // Se for um número (timestamp)
      else if (typeof post.createdAt === 'number') {
        return post.createdAt;
      }
      // Se for uma string de data
      else if (typeof post.createdAt === 'string') {
        return new Date(post.createdAt).getTime();
      }
    } catch (error) {
      console.error('Erro ao processar data do post:', error);
    }
    
    return 0;
  };
  
  // Filtrar por idade máxima
  const filteredByAge = filteredByCategory.filter((post: any) => {
    if (!post || !post.createdAt) return false;
    
    const postDate = getPostDate(post);
    return postDate >= maxAgeDate.getTime();
  });

  // Verificar se a ordem selecionada é "relevantes"
  if (timelineSettings.value.defaultOrder === 'relevant' && relevanceAlgorithm.value) {
    // Ordenar por relevância usando o algoritmo configurado
    return sortByRelevance(filteredByAge);
  } else if (timelineSettings.value.defaultOrder === 'popular') {
    // Ordenar por popularidade (número de likes + comentários)
    return [...filteredByAge].sort((a, b) => {
      const aEngagement = (a.likes?.length || 0) + (a.comments?.length || 0);
      const bEngagement = (b.likes?.length || 0) + (b.comments?.length || 0);
      return bEngagement - aEngagement;
    });
  } else {
    // Ordenar por data (mais recentes primeiro - padrão)
    return [...filteredByAge].sort((a, b) => {
      const aDate = getPostDate(a);
      const bDate = getPostDate(b);
      return bDate - aDate;
    });
  }
});

// Função para calcular a pontuação de relevância de um post
function sortByRelevance(posts: any[]) {
  const { newnessFactor, engagementFactor, qualityFactor, matchFactor } = relevanceAlgorithm.value;
  
  // Função para calcular a pontuação de novidade (0-100)
  const calculateNewnessScore = (post: any) => {
    if (!post.createdAt) return 0;
    
    let postDate;
    if (post.createdAt.toDate && typeof post.createdAt.toDate === 'function') {
      postDate = post.createdAt.toDate();
    } else if (post.createdAt instanceof Date) {
      postDate = post.createdAt;
    } else if (typeof post.createdAt === 'string') {
      postDate = new Date(post.createdAt);
    } else {
      return 0;
    }
    
    // Calcular a idade do post em dias
    const now = new Date();
    const ageInDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Pontuação de novidade: quanto mais recente, maior a pontuação
    // Máximo de 100 pontos para posts de hoje, diminuindo linearmente até 0 para posts com maxPostAge dias
    return Math.max(0, 100 - (ageInDays * 100 / timelineSettings.value.maxPostAge));
  };
  
  // Função para calcular a pontuação de engajamento (0-100)
  const calculateEngagementScore = (post: any) => {
    // Considerar likes e comentários
    const likesCount = post.likes?.length || 0;
    const commentsCount = post.comments?.length || 0;
    const totalEngagement = likesCount + commentsCount;
    
    // Encontrar o post com maior engajamento para normalizar
    const maxEngagement = Math.max(...posts.map(p => (p.likes?.length || 0) + (p.comments?.length || 0)));
    
    // Normalizar para uma escala de 0-100
    return maxEngagement > 0 ? (totalEngagement / maxEngagement) * 100 : 0;
  };
  
  // Função para calcular a pontuação de qualidade (0-100)
  const calculateQualityScore = (post: any) => {
    let score = 0;
    
    // Verificar se tem descrição completa
    if (post.description && post.description.length > 50) {
      score += 25;
    }
    
    // Verificar se tem múltiplas imagens
    if (post.images && post.images.length > 1) {
      score += 25 * Math.min(post.images.length / 3, 1); // Máximo de 25 pontos para 3+ imagens
    }
    
    // Verificar se tem informações de propriedade completas (para posts de imóveis)
    if (post.category === 'properties') {
      const propertyFields = ['price', 'location', 'bedrooms', 'bathrooms', 'squareFootage'];
      const completedFields = propertyFields.filter(field => post[field]);
      score += 50 * (completedFields.length / propertyFields.length);
    } else {
      // Para outros tipos de posts, considerar apenas descrição e imagens
      score += 50;
    }
    
    return score;
  };
  
  // Função para calcular a pontuação de correspondência (0-100)
  // Aqui seria ideal ter os interesses do usuário, mas como exemplo usaremos a categoria selecionada
  const calculateMatchScore = (post: any) => {
    // Se a categoria selecionada for "all", todos os posts têm 100% de correspondência
    if (instaHubStore.selectedCategory === 'all') {
      return 100;
    }
    
    // Se a categoria do post corresponder à categoria selecionada, 100% de correspondência
    if (post.category === instaHubStore.selectedCategory) {
      return 100;
    }
    
    // Caso contrário, 0% de correspondência
    return 0;
  };
  
  // Calcular a pontuação total para cada post
  return [...posts].sort((a, b) => {
    const aScore = (
      (calculateNewnessScore(a) * newnessFactor / 100) +
      (calculateEngagementScore(a) * engagementFactor / 100) +
      (calculateQualityScore(a) * qualityFactor / 100) +
      (calculateMatchScore(a) * matchFactor / 100)
    );
    
    const bScore = (
      (calculateNewnessScore(b) * newnessFactor / 100) +
      (calculateEngagementScore(b) * engagementFactor / 100) +
      (calculateQualityScore(b) * qualityFactor / 100) +
      (calculateMatchScore(b) * matchFactor / 100)
    );
    
    // Ordenar por pontuação decrescente
    return bScore - aScore;
  });
}

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
  // Verificar se o post é válido
  if (!post || !post.id) {
    console.error('Tentativa de navegar para um post inválido:', post);
    return;
  }

  try {
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
  } catch (error) {
    console.error('Erro ao navegar para o post:', error);
  }
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
    const post = instaHubStore.posts.find((p: any) => p && p.id === postId);
    if (post) {
      openPostModal(post);
    }
  }
  
  // Carregar as propriedades em destaque da semana
  try {
    await instaHubStore.fetchTopWeeklyProperties();
  } catch (error) {
    console.error('Erro ao carregar propriedades em destaque:', error);
    // Garantir que topWeeklyProperties seja inicializado mesmo em caso de erro
    if (!instaHubStore.topWeeklyProperties || !Array.isArray(instaHubStore.topWeeklyProperties)) {
      instaHubStore.topWeeklyProperties = [];
    }
  } finally {
    isLoadingTopProperties.value = false;
  }
});

// Observar mudanças na rota para verificar se há um ID de post na URL
watch(route, (newRoute) => {
  if (instaHubStore.posts.length > 0 && newRoute.query.postId) {
    const postId = newRoute.query.postId as string;
    const post = instaHubStore.posts.find((p: any) => p && p.id === postId);
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
  box-shadow: 0 0 0 15px rgba(69, 26, 55, 0);
  border: 2px solid #451A37;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(69, 26, 55, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(69, 26, 55, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(69, 26, 55, 0);
  }
}
</style>
