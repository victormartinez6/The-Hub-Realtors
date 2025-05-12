import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useInstaHubModal() {
  // Estado
  const showModal = ref(false);
  const selectedPost = ref<any>(null);
  const activeTab = ref('details');
  const router = useRouter();
  
  // Funções
  function openPostModal(post: any, tab: string = 'details') {
    selectedPost.value = { ...post };
    activeTab.value = tab;
    showModal.value = true;
  }
  
  function closePostModal() {
    showModal.value = false;
  }
  
  function goToPostInFeed(postId: string) {
    if (postId) {
      router.push({ 
        path: '/instahub',
        query: { postId }
      });
      closePostModal();
    }
  }
  
  // Verificar se há um ID de post na URL para abrir automaticamente
  function checkUrlForPostId(posts: any[]) {
    const route = router.currentRoute.value;
    if (route.query.postId) {
      const postId = route.query.postId as string;
      const post = posts.find(p => p.id === postId);
      if (post) {
        openPostModal(post);
      }
    }
  }
  
  return {
    showModal,
    selectedPost,
    activeTab,
    openPostModal,
    closePostModal,
    goToPostInFeed,
    checkUrlForPostId
  };
}
