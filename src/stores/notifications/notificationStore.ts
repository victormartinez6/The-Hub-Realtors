import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationService, type Notification } from '../../services/notifications/notificationService';
import { useAuthStore } from '../auth';
import type { UserRole } from '../../types/models';

export const useNotificationStore = defineStore('notification', () => {
  // Estado
  const notifications = ref<Notification[]>([]);
  const sentNotifications = ref<Notification[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const hasHighPriorityUnread = ref(false);

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter(notification => !notification.read).length;
  });

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      // Ordenar por lido/não lido (não lidos primeiro)
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }

      // Em seguida, ordenar por data (mais recentes primeiro)
      try {
        // Converter para timestamp JavaScript
        const dateA = a.timestamp instanceof Date 
          ? a.timestamp.getTime() 
          : (a.timestamp && a.timestamp.toDate ? a.timestamp.toDate().getTime() : 0);
        
        const dateB = b.timestamp instanceof Date 
          ? b.timestamp.getTime() 
          : (b.timestamp && b.timestamp.toDate ? b.timestamp.toDate().getTime() : 0);
        
        return dateB - dateA;
      } catch (err) {
        console.error('Erro ao ordenar notificações por data:', err, a, b);
        return 0;
      }
    });
  });

  const sortedSentNotifications = computed(() => {
    return [...sentNotifications.value].sort((a, b) => {
      try {
        // Converter para timestamp JavaScript
        const dateA = a.timestamp instanceof Date 
          ? a.timestamp.getTime() 
          : (a.timestamp && a.timestamp.toDate ? a.timestamp.toDate().getTime() : 0);
        
        const dateB = b.timestamp instanceof Date 
          ? b.timestamp.getTime() 
          : (b.timestamp && b.timestamp.toDate ? b.timestamp.toDate().getTime() : 0);
        
        return dateB - dateA;
      } catch (err) {
        console.error('Erro ao ordenar notificações enviadas por data:', err, a, b);
        return 0;
      }
    });
  });

  // Funções auxiliares
  /**
   * Obtém o ID do usuário do authStore
   * @returns ID do usuário ou string vazia se não encontrado
   */
  function getUserIdFromAuth(): string {
    const authStore = useAuthStore();
    
    // Verificar se temos userData (que é a estrutura correta)
    if (authStore.userData && authStore.userData.id) {
      console.log('Usando ID do userData:', authStore.userData.id);
      return authStore.userData.id;
    }
    
    // Fallback para o uid do objeto de usuário do Firebase
    if (authStore.user && authStore.user.uid) {
      console.log('Usando UID do Firebase:', authStore.user.uid);
      return authStore.user.uid;
    }
    
    console.error('ID do usuário não encontrado no authStore');
    return '';
  }
  
  /**
   * Obtém o papel do usuário do authStore
   * @returns Papel do usuário ou 'user' se não encontrado
   */
  function getUserRoleFromAuth(): UserRole {
    const authStore = useAuthStore();
    
    // Verificar se temos userData (que é a estrutura correta)
    if (authStore.userData && authStore.userData.role) {
      console.log('Usando papel do userData:', authStore.userData.role);
      return authStore.userData.role as UserRole;
    }
    
    console.log('Papel do usuário não encontrado, usando "user" como padrão');
    return 'user';
  }

  // Ações
  /**
   * Carrega as notificações do usuário atual
   */
  async function loadNotifications() {
    try {
      // Verificar se o usuário está autenticado
      const authStore = useAuthStore();
      console.log('AuthStore:', authStore);
      
      isLoading.value = true;
      error.value = null;
      
      // Obter ID do usuário usando o método específico para o authStore
      const userId = getUserIdFromAuth();
      
      if (!userId) {
        console.error('ID do usuário não encontrado');
        isLoading.value = false;
        error.value = 'Usuário não autenticado';
        return;
      }
      
      // Obter papel do usuário
      const userRole = getUserRoleFromAuth();
      
      console.log('Carregando notificações para o usuário:', userId, userRole);
      
      // Carregar notificações do usuário - aumentar o limite para 100 para garantir que todas as notificações sejam carregadas
      const userNotifications = await notificationService.getUserNotifications(
        userId,
        userRole,
        100 // Aumentar o limite para garantir que todas as notificações sejam carregadas
      );
      
      console.log('Notificações carregadas com sucesso:', userNotifications.length);
      console.log('Detalhes das notificações:', userNotifications.map(n => ({
        id: n.id,
        title: n.title,
        highPriority: n.highPriority,
        read: n.read,
        timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : 'não é Date'
      })));
      
      // Atualizar o estado
      notifications.value = userNotifications;
      
      // Verificar se há notificações de alta prioridade não lidas
      checkForHighPriorityNotifications();
      
      // Carregar notificações enviadas pelo usuário
      await loadSentNotifications();
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      error.value = 'Erro ao carregar notificações';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Verifica se há notificações de alta prioridade não lidas
   */
  function checkForHighPriorityNotifications() {
    console.log('Verificando notificações de alta prioridade...');
    console.log('Total de notificações:', notifications.value.length);

    // Filtrar notificações de alta prioridade não lidas
    const highPriorityUnread = notifications.value.filter(
      notification => notification.highPriority && !notification.read
    );

    console.log('Notificações de alta prioridade não lidas:', highPriorityUnread.length);
    console.log('Detalhes das notificações de alta prioridade:', highPriorityUnread.map(n => ({
      id: n.id,
      title: n.title,
      read: n.read,
      timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : 'não é Date'
    })));

    // Atualizar o estado
    hasHighPriorityUnread.value = highPriorityUnread.length > 0;

    if (hasHighPriorityUnread.value) {
      console.log('Há notificações de alta prioridade não lidas!');
      // Aqui podemos adicionar lógica adicional para notificar o usuário
    }
  }

  /**
   * Carrega as notificações enviadas pelo usuário atual
   */
  async function loadSentNotifications() {
    // Obter ID do usuário usando o método específico para o authStore
    const userId = getUserIdFromAuth();
    
    if (!userId) {
      console.error('ID do usuário não encontrado (loadSentNotifications)');
      return;
    }

    console.log('Carregando notificações enviadas para o usuário:', userId);

    try {
      sentNotifications.value = await notificationService.getSentNotifications(
        userId,
        20 // Limitar a 20 notificações
      );

      console.log('Notificações enviadas carregadas:', sentNotifications.value.length);
    } catch (err) {
      console.error('Erro ao carregar notificações enviadas:', err);
    }
  }

  /**
   * Marca uma notificação como lida
   * @param notificationId ID da notificação
   */
  async function markAsRead(notificationId: string) {
    try {
      await notificationService.markAsRead(notificationId);

      // Atualizar o estado local
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      error.value = 'Erro ao marcar notificação como lida';
    }
  }

  /**
   * Marca todas as notificações como lidas
   */
  async function markAllAsRead() {
    // Obter ID e papel do usuário
    const userId = getUserIdFromAuth();
    const userRole = getUserRoleFromAuth();
    
    if (!userId) {
      console.error('ID do usuário não encontrado (markAllAsRead)');
      return;
    }

    try {
      await notificationService.markAllAsRead(userId, userRole);

      // Atualizar o estado local
      notifications.value.forEach(notification => {
        notification.read = true;
      });
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
      error.value = 'Erro ao marcar todas as notificações como lidas';
    }
  }

  /**
   * Envia uma notificação para um usuário específico
   */
  async function sendToUser(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
    targetUserId: string,
    highPriority: boolean = false
  ) {
    const authStore = useAuthStore();

    try {
      // Verificar se o usuário está autenticado
      if (!authStore.user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Obter ID e papel do usuário
      const userId = getUserIdFromAuth();
      const userRole = getUserRoleFromAuth();
      
      if (!userId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Criar um objeto de remetente com informações disponíveis
      const sender = {
        id: userId,
        name: authStore.user.displayName || 'Usuário',
        role: userRole
      };

      const notificationId = await notificationService.sendToUser(
        title,
        message,
        type,
        targetUserId,
        sender,
        highPriority
      );

      // Adicionar à lista de notificações enviadas
      const newNotification = {
        id: notificationId,
        title,
        message,
        timestamp: new Date(),
        read: false,
        type,
        highPriority,
        sender,
        recipient: { id: targetUserId }
      };

      sentNotifications.value.unshift(newNotification);

      return notificationId;
    } catch (err) {
      console.error('Erro ao enviar notificação:', err);
      throw err;
    }
  }

  /**
   * Envia uma notificação para todos os usuários com um papel específico
   */
  async function sendToRole(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
    targetRole: UserRole,
    highPriority: boolean = false
  ) {
    const authStore = useAuthStore();

    try {
      // Verificar se o usuário está autenticado
      if (!authStore.user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Obter ID e papel do usuário
      const userId = getUserIdFromAuth();
      const userRole = getUserRoleFromAuth();
      
      if (!userId) {
        throw new Error('ID do usuário não encontrado');
      }

      // Criar um objeto de remetente com informações disponíveis
      const sender = {
        id: userId,
        name: authStore.user.displayName || 'Usuário',
        role: userRole
      };

      const notificationId = await notificationService.sendToRole(
        title,
        message,
        type,
        targetRole,
        sender,
        highPriority
      );

      // Adicionar à lista de notificações enviadas
      const newNotification = {
        id: notificationId,
        title,
        message,
        timestamp: new Date(),
        read: false,
        type,
        highPriority,
        sender,
        recipient: { role: targetRole }
      };

      sentNotifications.value.unshift(newNotification);

      return notificationId;
    } catch (err) {
      console.error('Erro ao enviar notificação:', err);
      throw err;
    }
  }

  /**
   * Envia uma notificação do sistema para todos os usuários
   * (Apenas super_admin pode usar esta função)
   */
  async function sendSystemNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest'
  ) {
    const authStore = useAuthStore();
    if (!authStore.user || authStore.user.role !== 'super_admin') {
      throw new Error('Apenas super_admin pode enviar notificações do sistema');
    }

    try {
      const notificationId = await notificationService.sendSystemNotification(title, message, type);

      // Adicionar à lista de notificações enviadas
      const newNotification = {
        id: notificationId,
        title,
        message,
        timestamp: new Date(),
        read: false,
        type,
        sender: {
          id: authStore.user.id,
          name: authStore.user.displayName || 'Sistema',
          role: authStore.user.role as UserRole
        },
        recipient: { role: 'all' as UserRole }
      };

      sentNotifications.value.unshift(newNotification);

      return notificationId;
    } catch (err) {
      console.error('Erro ao enviar notificação do sistema:', err);
      throw err;
    }
  }

  /**
   * Recarrega as notificações do usuário atual
   */
  async function reloadNotifications() {
    try {
      console.log('Recarregando notificações...');

      // Limpar o estado de erro
      error.value = null;
      isLoading.value = true;

      // Obter ID e papel do usuário
      const userId = getUserIdFromAuth();
      const userRole = getUserRoleFromAuth();
      
      if (!userId) {
        console.error('ID do usuário não encontrado (reloadNotifications)');
        error.value = 'Usuário não autenticado. Não é possível carregar notificações.';
        isLoading.value = false;
        return;
      }

      console.log('Recarregando notificações para o usuário:', userId, userRole);

      try {
        // Carregar notificações do usuário
        const userNotifications = await notificationService.getUserNotifications(
          userId,
          userRole
        );

        console.log('Notificações carregadas com sucesso:', userNotifications.length);

        // Atualizar o estado
        notifications.value = userNotifications;

        // Verificar se há notificações de alta prioridade não lidas
        checkForHighPriorityNotifications();
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
        error.value = 'Erro ao carregar notificações. Por favor, tente novamente.';
      } finally {
        isLoading.value = false;
      }
    } catch (err) {
      console.error('Erro ao recarregar notificações:', err);
      error.value = 'Erro ao recarregar notificações. Por favor, tente novamente.';
      isLoading.value = false;
    }
  }

  return {
    // Estado
    notifications,
    sentNotifications,
    isLoading,
    error,
    hasHighPriorityUnread,

    // Getters
    unreadCount,
    sortedNotifications,
    sortedSentNotifications,

    // Ações
    loadNotifications,
    loadSentNotifications,
    markAsRead,
    markAllAsRead,
    sendToUser,
    sendToRole,
    sendSystemNotification,
    reloadNotifications
  };
});

export default useNotificationStore;
