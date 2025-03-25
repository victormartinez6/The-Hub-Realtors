<template>
  <div class="container mx-auto py-8 px-4 relative">
    <!-- Botão Voltar ao Feed (estilo mais visível) -->
    <div class="flex justify-center mb-6">
      <button 
        @click="$router.push('/instahub')" 
        class="bg-[#01FBA1] text-[#012928] px-6 py-3 rounded-full text-base font-medium hover:bg-[#01FBA1]/90 transition-colors duration-200 focus:outline-none shadow-lg flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar ao Feed
      </button>
    </div>
    
    <div class="max-w-3xl mx-auto">
      <!-- Perfil do Usuário -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div class="p-6">
          <div class="flex items-start">
            <!-- Removido o botão Voltar daqui -->
            
            <!-- Botão Editar -->
            <button 
              v-if="!isEditing && isCurrentUserProfile"
              @click="startEditing" 
              class="absolute top-4 right-4 bg-[#01FBA1] text-[#012928] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#01FBA1]/90 transition-colors duration-200 focus:outline-none"
            >
              Editar Perfil
            </button>
            
            <!-- Foto de Perfil -->
            <div class="mr-6 relative">
              <img 
                v-if="!isEditing"
                :src="userProfile.avatar" 
                alt="Foto de Perfil" 
                class="w-24 h-24 rounded-full object-cover border-4 border-[#01FBA1]"
              />
              <div v-else class="relative">
                <img 
                  :src="editedProfile.avatar" 
                  alt="Foto de Perfil" 
                  class="w-24 h-24 rounded-full object-cover border-4 border-[#01FBA1]"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <label for="avatar-upload" class="cursor-pointer text-white text-xs font-medium p-2 rounded-full hover:bg-[#01FBA1] hover:text-[#012928] transition-colors duration-200">
                    Alterar Foto
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      class="hidden" 
                      @change="handleAvatarChange"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Informações do Perfil -->
            <div class="flex-1">
              <!-- Modo de Visualização -->
              <div v-if="!isEditing">
                <h1 class="text-2xl font-bold text-gray-800 mb-1">{{ userProfile.name }}</h1>
                <p class="text-sm text-gray-500 mb-3">{{ userProfile.role }}</p>
                
                <!-- Estatísticas -->
                <div class="flex items-center space-x-6 mb-4">
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-gray-800">{{ userPosts.length }}</span>
                    <span class="text-xs text-gray-500">Posts</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-gray-800">{{ userProfile.properties }}</span>
                    <span class="text-xs text-gray-500">Imóveis</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <span class="font-bold text-gray-800">{{ userProfile.clients }}</span>
                    <span class="text-xs text-gray-500">Clientes</span>
                  </div>
                </div>
                
                <!-- Biografia -->
                <p class="text-gray-700">{{ userProfile.bio }}</p>
              </div>
              
              <!-- Modo de Edição -->
              <div v-else class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input 
                    id="name" 
                    v-model="editedProfile.name" 
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                  />
                </div>
                
                <div>
                  <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Função</label>
                  <select 
                    id="role" 
                    v-model="editedProfile.role" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                  >
                    <option value="Realtor">Corretor</option>
                    <option value="Broker">Broker</option>
                    <option value="Partner">Parceiro</option>
                  </select>
                </div>
                
                <div>
                  <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Biografia</label>
                  <textarea 
                    id="bio" 
                    v-model="editedProfile.bio" 
                    rows="4" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                    placeholder="Conte um pouco sobre você, sua experiência e especialidades..."
                  ></textarea>
                </div>
                
                <div>
                  <label for="properties" class="block text-sm font-medium text-gray-700 mb-1">Número de Imóveis</label>
                  <input 
                    id="properties" 
                    v-model.number="editedProfile.properties" 
                    type="number" 
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                  />
                </div>
                
                <div>
                  <label for="clients" class="block text-sm font-medium text-gray-700 mb-1">Número de Clientes</label>
                  <input 
                    id="clients" 
                    v-model.number="editedProfile.clients" 
                    type="number" 
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                  />
                </div>
                
                <div class="flex space-x-3 pt-2">
                  <button 
                    @click="saveProfile" 
                    class="bg-[#01FBA1] text-[#012928] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#01FBA1]/90 transition-colors duration-200 focus:outline-none"
                    :disabled="isSaving"
                  >
                    <span v-if="isSaving" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#012928]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </span>
                    <span v-else>Salvar Alterações</span>
                  </button>
                  <button 
                    @click="cancelEditing" 
                    class="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Posts do Usuário -->
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Posts de {{ userProfile.name }}</h2>
      
      <div v-if="userPosts.length === 0" class="bg-white rounded-xl shadow-md p-6 text-center">
        <p class="text-gray-500">Este usuário ainda não fez nenhum post.</p>
      </div>
      
      <!-- Lista de Posts -->
      <div class="grid grid-cols-1 gap-8">
        <div 
          v-for="post in userPosts" 
          :key="post.id" 
          class="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <!-- Cabeçalho do Post -->
          <div class="p-4 flex items-center space-x-3">
            <img :src="post.author.avatar" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
            <div>
              <h3 class="font-semibold text-gray-800">{{ post.author.name }}</h3>
              <p class="text-xs text-gray-500">{{ post.author.role }}</p>
            </div>
            <div class="ml-auto">
              <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{{ post.category }}</span>
            </div>
          </div>
          
          <!-- Imagem do Post -->
          <img :src="post.imageUrl" alt="Post" class="w-full h-80 object-cover">
          
          <!-- Ações do Post -->
          <div class="p-4">
            <div class="flex items-center space-x-4 mb-3">
              <button 
                @click="toggleLike(post)" 
                class="flex items-center space-x-1 focus:outline-none"
                :class="{ 'text-red-500': post.isLiked, 'text-gray-500': !post.isLiked }"
                :disabled="post.isLikeLoading"
              >
                <div v-if="post.isLikeLoading" class="animate-spin h-5 w-5 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :fill="post.isLiked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{{ post.likes }} curtidas</span>
              </button>
              
              <button class="flex items-center space-x-1 text-gray-500 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ post.comments.length }} comentários</span>
              </button>
            </div>
            
            <!-- Legenda do Post -->
            <p class="text-gray-800 mb-4">{{ post.caption }}</p>
            
            <!-- Comentários -->
            <div class="space-y-3 mb-4">
              <div v-for="(comment, index) in post.comments" :key="index" class="flex space-x-2">
                <span class="font-semibold text-gray-800">{{ comment.author }}:</span>
                <p class="text-gray-700">{{ comment.text }}</p>
              </div>
            </div>
            
            <!-- Formulário de Comentário -->
            <div class="flex items-center space-x-2 border-t pt-3">
              <input 
                v-model="post.newComment" 
                type="text" 
                placeholder="Adicione um comentário..." 
                class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                :disabled="post.isCommentLoading"
                @keyup.enter="addComment(post)"
              >
              <button 
                @click="addComment(post)" 
                class="bg-[#01FBA1] text-[#012928] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#01FBA1]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="post.isCommentLoading || !post.newComment.trim()"
              >
                <span v-if="post.isCommentLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#012928]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
                <span v-else>Enviar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// ID do usuário atual (constante conforme solicitado)
