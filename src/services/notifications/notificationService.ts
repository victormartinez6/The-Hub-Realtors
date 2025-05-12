import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from "../../firebase";
import type { UserRole } from '../../types/models';

// Tipos
export interface Notification {
  id?: string;
  title: string;
  message: string;
  timestamp: Date | Timestamp;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest';
  highPriority?: boolean;
  sender?: {
    id: string;
    name: string;
    role: UserRole;
  };
  recipient?: {
    id?: string;
    role?: UserRole;
  };
}

/**
 * Serviço para gerenciar notificações
 */
export const notificationService = {
  /**
   * Busca notificações para um usuário específico
   * @param userId ID do usuário
   * @param userRole Papel do usuário
   * @param limit Limite de notificações a serem retornadas
   * @returns Lista de notificações
   */
  async getUserNotifications(userId: string, userRole: UserRole, limit = 20): Promise<Notification[]> {
    try {
      console.log('Buscando notificações para:', userId, userRole);
      
      // Buscar todas as notificações
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(notificationsRef);
      
      console.log('Total de documentos encontrados:', querySnapshot.size);
      
      const notifications: Notification[] = [];
      
      querySnapshot.forEach(doc => {
        try {
          const data = doc.data();
          
          // Verificar se a notificação é para este usuário específico
          const isForUser = data.recipient?.id === userId;
          
          // Verificar se a notificação é para o papel deste usuário
          const isForRole = data.recipient?.role === userRole;
          
          // Verificar se a notificação é para todos os usuários
          const isForAll = data.recipient?.role === 'all';
          
          if (isForUser || isForRole || isForAll) {
            // Converter timestamp para um formato consistente
            let timestamp;
            try {
              if (data.timestamp) {
                if (data.timestamp.toDate) {
                  // Timestamp do Firestore
                  timestamp = data.timestamp.toDate();
                } else if (data.timestamp instanceof Date) {
                  // Já é um objeto Date
                  timestamp = data.timestamp;
                } else {
                  // Tentar converter de string ou número
                  timestamp = new Date(data.timestamp);
                }
              } else {
                // Fallback para a data atual
                timestamp = new Date();
              }
            } catch (e) {
              console.error('Erro ao converter timestamp:', e);
              timestamp = new Date();
            }
            
            notifications.push({
              id: doc.id,
              title: data.title || '',
              message: data.message || '',
              timestamp: timestamp,
              read: data.read || false,
              type: data.type || 'info',
              highPriority: data.highPriority || false,
              sender: data.sender || { id: 'system', name: 'Sistema', role: 'system' },
              recipient: data.recipient || { role: 'all' }
            });
          }
        } catch (e) {
          console.error('Erro ao processar documento:', e, doc.id);
        }
      });
      
      // Ordenar por data (mais recentes primeiro)
      notifications.sort((a, b) => {
        try {
          const dateA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
          const dateB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
          return dateB - dateA;
        } catch (e) {
          console.error('Erro ao ordenar notificações:', e);
          return 0;
        }
      });
      
      console.log('Notificações filtradas:', notifications.length);
      
      // Limitar o número de notificações
      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  },
  
  /**
   * Busca notificações enviadas por um usuário específico
   * @param userId ID do usuário remetente
   * @param maxResults Limite de notificações a serem retornadas
   * @returns Lista de notificações enviadas
   */
  async getSentNotifications(userId: string, maxResults: number = 10): Promise<Notification[]> {
    try {
      console.log('Buscando notificações enviadas pelo usuário:', userId);
      
      // Consulta simples sem filtros complexos
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(notificationsRef);
      
      console.log('Total de documentos encontrados:', querySnapshot.size);
      
      // Filtrar manualmente
      const notifications: Notification[] = [];
      
      querySnapshot.forEach(doc => {
        try {
          const data = doc.data();
          
          // Verificar se a notificação foi enviada por este usuário
          const isSentByUser = data.sender?.id === userId;
          
          if (isSentByUser) {
            // Converter timestamp para Date
            let timestamp;
            try {
              timestamp = data.timestamp ? 
                (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : 
                new Date();
            } catch (e) {
              console.error('Erro ao converter timestamp:', e);
              timestamp = new Date();
            }
            
            notifications.push({
              id: doc.id,
              title: data.title || 'Sem título',
              message: data.message || 'Sem mensagem',
              timestamp: timestamp,
              read: !!data.read,
              type: data.type || 'info',
              sender: data.sender || { id: 'system', name: 'Sistema', role: 'system' },
              recipient: data.recipient || {},
              highPriority: !!data.highPriority
            });
          }
        } catch (e) {
          console.error('Erro ao processar documento:', e, doc.id);
        }
      });
      
      console.log('Notificações enviadas filtradas:', notifications.length);
      
      // Ordenar por data (mais recentes primeiro)
      return notifications
        .sort((a, b) => {
          try {
            return (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime();
          } catch (e) {
            return 0;
          }
        })
        .slice(0, maxResults);
    } catch (error) {
      console.error('Erro ao buscar notificações enviadas:', error);
      return [];
    }
  },
  
  /**
   * Marca uma notificação como lida
   * @param notificationId ID da notificação
   * @returns Promessa que resolve quando a operação for concluída
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      console.log('Marcando notificação como lida:', notificationId);
      
      // Referência para o documento da notificação
      const notificationRef = doc(db, 'notifications', notificationId);
      
      // Atualizar o documento
      await updateDoc(notificationRef, { read: true });
      
      console.log('Notificação marcada como lida com sucesso');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  },
  
  /**
   * Marca todas as notificações de um usuário como lidas
   * @param userId ID do usuário
   * @param userRole Papel do usuário
   * @returns Promessa que resolve quando a operação for concluída
   */
  async markAllAsRead(userId: string, userRole: UserRole): Promise<void> {
    try {
      console.log('Marcando todas as notificações como lidas para:', userId, userRole);
      
      // Buscar todas as notificações
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(notificationsRef);
      
      console.log('Total de documentos encontrados:', querySnapshot.size);
      
      const updatePromises: Promise<void>[] = [];
      
      querySnapshot.forEach(doc => {
        try {
          const data = doc.data();
          
          // Verificar se a notificação é para este usuário
          const isForUser = data.recipient?.id === userId;
          
          // Verificar se a notificação é para o papel deste usuário
          const isForRole = data.recipient?.role === userRole;
          
          // Verificar se a notificação é para todos
          const isForAll = data.recipient?.role === 'all';
          
          // Verificar se a notificação não está lida
          const isUnread = !data.read;
          
          if ((isForUser || isForRole || isForAll) && isUnread) {
            console.log('Marcando notificação como lida:', doc.id);
            updatePromises.push(
              updateDoc(doc.ref, { read: true })
            );
          }
        } catch (e) {
          console.error('Erro ao processar documento para marcar como lido:', e, doc.id);
        }
      });
      
      console.log('Atualizando', updatePromises.length, 'notificações');
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log('Todas as notificações foram marcadas como lidas com sucesso');
      } else {
        console.log('Nenhuma notificação para marcar como lida');
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  },
  
  /**
   * Cria uma nova notificação
   * @param notification Dados da notificação
   * @returns ID da notificação criada
   */
  async createNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      console.log('Criando nova notificação:', notification);
      
      // Garantir que o timestamp seja um Timestamp do Firestore
      let timestamp;
      try {
        timestamp = notification.timestamp instanceof Date 
          ? Timestamp.fromDate(notification.timestamp) 
          : notification.timestamp;
      } catch (e) {
        console.error('Erro ao converter timestamp:', e);
        timestamp = Timestamp.fromDate(new Date());
      }
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const notificationData = {
        title: notification.title || 'Sem título',
        message: notification.message || 'Sem mensagem',
        timestamp: timestamp,
        read: false, // Garantir que novas notificações sejam marcadas como não lidas
        type: notification.type || 'info',
        highPriority: !!notification.highPriority,
        
        // Garantir que o sender tenha um id válido
        sender: notification.sender ? {
          id: notification.sender.id || 'system',
          name: notification.sender.name || 'Sistema',
          role: notification.sender.role || 'system'
        } : {
          id: 'system',
          name: 'Sistema',
          role: 'system'
        },
        
        // Garantir que o recipient esteja presente
        recipient: notification.recipient || { role: 'all' }
      };
      
      console.log('Dados da notificação formatados:', notificationData);
      
      // Adicionar ao Firestore
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notificação criada com sucesso, ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },
  
  /**
   * Envia uma notificação para todos os usuários com um papel específico
   * @param title Título da notificação
   * @param message Mensagem da notificação
   * @param type Tipo da notificação
   * @param targetRole Papel alvo
   * @param sender Informações do remetente
   * @param highPriority Indica se a notificação é de extrema importância
   * @returns ID da notificação criada
   */
  async sendToRole(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
    targetRole: UserRole,
    sender: { id: string; name: string; role: UserRole },
    highPriority: boolean = false
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      timestamp: new Date(),
      read: false,
      type,
      sender,
      highPriority,
      recipient: {
        role: targetRole
      }
    });
  },
  
  /**
   * Envia uma notificação para um usuário específico
   * @param title Título da notificação
   * @param message Mensagem da notificação
   * @param type Tipo da notificação
   * @param targetUserId ID do usuário alvo
   * @param sender Informações do remetente
   * @param highPriority Indica se a notificação é de extrema importância
   * @returns ID da notificação criada
   */
  async sendToUser(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
    targetUserId: string,
    sender: { id: string; name: string; role: UserRole },
    highPriority: boolean = false
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      timestamp: new Date(),
      read: false,
      type,
      sender,
      highPriority,
      recipient: {
        id: targetUserId
      }
    });
  },
  
  /**
   * Envia uma notificação do sistema para todos os usuários
   * @param title Título da notificação
   * @param message Mensagem da notificação
   * @param type Tipo da notificação
   * @param highPriority Indica se a notificação é de extrema importância
   * @returns ID da notificação criada
   */
  async sendSystemNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
    highPriority: boolean = false
  ): Promise<string> {
    return this.createNotification({
      title,
      message,
      timestamp: new Date(),
      read: false,
      type,
      highPriority,
      sender: {
        id: 'system',
        name: 'Sistema',
        role: 'system'
      },
      recipient: {
        role: 'all'  // Usar 'all' para indicar que é para todos os usuários
      }
    });
  }
};

export default notificationService;
