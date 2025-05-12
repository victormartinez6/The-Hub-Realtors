import { ref, computed, watch, nextTick } from 'vue';
import { useInstaHubStore } from '@/stores/instaHubStore';
import { useAuthStore } from '@/stores/auth';

export function useInstaHubPosts() {
  const instaHubStore = useInstaHubStore();
  const authStore = useAuthStore();
  
  // Estado
  const isLoading = computed(() => instaHubStore.isLoading);
  const error = computed(() => instaHubStore.error);
  const selectedCategory = ref('Todos');
  const imageLoading = ref<Record<string, boolean>>({});
  const currentMediaIndices = ref<Record<string, number>>({});
  
  // Posts filtrados por categoria
  const filteredPosts = computed(() => {
    const posts = instaHubStore.posts;
    
    if (selectedCategory.value === 'Todos') {
      return posts;
    }
    
    return posts.filter(post => post.category === selectedCategory.value);
  });
  
  // Posts com índices de mídia
  const postsWithMediaIndices = computed(() => {
    return filteredPosts.value.map(post => {
      return {
        ...post,
        get currentMediaIndex() {
          if (post.id && currentMediaIndices.value[post.id] !== undefined) {
            return currentMediaIndices.value[post.id];
          }
          return 0;
        },
        set currentMediaIndex(value) {
          if (post.id) {
            currentMediaIndices.value[post.id] = value;
          }
        }
      };
    });
  });
  
  // Funções
  function selectCategory(category: string) {
    selectedCategory.value = category;
  }
  
  function handleImageLoaded(postId: string) {
    if (postId) {
      imageLoading.value[postId] = false;
    }
  }
  
  function setImageLoading(postId: string) {
    if (postId) {
      imageLoading.value[postId] = true;
    }
  }
  
  function isImageLoading(postId: string) {
    return imageLoading.value[postId] === true;
  }
  
  // Funções para navegação de imagens
  function nextImage(post: any) {
    if (post.mediaFiles && post.mediaFiles.length > 0) {
      post.currentMediaIndex = (post.currentMediaIndex + 1) % post.mediaFiles.length;
      setImageLoading(post.id);
    }
  }
  
  function previousImage(post: any) {
    if (post.mediaFiles && post.mediaFiles.length > 0) {
      post.currentMediaIndex = (post.currentMediaIndex - 1 + post.mediaFiles.length) % post.mediaFiles.length;
      setImageLoading(post.id);
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
  
  function addComment(postId: string, commentText: string) {
    if (commentText.trim() && authStore.user?.uid) {
      const authorData = {
        id: authStore.user.uid,
        name: authStore.user.displayName || 'Usuário',
        photoURL: authStore.user.photoURL || '',
        role: authStore.userData?.role || 'user'
      };
      
      instaHubStore.addComment(postId, {
        text: commentText.trim(),
        author: authorData,
        createdAt: Date.now()
      });
      
      return true;
    }
    
    return false;
  }
  
  // Pré-carregar imagens quando os posts são carregados
  watch(() => filteredPosts.value, (newPosts) => {
    if (newPosts.length > 0) {
      nextTick(() => {
        // Pré-carregar a primeira imagem de cada post
        newPosts.forEach(post => {
          if (post.id && post.mediaFiles && post.mediaFiles.length > 0) {
            // Inicializar o estado de carregamento
            imageLoading.value[post.id] = true;
            
            // Pré-carregar a primeira imagem
            const img = new Image();
            img.onload = () => {
              imageLoading.value[post.id] = false;
            };
            img.src = post.mediaFiles[0]?.url || '';
            
            // Se houver mais de uma imagem, pré-carregar a segunda também
            if (post.mediaFiles.length > 1) {
              const nextImg = new Image();
              nextImg.src = post.mediaFiles[1]?.url || '';
            }
          }
        });
      });
    }
  }, { immediate: true });
  
  // Carregar posts ao inicializar
  async function loadPosts() {
    await instaHubStore.fetchAllPosts();
  }
  
  return {
    isLoading,
    error,
    selectedCategory,
    filteredPosts: postsWithMediaIndices,
    selectCategory,
    handleImageLoaded,
    setImageLoading,
    isImageLoading,
    nextImage,
    previousImage,
    toggleLike,
    toggleInteresse,
    addComment,
    loadPosts
  };
}
