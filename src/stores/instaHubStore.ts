import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import instaHubService from '../services/instaHubService';
import { getAuth } from 'firebase/auth';
import { useAuthStore } from './auth';

// Interface para o upload de mídia
interface MediaUpload {
  file: File;
  type: string;
}

interface MediaFile {
  url: string;
  type: string;
  path: string;
}

// Interface para comentários
export interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: number;
}

// Interface para informações do imóvel
export interface PropertyInfo {
  address: string;
  type: string;
  status: string;
  timeOnMarket: string;
  mlsId?: string;
  price: string | number;
  features: {
    bedrooms: number;
    bathrooms: number;
    garageSpaces: number;
    squareFootage: string;
    hasPool: boolean;
    hasGarden: boolean;
    hasAirConditioning: boolean;
    hasSecurity: boolean;
  };
  hoaFees: number;
  commissionPercentage?: number;
  commission?: number;
  observations: string;
}

// Interface para posts
export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  caption: string;
  media?: string[];
  mediaFiles?: MediaFile[];
  currentMediaIndex?: number;
  likes: number;
  likedBy?: string[];
  interesseBy?: string[];
  comments: Comment[];
  createdAt: number;
  category: string;
  propertyInfo: PropertyInfo;
}

export const useInstaHubStore = defineStore('instaHub', () => {
  // Estado
  const posts = ref<Post[]>([]);
  const userPosts = ref<Post[]>([]);
  const topWeeklyProperties = ref<Post[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedCategory = ref<string>('Todos');
  
  // Categorias disponíveis
  const categories = ref([
    'Todos',
    'Imóveis à Venda',
    'Imóveis para Alugar',
    'Lançamentos',
    'Comercial',
    'Eventos'
  ]);
  
  // Getters
  const filteredPosts = computed(() => {
    if (selectedCategory.value === 'Todos') {
      return posts.value;
    }
    return posts.value.filter((post: Post) => post.category === selectedCategory.value);
  });
  
  // Actions
  
  // Carregar todos os posts
  async function fetchAllPosts() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const fetchedPosts = await instaHubService.getAllPosts();
      
      // Adicionar currentMediaIndex a cada post
      posts.value = fetchedPosts.map(post => ({
        ...post,
        currentMediaIndex: 0
      }));
      
      console.log('Posts carregados com currentMediaIndex:', posts.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar posts';
      console.error('Erro ao carregar posts:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Carregar posts de um usuário específico
  async function fetchUserPosts(userId: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const fetchedPosts = await instaHubService.getUserPosts(userId);
      
      // Adicionar currentMediaIndex a cada post
      userPosts.value = fetchedPosts.map(post => ({
        ...post,
        currentMediaIndex: 0
      }));
      
      console.log('Posts do usuário carregados com currentMediaIndex:', userPosts.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar posts do usuário';
      console.error('Erro ao carregar posts do usuário:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Buscar as 5 propriedades mais populares da semana
  async function fetchTopWeeklyProperties() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Calcular a data de uma semana atrás
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Buscar posts da última semana
      const recentPosts = await instaHubService.getRecentPosts(oneWeekAgo);
      
      // Filtrar apenas posts com propriedades
      const propertyPosts = recentPosts.filter(post => post.propertyInfo);
      
      // Ordenar por número de interessados (do maior para o menor)
      const sortedPosts = propertyPosts.sort((a, b) => {
        const aInteresse = a.interesseBy?.length || 0;
        const bInteresse = b.interesseBy?.length || 0;
        return bInteresse - aInteresse;
      });
      
      // Pegar os 5 primeiros
      topWeeklyProperties.value = sortedPosts.slice(0, 5).map(post => ({
        ...post,
        currentMediaIndex: 0
      }));
      
      console.log('Top propriedades da semana carregadas:', topWeeklyProperties.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar propriedades em destaque';
      console.error('Erro ao carregar propriedades em destaque:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Criar um novo post
  async function createPost(
    caption: string, 
    mediaFiles: MediaUpload[], 
    category: string,
    propertyInfo?: PropertyInfo,
    customAuthor?: {
      name: string;
      role: string;
    }
  ) {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Iniciando criação de post com categoria:', category);
      
      // Obter informações do usuário atual
      const authStore = useAuthStore();
      const currentUser = authStore.user;
      
      // Usar informações do usuário autenticado ou as informações fornecidas
      const author = {
        id: currentUser?.uid || authStore.userId || 'user-' + Date.now(), // Usar o ID real do usuário
        name: customAuthor?.name || currentUser?.displayName || authStore.user?.displayName || 'Usuário',
        role: customAuthor?.role || authStore.userRole || 'Corretor de Imóveis',
        avatar: currentUser?.photoURL || authStore.user?.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg'
      };
      
      console.log('Autor do post:', author);
      
      // Processar uploads de mídia
      const processedMediaFiles: MediaFile[] = [];
      
      if (mediaFiles && mediaFiles.length > 0) {
        console.log(`Processando ${mediaFiles.length} arquivos de mídia...`);
        
        for (const media of mediaFiles) {
          try {
            console.log('Fazendo upload de mídia:', media.file.name);
            const uploadedMedia = await instaHubService.uploadMedia(media.file);
            processedMediaFiles.push({
              url: uploadedMedia.url,
              type: uploadedMedia.type,
              path: uploadedMedia.path
            });
            console.log('Mídia processada com sucesso:', uploadedMedia);
          } catch (uploadError) {
            console.error('Erro ao fazer upload de mídia:', uploadError);
            throw new Error(`Erro ao processar mídia: ${uploadError instanceof Error ? uploadError.message : 'Tente novamente'}`);
          }
        }
      } else {
        console.log('Nenhum arquivo de mídia para processar');
      }
      
      // Criar o post
      const newPost: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'> = {
        author,
        caption,
        mediaFiles: processedMediaFiles,
        category,
        currentMediaIndex: 0,
        propertyInfo: {
          address: propertyInfo?.address || '',
          type: propertyInfo?.type || '',
          status: propertyInfo?.status || '',
          timeOnMarket: propertyInfo?.timeOnMarket || '',
          mlsId: propertyInfo?.mlsId || '',
          price: propertyInfo?.price || '',
          features: {
            bedrooms: propertyInfo?.features?.bedrooms || 0,
            bathrooms: propertyInfo?.features?.bathrooms || 0,
            garageSpaces: propertyInfo?.features?.garageSpaces || 0,
            squareFootage: propertyInfo?.features?.squareFootage || '',
            hasPool: propertyInfo?.features?.hasPool || false,
            hasGarden: propertyInfo?.features?.hasGarden || false,
            hasAirConditioning: propertyInfo?.features?.hasAirConditioning || false,
            hasSecurity: propertyInfo?.features?.hasSecurity || false
          },
          hoaFees: propertyInfo?.hoaFees || 0,
          commissionPercentage: propertyInfo?.commissionPercentage || 0,
          commission: propertyInfo?.commission || 0,
          observations: propertyInfo?.observations || ''
        }
      };
      
      console.log('Enviando post para o serviço:', newPost);
      
      // Salvar o post
      const postId = await instaHubService.createPost(newPost);
      console.log('Post criado com sucesso, ID:', postId);
      
      // Adicionar o post à lista
      await fetchAllPosts();
      
      return postId;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar post';
      console.error('Erro ao criar post:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Curtir/descurtir um post
  async function toggleLike(postId: string) {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar otimisticamente a UI
      const postIndex = posts.value.findIndex((p: Post) => p.id === postId);
      if (postIndex !== -1) {
        const post = posts.value[postIndex];
        const userId = currentUser.uid;
        const isLiked = post.likedBy ? post.likedBy.includes(userId) : false;
        
        if (isLiked) {
          post.likes--;
          post.likedBy = post.likedBy.filter(id => id !== userId);
        } else {
          post.likes++;
          post.likedBy = post.likedBy || [];
          post.likedBy.push(userId);
        }
      }
      
      // Fazer a atualização no servidor
      await instaHubService.toggleLike(postId, currentUser.uid);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao processar curtida';
      console.error('Erro ao processar curtida:', err);
      
      // Reverter a mudança otimista em caso de erro
      await fetchAllPosts();
    }
  }
  
  // Marcar/desmarcar interesse em um post
  async function toggleInteresse(postId: string) {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      // Atualizar otimisticamente a UI
      const postIndex = posts.value.findIndex((p: Post) => p.id === postId);
      if (postIndex !== -1) {
        const post = posts.value[postIndex];
        const userId = currentUser.uid;
        const interesseBy = post.interesseBy || [];
        const isInterested = interesseBy.includes(userId);
        if (isInterested) {
          post.interesseBy = interesseBy.filter(id => id !== userId);
        } else {
          post.interesseBy = [...interesseBy, userId];
        }
      }
      // Persistir no backend
      await instaHubService.toggleInteresse(postId, currentUser.uid);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao processar interesse';
      console.error('Erro ao processar interesse:', err);
      // Reverter a mudança otimista em caso de erro
      await fetchAllPosts();
    }
  }
  
  // Adicionar comentário a um post
  async function addComment(postId: string, text: string) {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      const comment: Omit<Comment, 'id' | 'createdAt'> = {
        author: currentUser.displayName || 'Usuário',
        authorId: currentUser.uid,
        text
      };
      
      // Atualizar otimisticamente a UI
      const postIndex = posts.value.findIndex((p: Post) => p.id === postId);
      if (postIndex !== -1) {
        const newComment = {
          ...comment,
          id: `temp-${Date.now()}`,
          createdAt: new Date()
        };
        posts.value[postIndex].comments.push(newComment);
      }
      
      // Fazer a atualização no servidor
      await instaHubService.addComment(postId, comment);
      
      // Recarregar os posts para obter o ID real do comentário
      await fetchAllPosts();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao adicionar comentário';
      console.error('Erro ao adicionar comentário:', err);
      
      // Reverter a mudança otimista em caso de erro
      await fetchAllPosts();
    }
  }
  
  // Excluir um post
  async function deletePost(postId: string) {
    try {
      await instaHubService.deletePost(postId);
      
      // Atualizar a UI
      posts.value = posts.value.filter((p: Post) => p.id !== postId);
      userPosts.value = userPosts.value.filter((p: Post) => p.id !== postId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao excluir post';
      console.error('Erro ao excluir post:', err);
    }
  }
  
  // Atualizar informações do imóvel de um post
  async function updatePostPropertyInfo(
    postId: string, 
    propertyInfo: { 
      price: number, 
      mlsId?: string,
      commissionPercentage: number 
    }
  ) {
    isLoading.value = true;
    error.value = null;
    
    try {
      await instaHubService.updatePostPropertyInfo(postId, propertyInfo);
      
      // Atualizar o post localmente
      const postIndex = posts.value.findIndex(post => post.id === postId);
      if (postIndex !== -1) {
        const commission = propertyInfo.price * (propertyInfo.commissionPercentage / 100);
        
        posts.value[postIndex].propertyInfo.price = propertyInfo.price;
        posts.value[postIndex].propertyInfo.commissionPercentage = propertyInfo.commissionPercentage;
        posts.value[postIndex].propertyInfo.commission = commission;
        
        if (propertyInfo.mlsId !== undefined) {
          posts.value[postIndex].propertyInfo.mlsId = propertyInfo.mlsId;
        }
      }
      
      // Atualizar também nos userPosts se existir
      const userPostIndex = userPosts.value.findIndex(post => post.id === postId);
      if (userPostIndex !== -1) {
        const commission = propertyInfo.price * (propertyInfo.commissionPercentage / 100);
        
        userPosts.value[userPostIndex].propertyInfo.price = propertyInfo.price;
        userPosts.value[userPostIndex].propertyInfo.commissionPercentage = propertyInfo.commissionPercentage;
        userPosts.value[userPostIndex].propertyInfo.commission = commission;
        
        if (propertyInfo.mlsId !== undefined) {
          userPosts.value[userPostIndex].propertyInfo.mlsId = propertyInfo.mlsId;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar informações do imóvel:', error);
      error.value = error instanceof Error ? error.message : 'Erro ao atualizar informações do imóvel';
    } finally {
      isLoading.value = false;
    }
  }
  
  // Definir categoria selecionada
  function setCategory(category: string) {
    selectedCategory.value = category;
  }
  
  return {
    posts,
    userPosts,
    topWeeklyProperties,
    isLoading,
    error,
    categories,
    selectedCategory,
    filteredPosts,
    fetchAllPosts,
    fetchUserPosts,
    fetchTopWeeklyProperties,
    createPost,
    toggleLike,
    toggleInteresse,
    addComment,
    deletePost,
    updatePostPropertyInfo,
    setCategory
  };
});
