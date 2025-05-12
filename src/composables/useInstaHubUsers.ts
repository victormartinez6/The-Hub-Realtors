import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function useInstaHubUsers() {
  const authStore = useAuthStore();
  const router = useRouter();
  
  // Estado
  const showingUserCard = ref(false);
  const selectedUser = ref<any>(null);
  
  // Funções
  function showUserCard(user: any) {
    // Se for o próprio usuário, redirecionar para o perfil
    if (user.id === authStore.user?.uid || user.id === authStore.user?.id) {
      router.push(`/instahub/profile/${user.id}`);
      return;
    }
    
    // Caso contrário, mostrar o cartão de visitas
    selectedUser.value = user;
    showingUserCard.value = true;
  }
  
  function closeUserCard() {
    showingUserCard.value = false;
  }
  
  // Função para sanitizar URLs
  function sanitizeUrl(url?: any): string {
    if (!url) {
      // Se não houver URL, usar o avatar do usuário autenticado
      return authStore.user?.photoURL || '';
    }
    
    // Verificar se url é um objeto com propriedade url (caso de mediaFiles)
    if (typeof url === 'object' && url !== null) {
      if (url.url && typeof url.url === 'string') {
        return url.url;
      }
      return '';
    }
    
    // Verificar se url é uma string antes de chamar startsWith
    if (typeof url !== 'string') {
      return '';
    }
    
    // Se for uma URL relativa começando com @/, converter para caminho absoluto
    if (url.startsWith('@/')) {
      // Remover o @/ e usar o caminho relativo à raiz do projeto
      return url.replace('@/', '/');
    }
    
    return url;
  }
  
  // Função para lidar com erro de imagem
  function handleImageError(event: Event) {
    // Quando ocorrer um erro de imagem, usar o avatar do usuário autenticado
    const target = event.target as HTMLImageElement;
    if (authStore.user?.photoURL) {
      target.src = authStore.user.photoURL;
    } else {
      // Se não houver avatar do usuário, deixar vazio (não mostrar imagem)
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
  
  return {
    showingUserCard,
    selectedUser,
    showUserCard,
    closeUserCard,
    sanitizeUrl,
    handleImageError,
    formatDate
  };
}