const currentUserId = 'user-123';
const currentUserName = 'Você';

// Rota para obter o ID do usuário
const route = useRoute();
const userId = ref(route.params.id as string);

// Definição de tipos
interface Comment {
  id?: string;
  author: string;
  text: string;
  authorId?: string;
  createdAt?: string;
}

interface Author {
  name: string;
  role: string;
  avatar: string;
  id: string;
}

interface Post {
  id: number;
  author: Author;
  imageUrl: string;
  caption: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  newComment: string;
  isLikeLoading?: boolean;
  isCommentLoading?: boolean;
  category: string;
}

interface UserProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  properties: number;
  clients: number;
}

// API fictícia para interações com o backend
const api = {
  likePost: async (postId: number, userId: string): Promise<{ success: boolean }> => {
    // Simular uma chamada de API com um atraso
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Usuário ${userId} curtiu o post ${postId}`);
    return { success: true };
  },
  
  unlikePost: async (postId: number, userId: string): Promise<{ success: boolean }> => {
    // Simular uma chamada de API com um atraso
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Usuário ${userId} descurtiu o post ${postId}`);
    return { success: true };
  },
  
  addComment: async (postId: number, userId: string, text: string): Promise<{ success: boolean, commentId: string }> => {
    // Simular uma chamada de API com um atraso
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log(`Usuário ${userId} comentou no post ${postId}: ${text}`);
    return { 
      success: true, 
      commentId: `comment-${Date.now()}`
    };
  },
  
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    // Simular uma chamada de API com um atraso
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Perfis mockados
    const profiles: Record<string, UserProfile> = {
      'user-456': {
        id: 'user-456',
        name: 'Ana Silva',
        role: 'Realtor',
        avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
        bio: 'Especialista em imóveis residenciais de alto padrão com mais de 5 anos de experiência no mercado imobiliário. Comprometida em encontrar o lar perfeito para cada cliente.',
        properties: 24,
        clients: 18
      },
      'user-202': {
        id: 'user-202',
        name: 'Roberto Oliveira',
        role: 'Broker',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'Broker com 10 anos de experiência, especializado em imóveis comerciais e investimentos. Líder de equipe dedicado a oferecer o melhor serviço aos clientes.',
        properties: 42,
        clients: 35
      },
      'user-606': {
        id: 'user-606',
        name: 'Luciana Santos',
        role: 'Realtor',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        bio: 'Corretora apaixonada por ajudar famílias a encontrarem seu lar ideal. Especializada em imóveis para primeira compra e investimentos.',
        properties: 16,
        clients: 12
      },
      'user-909': {
        id: 'user-909',
        name: 'Paulo Mendes',
        role: 'Broker',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        bio: 'Especialista em locação de imóveis de luxo e gestão de propriedades. Atendimento personalizado e focado nas necessidades do cliente.',
        properties: 31,
        clients: 27
      },
      'user-1212': {
        id: 'user-1212',
        name: 'Carla Rodrigues',
        role: 'Realtor',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        bio: 'Especialista em imóveis comerciais e consultoria para empresas. Formada em administração com foco em gestão imobiliária.',
        properties: 19,
        clients: 15
      }
    };
    
    return profiles[userId] || {
      id: userId,
      name: 'Usuário não encontrado',
      role: 'Desconhecido',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Informações não disponíveis',
      properties: 0,
      clients: 0
    };
  }
};

