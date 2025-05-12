import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import { navigationConfig as originalNavigationConfig } from '../config/navigation';

// Tipos
export interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
  translationKey?: string;
  description?: string;
  roles?: string[];
  children?: NavigationItem[];
}

// Estado do serviço
const menuConfig: Ref<NavigationItem[]> = ref([]);
const isLoaded = ref(false);
const isLoading = ref(false);

/**
 * Serviço para gerenciar permissões de menu
 */
export const menuPermissionsService = {
  /**
   * Carrega as configurações de menu do Firestore
   */
  async loadMenuConfig(): Promise<void> {
    if (isLoaded.value) return;
    
    isLoading.value = true;
    
    try {
      const menuConfigRef = doc(db, 'appConfig', 'menuPermissions');
      const menuConfigDoc = await getDoc(menuConfigRef);
      
      if (menuConfigDoc.exists()) {
        const data = menuConfigDoc.data();
        menuConfig.value = data.navigationConfig || [];
        
        // Verificar se há itens no menu padrão que não existem na configuração carregada
        for (const item of originalNavigationConfig) {
          const existingIndex = menuConfig.value.findIndex(navItem => navItem.path === item.path);
          if (existingIndex === -1) {
            // Se não existir, adicionar
            menuConfig.value.push({...item});
          }
        }
      } else {
        // Se não existir configuração no Firestore, usar a configuração padrão
        menuConfig.value = [...originalNavigationConfig];
      }
      
      isLoaded.value = true;
    } catch (error) {
      console.error('Erro ao carregar configurações de menu:', error);
    } finally {
      isLoading.value = false;
    }
  },
  
  /**
   * Verifica se um usuário tem permissão para acessar uma rota
   * @param path Caminho da rota
   * @param userRole Papel do usuário
   * @returns Verdadeiro se o usuário tem permissão, falso caso contrário
   */
  hasRoutePermission(path: string, userRole: string): boolean {
    // Super admin sempre tem acesso a tudo
    if (userRole === 'super_admin') return true;
    
    // Se as configurações ainda não foram carregadas, permitir acesso
    // Isso é importante para não bloquear o usuário durante o carregamento inicial
    if (!isLoaded.value) return true;
    
    // Encontrar o item de menu correspondente à rota
    const menuItem = this.findMenuItemByPath(path);
    
    // Se o item não existir nas configurações, permitir acesso
    // Isso é importante para rotas que não estão no menu, como páginas de erro
    if (!menuItem) return true;
    
    // Verificar se o papel do usuário está na lista de papéis permitidos
    return menuItem.roles?.includes(userRole) || false;
  },
  
  /**
   * Encontra um item de menu pelo caminho da rota
   * @param path Caminho da rota
   * @returns Item de menu correspondente ou null se não encontrado
   */
  findMenuItemByPath(path: string): NavigationItem | null {
    // Função recursiva para buscar em itens aninhados
    const findItem = (items: NavigationItem[], targetPath: string): NavigationItem | null => {
      for (const item of items) {
        // Verificar se o caminho corresponde exatamente
        if (item.path === targetPath) {
          return item;
        }
        
        // Verificar se o caminho começa com o caminho do item (para rotas aninhadas)
        // Por exemplo, /admin/users deve corresponder a /admin
        if (targetPath.startsWith(item.path + '/')) {
          return item;
        }
        
        // Verificar nos filhos, se existirem
        if (item.children && item.children.length > 0) {
          const childItem = findItem(item.children, targetPath);
          if (childItem) {
            return childItem;
          }
        }
      }
      
      return null;
    };
    
    return findItem(menuConfig.value, path);
  },
  
  // Getters
  isMenuConfigLoaded: computed(() => isLoaded.value),
  isMenuConfigLoading: computed(() => isLoading.value),
  menuItems: computed(() => menuConfig.value)
};
