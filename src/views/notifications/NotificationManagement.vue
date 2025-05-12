<template>
  <div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Cabeçalho -->
      <div class="p-4 border-b">
        <h1 class="text-xl font-semibold text-gray-800">Gerenciamento de Notificações 📬 📊</h1>
        <p class="text-sm text-gray-600 mt-1">
          Envie notificações para usuários específicos ou grupos de usuários.
        </p>
      </div>
      
      <!-- Formulário de notificação -->
      <div class="p-4">
        <form @submit.prevent="handleSubmit">
          <!-- Tipo de notificação -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de notificação</label>
            <div class="flex flex-wrap gap-3">
              <button 
                type="button"
                @click="notificationType = 'user'"
                class="px-3 py-2 text-sm rounded-md transition-colors"
                :class="notificationType === 'user' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'"
              >
                Usuário específico
              </button>
              <button 
                type="button"
                @click="notificationType = 'role'"
                class="px-3 py-2 text-sm rounded-md transition-colors"
                :class="notificationType === 'role' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'"
              >
                Grupo de usuários
              </button>
              <button 
                type="button"
                @click="notificationType = 'system'"
                class="px-3 py-2 text-sm rounded-md transition-colors"
                :class="notificationType === 'system' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'"
              >
                Todos os usuários
              </button>
            </div>
          </div>
          
          <!-- Destinatário (usuário específico) -->
          <div v-if="notificationType === 'user'" class="mb-4">
            <label for="userId" class="block text-sm font-medium text-gray-700 mb-1">Selecione o usuário</label>
            <select 
              id="userId"
              v-model="targetUserId"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Selecione um usuário</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.displayName || user.email }} ({{ user.role }})
              </option>
            </select>
          </div>
          
          <!-- Destinatário (grupo de usuários) -->
          <div v-if="notificationType === 'role'" class="mb-4">
            <label for="userRole" class="block text-sm font-medium text-gray-700 mb-1">Selecione o grupo</label>
            <select 
              id="userRole"
              v-model="targetRole"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>Selecione um grupo</option>
              <option value="super_admin">Super Administradores</option>
              <option value="admin">Administradores</option>
              <option value="broker">Corretores</option>
              <option value="realtor">Agentes</option>
              <option value="partner">Parceiros</option>
              <option value="user">Usuários</option>
            </select>
          </div>
          
          <!-- Tipo de alerta -->
          <div class="mb-4">
            <label for="alertType" class="block text-sm font-medium text-gray-700 mb-1">Tipo de alerta</label>
            <select 
              id="alertType"
              v-model="alertType"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="info">Informação</option>
              <option value="success">Sucesso</option>
              <option value="warning">Aviso</option>
              <option value="error">Erro</option>
            </select>
          </div>
          
          <!-- Opção de extrema importância -->
          <div class="mt-4">
            <label class="inline-flex items-center">
              <input 
                type="checkbox" 
                v-model="isHighPriority" 
                class="form-checkbox h-5 w-5 text-blue-600 border border-gray-300 rounded"
              />
              <span class="ml-2 text-gray-700">Notificação de extrema importância</span>
            </label>
            <p class="text-xs text-gray-500 mt-1 ml-6">
              O usuário precisará confirmar a leitura desta notificação para continuar usando o sistema.
            </p>
          </div>
          
          <!-- Título -->
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input 
              id="title"
              v-model="title"
              type="text"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o título da notificação"
              required
              maxlength="100"
            />
            <p class="text-xs text-gray-500 mt-1">{{ title.length }}/100 caracteres</p>
          </div>
          
          <!-- Mensagem -->
          <div class="mb-4">
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea 
              id="message"
              v-model="message"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a mensagem da notificação..."
              rows="4"
              required
              maxlength="1000"
            ></textarea>
            <div class="flex justify-between items-center mt-1">
              <p class="text-xs text-gray-500">{{ message.length }}/1000 caracteres</p>
              <div class="emoji-picker relative">
                <button 
                  type="button" 
                  @click="showEmojiPicker = !showEmojiPicker" 
                  class="text-gray-500 hover:text-gray-700"
                  title="Inserir emoji"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div v-if="showEmojiPicker" class="absolute z-10 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 w-96 max-h-80 overflow-y-auto">
                  <div class="grid grid-cols-8 gap-1">
                    <button 
                      v-for="emoji in commonEmojis" 
                      :key="emoji" 
                      @click.prevent.stop="insertEmoji(emoji)" 
                      type="button"
                      class="w-8 h-8 text-xl hover:bg-gray-100 rounded"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Botões de ação -->
          <div class="flex justify-end space-x-2">
            <button 
              type="button"
              @click="resetForm"
              class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpar
            </button>
            <button 
              type="submit"
              class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
              <span v-else>Enviar Notificação</span>
            </button>
          </div>
        </form>
        
        <!-- Mensagens de feedback -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {{ successMessage }}
        </div>
        
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ errorMessage }}
        </div>
      </div>
      
      <!-- Histórico de notificações enviadas -->
      <div class="p-4 border-t">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Histórico de Notificações Enviadas</h2>
        
        <div v-if="isLoadingHistory" class="py-8 text-center text-gray-500">
          <svg class="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Carregando histórico...</p>
        </div>
        
        <div v-else-if="sentNotifications.length === 0" class="py-8 text-center text-gray-500">
          <p>Nenhuma notificação enviada ainda.</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatário</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="notification in sentNotifications" :key="notification.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(notification.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-800': notification.type === 'info',
                      'bg-green-100 text-green-800': notification.type === 'success',
                      'bg-yellow-100 text-yellow-800': notification.type === 'warning',
                      'bg-red-100 text-red-800': notification.type === 'error',
                      'bg-pink-100 text-pink-800': notification.type === 'like',
                      'bg-purple-100 text-purple-800': notification.type === 'comment',
                      'bg-indigo-100 text-indigo-800': notification.type === 'interest'
                    }"
                  >
                    {{ 
                      notification.type === 'info' ? 'Informação' : 
                      notification.type === 'success' ? 'Sucesso' : 
                      notification.type === 'warning' ? 'Aviso' : 
                      notification.type === 'error' ? 'Erro' :
                      notification.type === 'like' ? 'Curtida' :
                      notification.type === 'comment' ? 'Comentário' :
                      notification.type === 'interest' ? 'Interesse' : notification.type
                    }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="notification.recipient?.id">
                    Usuário específico
                  </span>
                  <span v-else-if="notification.recipient?.role">
                    {{ 
                      notification.recipient.role === 'super_admin' ? 'Super Administradores' :
                      notification.recipient.role === 'admin' ? 'Administradores' :
                      notification.recipient.role === 'broker' ? 'Corretores' :
                      notification.recipient.role === 'realtor' ? 'Agentes' :
                      notification.recipient.role === 'partner' ? 'Parceiros' : 'Usuários'
                    }}
                  </span>
                  <span v-else>
                    Todos os usuários
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ notification.title }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {{ notification.message }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { notificationService } from '../../services/notificationService';
import type { UserRole } from '../../types/models';
import { auth } from '../../firebase';

// Estado do formulário
const notificationType = ref<'user' | 'role' | 'system'>('user');
const targetUserId = ref('');
const targetRole = ref<UserRole>('user');
const title = ref('');
const message = ref('');
const alertType = ref<'info' | 'success' | 'warning' | 'error'>('info');
const isHighPriority = ref(false);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Estado do histórico
const sentNotifications = ref<any[]>([]);
const isLoadingHistory = ref(false);

// Tipos de usuário
interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
}

