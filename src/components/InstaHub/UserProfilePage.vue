<template>
  <div class="w-full min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-2 relative">
      <!-- Botão Voltar ao Feed -->
      <div class="flex justify-center mb-6">
        <button 
          @click="$router.push('/instahub')" 
          class="bg-[#FF6A00] text-white px-6 py-3 rounded-full text-base font-medium hover:bg-[#F59975] transition-colors duration-200 focus:outline-none shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Feed
        </button>
      </div>
      <div class="max-w-3xl mx-auto">
        <!-- Botão Editar Perfil -->
        <button
          v-if="isCurrentUser"
          @click="startEditing"
          class="absolute top-4 right-4 bg-[#451A37] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#733F63] transition-colors duration-200 focus:outline-none z-10 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Editar Perfil
        </button>
        
        <!-- Informações do Perfil -->
        <UserProfileInfo 
          :userProfile="userProfile" 
          :isLoading="isLoadingProfile" 
          :error="error"
          :isEditing="isEditing"
          :editedProfile="editedProfile"
          @startEditing="startEditing"
          @cancelEditing="cancelEditing"
          @saveProfile="saveProfile"
        />
        
        <!-- Posts publicados -->
        <UserPostsList
          :posts="userPosts"
          :isLoading="isLoadingUserPosts"
          title="Posts publicados"
          emptyMessage="Nenhum post publicado ainda."
          @openPost="openPostSidebar"
        />
        
        <!-- Posts que o usuário marcou como "Tenho Interesse" -->
        <div class="mt-10">
          <UserPostsList
            v-if="isCurrentUser"
            :posts="interessePosts"
            :isLoading="isLoadingInteresse"
            title="Posts que marquei como Tenho Interesse"
            emptyMessage="Você ainda não marcou interesse em nenhum post."
            variant="interesse"
            @openPost="openPostSidebar"
            @desmarcarInteresse="desmarcarInteresse"
          />
        </div>
        
        <!-- Sidebar de Detalhes do Post -->
        <PostDetailSidebar
          v-if="showPostSidebar && selectedPost"
          :show="showPostSidebar"
          :post="selectedPost"
          @close="closePostSidebar"
          @generateTemplate="generateTemplate"
          @generateTemplateAI="generateTemplateWithAI"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useUserProfile } from '../../composables/useUserProfile';
import UserProfileInfo from './UserProfileInfo.vue';
import UserPostsList from './UserPostsList.vue';
import PostDetailSidebar from './PostDetailSidebar.vue';
import { openAIService } from '../../services/openai.service';
import emailTemplateService from '../../services/emailTemplate.service';

// Definindo interface Post
interface Post {
  id: string;
  caption?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  mediaFiles?: Array<{url: string, type?: string, path?: string}>;
  author?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
  createdAt?: any;
  likes?: number;
  comments?: any[];
  likedBy?: string[];
  tags?: string[];
  propertyInfo?: any;
  interesseBy?: string[];
}

const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();

// Obter o ID do usuário da rota
const userId = String(route.params.id);

// Usar o composable para gerenciar o perfil do usuário
const {
  userProfile,
  isLoadingProfile,
  error,
  isLoadingUserPosts,
  userPosts,
  isLoadingInteresse,
  interessePosts,
  isEditing,
  editedProfile,
  fetchUserProfile,
  fetchUserPosts,
  fetchInteressePosts,
  startEditing,
  cancelEditing,
  saveProfile,
  desmarcarInteresse
} = useUserProfile(userId);

// Verificar se o usuário atual é o dono do perfil
const isCurrentUser = computed(() => {
  return authStore.user && 
    (authStore.user.id === userId || authStore.user.uid === userId);
});

// Gerenciamento do sidebar de post
const showPostSidebar = ref(false);
const selectedPost = ref<Post | null>(null);

function openPostSidebar(post: Post) {
  selectedPost.value = post;
  showPostSidebar.value = true;
}

function closePostSidebar() {
  showPostSidebar.value = false;
  selectedPost.value = null;
}

/**
 * Função para criar um template de email marketing a partir do post
 */
