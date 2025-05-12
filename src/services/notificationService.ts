import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserRole } from '../types/models';

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
  async getUserNotifications(userId: string, userRole: UserRole, maxResults: number = 10): Promise<Notification[]> {
    try {
      console.log('Buscando notificações para:', userId, userRole);
      
      // Consulta para notificações específicas para o usuário
      const userQuery = query(
        collection(db, 'notifications'),
        where('recipient.id', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      // Consulta para notificações para o papel do usuário
      const roleQuery = query(
        collection(db, 'notifications'),
        where('recipient.role', '==', userRole),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      // Consulta para notificações do sistema (enviadas para todos)
      const systemQuery = query(
        collection(db, 'notifications'),
        where('recipient.role', '==', 'all'),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      // Executar consultas em paralelo
      const [userSnapshot, roleSnapshot, systemSnapshot] = await Promise.all([
        getDocs(userQuery),
        getDocs(roleQuery),
        getDocs(systemQuery)
      ]);
      
      console.log('Notificações encontradas - Usuário:', userSnapshot.size, 'Papel:', roleSnapshot.size, 'Sistema:', systemSnapshot.size);
      
      // Combinar resultados
      const notifications: Notification[] = [];
      const processedIds = new Set<string>(); // Para evitar duplicatas
      
      // Função auxiliar para processar documentos
      const processDoc = (doc: any) => {
        if (processedIds.has(doc.id)) return; // Pular se já processado
        
        const data = doc.data();
        notifications.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          timestamp: data.timestamp.toDate(),
          read: data.read,
          type: data.type,
          sender: data.sender,
          recipient: data.recipient,
          highPriority: data.highPriority
        });
        
        processedIds.add(doc.id);
      };
      
      // Processar notificações do usuário
      userSnapshot.forEach(processDoc);
      
      // Processar notificações do papel
      roleSnapshot.forEach(processDoc);
      
      // Processar notificações do sistema
      systemSnapshot.forEach(processDoc);
      
      // Ordenar por data (mais recentes primeiro) e limitar ao número máximo
      return notifications
        .sort((a, b) => (b.timestamp as Date).getTime() - (a.timestamp as Date).getTime())
        .slice(0, maxResults);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
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
      console.log('Buscando notificações enviadas por:', userId);
      
      // Consulta para notificações enviadas pelo usuário
      const sentQuery = query(
        collection(db, 'notifications'),
        where('sender.id', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      const sentSnapshot = await getDocs(sentQuery);
      
      console.log('Notificações enviadas encontradas:', sentSnapshot.size);
      
      // Processar resultados
      const notifications: Notification[] = [];
      
      sentSnapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          timestamp: data.timestamp.toDate(),
          read: data.read,
          type: data.type,
          sender: data.sender,
          recipient: data.recipient,
          highPriority: data.highPriority
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações enviadas:', error);
      throw error;
    }
  },
  
  /**
   * Marca uma notificação como lida
   * @param notificationId ID da notificação
   * @returns Promessa que resolve quando a operação for concluída
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
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
      // Buscar todas as notificações não lidas do usuário
      const userQuery = query(
        collection(db, 'notifications'),
        where('recipient.id', '==', userId),
        where('read', '==', false)
      );
      
      const roleQuery = query(
        collection(db, 'notifications'),
        where('recipient.role', '==', userRole),
        where('read', '==', false)
      );
      
      const [userSnapshot, roleSnapshot] = await Promise.all([
        getDocs(userQuery),
        getDocs(roleQuery)
      ]);
      
      // Marcar todas como lidas
      const updatePromises: Promise<void>[] = [];
      
      userSnapshot.forEach(doc => {
        updatePromises.push(
          updateDoc(doc.ref, { read: true })
        );
      });
      
      roleSnapshot.forEach(doc => {
        updatePromises.push(
          updateDoc(doc.ref, { read: true })
        );
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  },
  
  /**
   * Cria uma nova notificação
   * @param notification Dados da notificação
   * @returns ID da notificação criada
   */
  async createNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      // Garantir que o timestamp seja um Timestamp do Firestore
      const notificationData = {
        ...notification,
        timestamp: Timestamp.fromDate(notification.timestamp as Date),
        read: false, // Garantir que novas notificações sejam marcadas como não lidas
        // Garantir que o sender tenha um id válido
        sender: notification.sender ? {
          id: notification.sender.id || 'system',
          name: notification.sender.name || 'Sistema',
          role: notification.sender.role || 'system'
        } : {
          id: 'system',
          name: 'Sistema',
          role: 'system'
        }
      };
      
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
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
      sender: {
        id: 'system',
        name: 'Sistema',
        role: 'system'
      },
      highPriority,
      recipient: {
        role: 'all'  // Usar 'all' para indicar que é para todos os usuários
      }
    });
  }
};

export default notificationService;