// Dados mockados para os posts
const allPosts = ref<Post[]>([
  {
    id: 1,
    author: {
      name: 'Ana Silva',
      role: 'Realtor',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      id: 'user-456'
    },
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1475&q=80',
    caption: 'Acabei de listar esta linda casa de 4 quartos no coração da cidade! Entre em contato para mais informações. #ImóvelDeSonho #NovoLançamento',
    likes: 42,
    isLiked: false,
    comments: [
      { id: 'comment-1', author: 'Carlos Mendes', text: 'Incrível! Quando podemos agendar uma visita?', authorId: 'user-789' },
      { id: 'comment-2', author: 'Mariana Costa', text: 'Adorei a arquitetura! Qual o valor?', authorId: 'user-101' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Imóveis à Venda'
  },
  {
    id: 2,
    author: {
      name: 'Roberto Oliveira',
      role: 'Broker',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      id: 'user-202'
    },
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Celebrando mais uma venda bem-sucedida! Parabéns à família Rodrigues pela nova casa. É sempre um prazer ajudar nossos clientes a encontrarem o lar perfeito. #MissãoCumprida #NovoLar',
    likes: 78,
    isLiked: true,
    comments: [
      { id: 'comment-3', author: 'Juliana Martins', text: 'Parabéns pelo excelente trabalho!', authorId: 'user-303' },
      { id: 'comment-4', author: 'Pedro Alves', text: 'Vocês são os melhores do mercado!', authorId: 'user-404' },
      { id: 'comment-5', author: 'Fernanda Lima', text: 'Quero comprar meu apartamento com vocês também!', authorId: 'user-505' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Imóveis à Venda'
  },
  {
    id: 3,
    author: {
      name: 'Luciana Santos',
      role: 'Realtor',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      id: 'user-606'
    },
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Participando do workshop de tendências imobiliárias 2023! Sempre em busca de conhecimento para oferecer o melhor serviço aos nossos clientes. #EducaçãoContinuada #MercadoImobiliário',
    likes: 35,
    isLiked: false,
    comments: [
      { id: 'comment-6', author: 'Rafael Gomes', text: 'Compartilhe as novidades com a gente depois!', authorId: 'user-707' },
      { id: 'comment-7', author: 'Camila Ferreira', text: 'Que legal! Quais são as tendências para este ano?', authorId: 'user-808' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Lançamentos'
  },
  {
    id: 4,
    author: {
      name: 'Paulo Mendes',
      role: 'Broker',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      id: 'user-909'
    },
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Apartamento de luxo disponível para aluguel no centro da cidade. 3 quartos, 2 banheiros, varanda gourmet e vista panorâmica. Agende uma visita! #ImóvelPremium #AluguelDeLuxo',
    likes: 56,
    isLiked: false,
    comments: [
      { id: 'comment-8', author: 'Tatiana Ferreira', text: 'Qual o valor do aluguel?', authorId: 'user-1010' },
      { id: 'comment-9', author: 'Bruno Costa', text: 'Aceita pets?', authorId: 'user-1111' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Imóveis para Alugar'
  },
  {
    id: 5,
    author: {
      name: 'Carla Rodrigues',
      role: 'Realtor',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      id: 'user-1212'
    },
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
    caption: 'Nova sala comercial disponível no Business Center. Localização privilegiada, infraestrutura completa e pronta para uso. Ideal para escritórios e consultórios. #ImóvelComercial #BusinessCenter',
    likes: 28,
    isLiked: false,
    comments: [
      { id: 'comment-10', author: 'Ricardo Almeida', text: 'Qual a metragem da sala?', authorId: 'user-1313' },
      { id: 'comment-11', author: 'Sandra Vieira', text: 'Tem estacionamento?', authorId: 'user-1414' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Comercial'
  },
  {
    id: 6,
    author: {
      name: 'Ana Silva',
      role: 'Realtor',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      id: 'user-456'
    },
    imageUrl: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Condomínio com excelente área de lazer! Piscina, academia, playground e muito mais. Apartamentos de 2 e 3 quartos disponíveis. #NovoEmpreendimento #MorarBem',
    likes: 63,
    isLiked: false,
    comments: [
      { id: 'comment-12', author: 'João Paulo', text: 'Tem unidades com varanda?', authorId: 'user-1515' },
      { id: 'comment-13', author: 'Luiza Melo', text: 'Qual o valor do condomínio?', authorId: 'user-1616' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Lançamentos'
  },
  {
    id: 7,
    author: {
      name: 'Roberto Oliveira',
      role: 'Broker',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      id: 'user-202'
    },
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Excelente oportunidade de investimento! Conjunto de salas comerciais em prédio novo, localização central e alta valorização. #InvestimentoImobiliário #SalasComerciais',
    likes: 45,
    isLiked: false,
    comments: [
      { id: 'comment-14', author: 'Marcelo Santos', text: 'Qual a rentabilidade estimada?', authorId: 'user-1717' },
      { id: 'comment-15', author: 'Cláudia Ferreira', text: 'Tem financiamento direto?', authorId: 'user-1818' }
    ],
    newComment: '',
    isLikeLoading: false,
    isCommentLoading: false,
    category: 'Comercial'
  }
]);

// Perfil do usuário
const userProfile = ref<UserProfile>({
  id: '',
  name: 'Carregando...',
  role: '',
  avatar: 'https://via.placeholder.com/150',
  bio: '',
  properties: 0,
  clients: 0
});

// Posts do usuário
const userPosts = computed(() => {
  return allPosts.value.filter(post => post.author.id === userId.value);
});

// Estado de edição do perfil
const isEditing = ref(false);
const editedProfile = ref<UserProfile>({
  id: '',
  name: '',
  role: '',
  avatar: '',
  bio: '',
  properties: 0,
  clients: 0
});
const isSaving = ref(false);

// Verificar se é o perfil do usuário atual
const isCurrentUserProfile = computed(() => {
  return userId.value === currentUserId;
});

// Iniciar edição do perfil
const startEditing = () => {
  isEditing.value = true;
  editedProfile.value = { ...userProfile.value };
};

// Cancelar edição do perfil
const cancelEditing = () => {
  isEditing.value = false;
};

// Salvar alterações do perfil
const saveProfile = async () => {
  if (isSaving.value) return;
  
  isSaving.value = true;
  
  try {
    // Simular uma chamada de API para atualizar o perfil
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Atualizar o perfil
    userProfile.value = editedProfile.value;
    
    // Finalizar edição
    isEditing.value = false;
  } catch (error) {
    console.error('Erro ao salvar alterações do perfil:', error);
  } finally {
    isSaving.value = false;
  }
};

// Lidar com a alteração da foto de perfil
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      editedProfile.value.avatar = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Carregar dados ao montar o componente
onMounted(() => {
  // Carregar perfil do usuário
  const loadUserProfile = async () => {
    try {
      userProfile.value = await api.getUserProfile(userId.value);
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };
  loadUserProfile();
});

// Função para curtir/descurtir um post
const toggleLike = async (post: Post): Promise<void> => {
  if (post.isLikeLoading) return;
  
  // Atualização otimista (imediata)
  const wasLiked = post.isLiked;
  post.isLiked = !wasLiked;
  post.likes += wasLiked ? -1 : 1;
  
  // Indicar que está carregando
  post.isLikeLoading = true;
  
  try {
    // Chamar API
    const response = wasLiked 
      ? await api.unlikePost(post.id, currentUserId)
      : await api.likePost(post.id, currentUserId);
      
    if (!response.success) {
      // Reverter em caso de falha
      post.isLiked = wasLiked;
      post.likes += wasLiked ? 1 : -1;
      console.error('Falha ao processar curtida');
    }
  } catch (error) {
    // Reverter em caso de erro
    post.isLiked = wasLiked;
    post.likes += wasLiked ? 1 : -1;
    console.error('Erro ao processar curtida:', error);
  } finally {
    // Finalizar carregamento
    post.isLikeLoading = false;
  }
};

// Função para adicionar um comentário
const addComment = async (post: Post): Promise<void> => {
  if (post.isCommentLoading || !post.newComment.trim()) return;
  
  const commentText = post.newComment.trim();
  post.isCommentLoading = true;
  
  try {
    // Chamar API
    const response = await api.addComment(post.id, currentUserId, commentText);
    
    if (response.success) {
      // Adicionar comentário à lista
      post.comments.push({
        id: response.commentId,
        author: currentUserName,
        text: commentText,
        authorId: currentUserId,
        createdAt: new Date().toISOString()
      });
      
      // Limpar campo de comentário
      post.newComment = '';
    } else {
      console.error('Falha ao adicionar comentário');
    }
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
  } finally {
    post.isCommentLoading = false;
  }
};
</script>

<style scoped>
/* Estilo para o scroll horizontal dos filtros em telas menores */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}
.overflow-x-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}
</style>
