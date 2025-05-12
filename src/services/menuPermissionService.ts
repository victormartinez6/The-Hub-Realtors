import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { navigationConfig as defaultNavigationConfig } from '../config/navigation';
import type { NavigationItem } from '../config/navigation';
import type { UserRole } from '../types/models';

/**
 * Serviço para gerenciar as permissões de menu
 */
class MenuPermissionService {
  private readonly configPath = 'appConfig';
  private readonly configDoc = 'menuPermissions';
  private navigationItems: NavigationItem[] | null = null;
  
  /**
   * Carrega as configurações de menu do Firestore
   */
  async loadMenuConfig(): Promise<NavigationItem[]> {
    try {
      // Se já temos os itens carregados, retornar sem fazer nova consulta
      if (this.navigationItems) {
        console.log('Usando configurações de menu já carregadas');
        return this.navigationItems;
      }

      const menuConfigRef = doc(db, this.configPath, this.configDoc);
      const menuConfigDoc = await getDoc(menuConfigRef);
      
      if (menuConfigDoc.exists()) {
        const data = menuConfigDoc.data();
        this.navigationItems = data.navigationConfig;
        console.log('Configurações de menu carregadas do Firestore');
        return data.navigationConfig;
      } else {
        // Se não existir configuração no Firestore, usar a configuração padrão
        this.navigationItems = [...defaultNavigationConfig];
        console.log('Usando configurações de menu padrão');
        return [...defaultNavigationConfig];
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de menu:', error);
      // Em caso de erro, se já temos itens carregados, retorná-los
      if (this.navigationItems) {
        return this.navigationItems;
      }
      throw new Error('Falha ao carregar configurações de menu');
    }
  }
  
  /**
   * Salva as configurações de menu no Firestore
   */
  async saveMenuConfig(navigationConfig: NavigationItem[], userId: string): Promise<void> {
    try {
      const menuConfigRef = doc(db, this.configPath, this.configDoc);
      await setDoc(menuConfigRef, {
        navigationConfig,
        updatedAt: new Date(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de menu:', error);
      throw new Error('Falha ao salvar configurações de menu');
    }
  }
  
  /**
   * Filtra os itens de menu com base no perfil do usuário
   */
  filterMenuItemsByRole(navigationItems: NavigationItem[], role: UserRole): NavigationItem[] {
    return navigationItems.filter(item => {
      if (!item.roles) return true; // Se não tiver roles definidas, todos podem ver
      return item.roles.includes(role);
    });
  }
  
  /**
   * Obtém os itens de menu para um perfil específico
   */
  async getMenuItemsForRole(role: UserRole): Promise<NavigationItem[]> {
    const navigationItems = await this.loadMenuConfig();
    return this.filterMenuItemsByRole(navigationItems, role);
  }
  
  /**
   * Verifica se um usuário tem permissão para acessar uma funcionalidade específica
   * @param permissionKey Chave de permissão (path do item de menu)
   * @param role Perfil do usuário
   * @returns true se o usuário tem permissão, false caso contrário
   */
  hasPermission(permissionKey: string, role: UserRole): boolean {
    // Se ainda não carregou as configurações, considerar que não tem permissão
    if (!this.navigationItems) {
      console.warn('Configurações de menu não carregadas. Carregue primeiro com loadMenuConfig()');
      return false;
    }
    
    // Procurar o item de menu com o path correspondente
    const menuItem = this.navigationItems.find(item => item.path === permissionKey);
    
    // Se não encontrou o item, considerar que não tem permissão
    if (!menuItem) {
      return false;
    }
    
    // Se o item não tem roles definidas, todos podem ver
    if (!menuItem.roles) {
      return true;
    }
    
    // Verificar se o perfil do usuário está na lista de roles permitidas
    return menuItem.roles.includes(role);
  }
}

export const menuPermissionService = new MenuPermissionService();