// Lista de usuários
const users = ref<User[]>([]);
const isLoadingUsers = ref(false);

// Emoji picker
const showEmojiPicker = ref(false);
const commonEmojis = [
  // Rostos sorridentes
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '😍', '🥰', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴',
  // Rostos negativos
  '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️',
  // Mãos e pessoas
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
  // Animais
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄',
  // Comidas
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🌮', '🍕', '🍔', '🍟', '🍖', '🍗', '🥩', '🍺', '🍻', '🥂', '🍷',
  // Objetos
  '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '💭', '💤', '💰', '💎', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '⛳', '🎣', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
  // Símbolos
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️',
  // Símbolos adicionais
  '📢', '📣', '📯', '🔔', '🔕', '🎵', '🎶', '🎼', '🎤', '🎧', '📱', '📲', '☎️', '📞', '📟', '📠', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗨️', '💌', '💼',
  '📁', '📂', '📅', '📆', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '📏', '📐', '✂️', '🔒', '🔓', '🔏', '🔐', '🔑', '🔨', '🔧', '🔩', '⚙️', '🗜️',
  '💡', '🔦', '🔆', '🔅', '🔌', '🔋', '📡', '🔍', '🔎', '🔬', '🔭', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '📑',
  '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🕍', '⛩️', '🕋',
  '✅', '❌', '❎', '✔️', '✖️', '❓', '❔', '❕', '❗', '‼️', '⁉️', '〰️', '⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️'
];

// Inserir emoji
const insertEmoji = (emoji: string) => {
  message.value += emoji;
  // Não fechar o seletor de emojis após inserir um emoji
  // para permitir a inserção de múltiplos emojis
};