function generateTemplate() {
  if (!selectedPost.value) return;
  
  // Preparar os dados do post para o template de email
  const postData = {
    id: selectedPost.value.id,
    title: selectedPost.value.caption,
    description: selectedPost.value.description,
    images: selectedPost.value.mediaFiles?.map(media => media.url) || [],
    tags: selectedPost.value.tags || [],
    propertyInfo: selectedPost.value.propertyInfo || {},
    author: selectedPost.value.author || {},
    createdAt: selectedPost.value.createdAt
  };
  
  // Armazenar os dados no localStorage para recuperá-los na página de templates
  localStorage.setItem('emailMarketingPostData', JSON.stringify(postData));
  
  // Fechar a sidebar
  closePostSidebar();
  
  // Navegar para a página de templates de email
  router.push('/admin/email-templates?mode=marketing');
}

/**
 * Função para gerar um template de email marketing usando IA
 */
async function generateTemplateWithAI() {
  if (!selectedPost.value) return;
  
  try {
    // Obter dados do perfil do usuário para cabeçalho e rodapé
    const authStore = useAuthStore();
    const userData = authStore.userData || {};
    const marketingConfig = userData.marketingConfig || {
      headerWidth: 600,
      logoUrl: '',
      headerImageUrl: '',
      primaryColor: '#451A37',
      secondaryColor: '#01FBA1'
    };
    
    // Verificar se o usuário tem imagem de header padrão configurada
    if (!marketingConfig.headerImageUrl) {
      alert('Você precisa configurar uma Imagem de Header Padrão no seu perfil antes de gerar um template.');
      router.push('/profile');
      return;
    }
    
    // Preparar os dados do post para enviar para a API
    const postData = {
      title: selectedPost.value.caption || '',
      description: selectedPost.value.description || '',
      images: selectedPost.value.mediaFiles?.map(media => media.url) || [],
      propertyInfo: selectedPost.value.propertyInfo || {},
      author: selectedPost.value.author || {},
      createdAt: selectedPost.value.createdAt
    };
    
    // Chamar o serviço OpenAI para gerar o template
    const htmlContent = await openAIService.generateEmailTemplate(postData);
    
    // Processar o conteúdo HTML para adicionar as imagens do post
    let processedHtml = htmlContent;
    
    // Substituir o marcador de imagens pelas imagens reais do post
    if (postData.images && postData.images.length > 0) {
      const imagesHtml = postData.images.map(imageUrl => {
        return `<div style="margin-bottom: 15px;">
          <img src="${imageUrl}" alt="Imagem do Imóvel" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
        </div>`;
      }).join('');
      
      processedHtml = processedHtml.replace('<!-- IMAGENS_AQUI -->', imagesHtml);
    }
    
    // Criar o template completo com cabeçalho e rodapé
    const completeHtml = `
      <!-- Cabeçalho -->
      <div style="width: 100%; max-width: 600px; margin: 0 auto;">
        <img src="${marketingConfig.headerImageUrl}" alt="Header" style="width: 100%; max-width: 600px; height: auto;">
      </div>
      
      <!-- Corpo -->
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${processedHtml}
      </div>
      
      <!-- Rodapé -->
      <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; text-align: center;">
        <div style="margin-bottom: 10px;">
          ${marketingConfig.logoUrl ? `<img src="${marketingConfig.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;">` : ''}
        </div>
        <div style="color: #666; font-size: 12px;">
          <p>${userData.displayName || 'The Hub Realtors'}</p>
          <p>${userData.email || ''}</p>
          <p>${userData.phoneNumber || ''}</p>
          ${userData.website ? `<p><a href="${userData.website.startsWith('http') ? userData.website : 'https://' + userData.website}" style="color: #451A37;">${userData.website}</a></p>` : ''}
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.
        </div>
      </div>
    `;
    
    // Criar um novo template com o HTML gerado
    const template = {
      name: `Email Marketing IA - ${postData.title}`,
      description: 'Template gerado automaticamente com IA a partir de um post do InstaHub',
      components: [
        {
          type: 'html',
          content: completeHtml,
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333'
          }
        }
      ]
    };
    
    // Salvar o template
    await emailTemplateService.createTemplate(template);
    
    // Fechar a sidebar
    closePostSidebar();
    
    // Redirecionar para a página de templates
    router.push('/admin/email-templates');
    
  } catch (error: any) {
    console.error('Erro ao gerar template com IA:', error);
    alert(`Erro ao gerar template com IA: ${error.message || 'Tente novamente mais tarde'}`);
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  fetchUserProfile();
  fetchUserPosts();
  if (isCurrentUser.value) {
    fetchInteressePosts();
  }
});
</script>
