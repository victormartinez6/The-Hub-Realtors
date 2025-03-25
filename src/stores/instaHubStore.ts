import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import instaHubService, { Post, MediaFile, Comment } from '../services/instaHubService';
import { getAuth } from 'firebase/auth';

export const useInstaHubStore = defineStore('instaHub', () => {
  // Estado
  const posts = ref<Post[]>([]);
  const userPosts = ref<Post[]>([]);
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
      posts.value = await instaHubService.getAllPosts();
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
      userPosts.value = await instaHubService.getUserPosts(userId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar posts do usuário';
      console.error('Erro ao carregar posts do usuário:', err);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Criar um novo post
  async function createPost(caption: string, mediaFiles: MediaFile[], category: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      // Obter informações do usuário atual
      // Normalmente, você teria um perfil de usuário mais completo
      // Aqui estamos usando informações básicas do Firebase Auth
      const author = {
        id: currentUser.uid,
        name: currentUser.displayName || 'Usuário',
        role: 'Corretor', // Isso seria obtido do perfil do usuário
        avatar: currentUser.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
      };
      
      // Criar o post
      const postId = await instaHubService.createPost({
        author,
        caption,
        mediaFiles,
        comments: [],
        category
      });
      
      // Recarregar os posts
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
        const isLiked = post.likedBy.includes(userId);
        
        if (isLiked) {
          post.likes--;
          post.likedBy = post.likedBy.filter((id: string) => id !== userId);
        } else {
          post.likes++;
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
  
  // Definir categoria selecionada
  function setCategory(category: string) {
    selectedCategory.value = category;
  }
  
  return {
    posts,
    userPosts,
    isLoading,
    error,
    categories,
    selectedCategory,
    filteredPosts,
    fetchAllPosts,
    fetchUserPosts,
    createPost,
    toggleLike,
    addComment,
    deletePost,
    setCategory
  };
});