// Fechar o seletor de emojis quando clicar fora dele
const closeEmojiPicker = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  // Verificar se o clique foi fora do seletor de emojis
  if (showEmojiPicker.value && !target.closest('.emoji-picker')) {
    showEmojiPicker.value = false;
  }
};

// Carregar usuários
const loadUsers = async () => {
  isLoadingUsers.value = true;
  
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    users.value = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role
      };
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  } finally {
    isLoadingUsers.value = false;
  }
};

// Carregar histórico de notificações enviadas
const loadSentNotifications = async () => {
  isLoadingHistory.value = true;
  
  try {
    // Obter o ID do usuário atual
    const currentUserId = auth.currentUser?.uid;
    
    // Consulta para obter todas as notificações
    const notificationsQuery = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(50) // Aumentando o limite para mostrar mais notificações
    );
    
    const snapshot = await getDocs(notificationsQuery);
    
    // Processar os resultados
    sentNotifications.value = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          message: data.message,
          timestamp: data.timestamp.toDate(),
          read: data.read,
          type: data.type,
          sender: data.sender,
          recipient: data.recipient,
          highPriority: data.highPriority
        };
      })
      // Filtrar apenas as notificações enviadas pelo usuário atual
      // ou mostrar todas se o usuário for administrador
      .filter(notification => {
        // Verificar se o usuário atual é o remetente
        if (notification.sender && currentUserId && 
            (notification.sender.id === currentUserId || 
             notification.sender.id === 'system')) {
          return true;
        }
        
        // Verificar se o usuário é administrador (pode ver todas as notificações)
        const authUser = auth.currentUser;
        const userRole = authUser ? (authUser as any).role : null;
        if (userRole === 'super_admin' || userRole === 'admin') {
          return true;
        }
        
        return false;
      });
      
    console.log('Notificações enviadas carregadas:', sentNotifications.value.length);
  } catch (error) {
    console.error('Erro ao carregar histórico de notificações:', error);
  } finally {
    isLoadingHistory.value = false;
  }
};

// Enviar notificação
const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    // Validar formulário
    if (!title.value) {
      throw new Error('Título é obrigatório');
    }
    
    if (!message.value) {
      throw new Error('Mensagem é obrigatória');
    }
    
    if (notificationType.value === 'user' && !targetUserId.value) {
      throw new Error('Selecione um usuário');
    }
    
    if (notificationType.value === 'role' && !targetRole.value) {
      throw new Error('Selecione um grupo de usuários');
    }
    
    // Criar objeto de remetente com valores fixos para evitar problemas de autenticação
    const sender = {
      id: 'system',
      name: 'Sistema',
      role: 'system' as UserRole
    };
    
    // Enviar notificação com base no tipo selecionado
    if (notificationType.value === 'user') {
      await notificationService.sendToUser(
        title.value,
        message.value,
        alertType.value as 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
        targetUserId.value,
        sender,
        isHighPriority.value
      );
    } else if (notificationType.value === 'role') {
      await notificationService.sendToRole(
        title.value,
        message.value,
        alertType.value as 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
        targetRole.value as UserRole,
        sender,
        isHighPriority.value
      );
    } else if (notificationType.value === 'system') {
      await notificationService.sendSystemNotification(
        title.value,
        message.value,
        alertType.value as 'info' | 'success' | 'warning' | 'error' | 'like' | 'comment' | 'interest',
        isHighPriority.value
      );
    }
    
    // Limpar formulário após envio bem-sucedido
    resetForm();
    
    // Recarregar histórico
    await loadSentNotifications();
    
    successMessage.value = 'Notificação enviada com sucesso!';
    
    // Registrar no console para depuração
    console.log('Notificação enviada com sucesso:', {
      tipo: notificationType.value,
      destinatário: notificationType.value === 'user' ? targetUserId.value : 
                   notificationType.value === 'role' ? targetRole.value : 'todos',
      título: title.value,
      mensagem: message.value
    });
    
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao enviar notificação';
  } finally {
    isSubmitting.value = false;
  }
};

// Resetar formulário
const resetForm = () => {
  title.value = '';
  message.value = '';
  alertType.value = 'info';
  isHighPriority.value = false;
  
  if (notificationType.value === 'user') {
    targetUserId.value = '';
  } else if (notificationType.value === 'role') {
    targetRole.value = 'user' as UserRole;
  }
};

// Formatar data
const formatDate = (date: Date) => {
  if (!date) return '';
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Carregar dados ao montar o componente
onMounted(() => {
  loadUsers();
  loadSentNotifications();
  document.addEventListener('click', closeEmojiPicker);
});

// Remover listener quando o componente for desmontado
onUnmounted(() => {
  document.removeEventListener('click', closeEmojiPicker);
});
</script>
