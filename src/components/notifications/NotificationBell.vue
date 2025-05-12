<template>
  <div class="relative" ref="notificationRef">
    <button 
      @click="toggleDropdown"
      class="p-1 rounded-full text-gray-600 hover:text-[#01FBA1] hover:bg-gray-100 focus:outline-none"
      aria-label="Notificações"
    >
      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        <!-- Badge de notificações não lidas -->
        <span 
          v-if="unreadCount > 0" 
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </div>
    </button>
    
    <!-- Dropdown de notificações -->
    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-50 overflow-hidden"
    >
      <div class="p-3 border-b flex justify-between items-center">
        <h3 class="font-semibold text-gray-700">Notificações</h3>
        <div class="flex space-x-2">
          <button 
            v-if="unreadCount > 0"
            @click="markAllAsRead" 
            class="text-xs text-blue-600 hover:text-blue-800"
          >
            Marcar todas como lidas
          </button>
          <button 
            @click="reloadNotifications" 
            class="text-xs text-blue-600 hover:text-blue-800"
            title="Recarregar notificações"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            @click="viewAllNotifications" 
            class="text-xs text-blue-600 hover:text-blue-800"
          >
            Ver todas
          </button>
        </div>
      </div>
      
      <div v-if="isLoading" class="py-4 text-center text-gray-500">
        <svg class="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando notificações...
      </div>
      
      <div v-else-if="error" class="py-4 text-center text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>
      
      <div v-else-if="sortedNotifications.length === 0" class="py-4 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Nenhuma notificação
      </div>
      
      <div v-else class="max-h-80 overflow-y-auto">
        <div 
          v-for="notification in unreadNotifications.slice(0, 5)" 
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors duration-150 bg-blue-50"
        >
          <div class="flex items-start">
            <!-- Ícone baseado no tipo de notificação -->
            <div class="flex-shrink-0 mr-3">
              <div 
                class="h-8 w-8 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-100 text-blue-500': notification.type === 'info' || (!notification.title?.toLowerCase().includes('curtida') && !notification.title?.toLowerCase().includes('comentário') && !notification.title?.toLowerCase().includes('interesse')),
                  'bg-green-100 text-green-500': notification.type === 'success',
                  'bg-yellow-100 text-yellow-500': notification.type === 'warning',
                  'bg-red-100 text-red-500': notification.type === 'error',
                  'bg-pink-100 text-pink-500': notification.title?.toLowerCase().includes('curtida'),
                  'bg-purple-100 text-purple-500': notification.title?.toLowerCase().includes('comentário'),
                  'bg-indigo-100 text-indigo-500': notification.title?.toLowerCase().includes('interesse')
                }"
              >
                <svg v-if="notification.type === 'info' && !notification.title?.toLowerCase().includes('curtida') && !notification.title?.toLowerCase().includes('comentário') && !notification.title?.toLowerCase().includes('interesse')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="notification.title?.toLowerCase().includes('curtida')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <svg v-else-if="notification.title?.toLowerCase().includes('comentário')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <svg v-else-if="notification.title?.toLowerCase().includes('interesse')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            
            <!-- Conteúdo da notificação -->
            <div class="flex-1">
              <div class="flex justify-between">
                <h4 class="text-sm font-semibold text-gray-800">
                  {{ 
                    notification.title?.toLowerCase().includes('curtida') ? 'Curtida' :
                    notification.title?.toLowerCase().includes('comentário') ? 'Comentário' :
                    notification.title?.toLowerCase().includes('interesse') ? 'Interesse' :
                    getTypeName(notification.type)
                  }}
                </h4>
                <span class="text-xs text-gray-500">{{ formatDate(notification.timestamp) }}</span>
              </div>
              <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
              <div v-if="notification.sender" class="text-xs text-gray-500 mt-1">
                De: {{ notification.sender.name }}
              </div>
              <!-- Botão de detalhes -->
              <div class="mt-2 flex justify-end">
                <button 
                  @click.stop="viewNotificationDetails(notification)"
                  class="text-xs text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="unreadNotifications.length > 5" class="p-2 text-center">
          <button 
            @click="viewAllNotifications" 
            class="text-xs text-blue-600 hover:text-blue-800"
          >
            Ver todas as {{ unreadNotifications.length }} notificações não lidas
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de visualização de notificações -->
  <div v-if="showNotificationModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
      <!-- Overlay de fundo com efeito de desfoque -->
      <div 
        class="fixed inset-0 bg-gray-800/60 backdrop-blur-sm transition-opacity" 
        aria-hidden="true" 
        @click="closeNotificationModal"
      ></div>

      <!-- Centralizador do modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Conteúdo do modal -->
      <div 
        class="relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-gray-200"
      >
        <!-- Cabeçalho do modal -->
        <div class="bg-blue-50 px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900 flex items-center justify-between" id="modal-title">
            <span class="flex items-center">
              <span class="mr-2" :class="{
                'text-blue-600': selectedNotification.type === 'info',
                'text-green-600': selectedNotification.type === 'success',
                'text-yellow-600': selectedNotification.type === 'warning',
                'text-red-600': selectedNotification.type === 'error',
                'text-pink-600': selectedNotification.title?.toLowerCase().includes('curtida'),
                'text-purple-600': selectedNotification.title?.toLowerCase().includes('comentário'),
                'text-indigo-600': selectedNotification.title?.toLowerCase().includes('interesse')
              }">
                <svg v-if="selectedNotification.type === 'info' && !selectedNotification.title?.toLowerCase().includes('curtida') && !selectedNotification.title?.toLowerCase().includes('comentário') && !selectedNotification.title?.toLowerCase().includes('interesse')" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="selectedNotification.type === 'success'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="selectedNotification.type === 'warning'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="selectedNotification.type === 'error'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="selectedNotification.title?.toLowerCase().includes('curtida')" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <svg v-else-if="selectedNotification.title?.toLowerCase().includes('comentário')" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <svg v-else-if="selectedNotification.title?.toLowerCase().includes('interesse')" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </span>
              {{ 
                selectedNotification.title?.toLowerCase().includes('curtida') ? 'Curtida em sua publicação' :
                selectedNotification.title?.toLowerCase().includes('comentário') ? 'Comentário em sua publicação' :
                selectedNotification.title?.toLowerCase().includes('interesse') ? 'Interesse em seu imóvel' :
                selectedNotification.title
              }}
            </span>
            <span v-if="selectedNotification.highPriority" class="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
              Importante
            </span>
          </h3>
        </div>
        
        <!-- Corpo do modal -->
        <div class="bg-white px-4 py-5">
          <!-- Informações do remetente e data -->
          <div class="text-sm text-gray-600 flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <div>
              <span class="font-medium">De:</span> 
              <router-link 
                v-if="selectedNotification.sender && selectedNotification.sender.id !== 'system' && !selectedNotification.sender.name?.toLowerCase().includes('sistema')"
                :to="`/instahub/profile/${selectedNotification.sender.id}`"
                class="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {{ selectedNotification.sender?.name }}
              </router-link>
              <span v-else>
                {{ selectedNotification.sender?.name || 'Sistema' }}
              </span>
            </div>
            <div class="text-gray-500">{{ formatDate(selectedNotification.timestamp) }}</div>
          </div>
          
          <!-- Conteúdo da mensagem -->
          <div class="mb-4">
            <p class="text-gray-700 whitespace-pre-line">
              {{ selectedNotification.message }}
            </p>
          </div>
          
          <!-- Status de leitura -->
          <div class="flex items-center">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="selectedNotification.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            >
              <svg v-if="selectedNotification.read" class="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              <svg v-else class="mr-1.5 h-2 w-2 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {{ selectedNotification.read ? 'Lida' : 'Não lida' }}
            </span>
          </div>
        </div>
        
        <!-- Botões de ação -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-3 border-t border-gray-200">
          <button 
            v-if="!selectedNotification.read" 
            type="button" 
            class="h-10 inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="markSelectedNotificationAsRead"
          >
            Marcar como lida
          </button>
          <button 
            type="button" 
            class="h-10 inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#01FBA1] text-sm font-medium text-[#012928] hover:bg-[#00e090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
            @click="closeNotificationModal"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/notifications/notificationStore';
import { useAuthStore } from '../../stores/auth';
import type { Notification } from '../../services/notifications/notificationService';

// Refs
const isOpen = ref(false);
const notificationRef = ref<HTMLElement | null>(null);
const router = useRouter();
const showNotificationModal = ref(false);
const selectedNotification = ref<Notification | null>(null);

// Store
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { 
  markAsRead, 
  markAllAsRead: markAllAsReadAction,
  reloadNotifications
} = notificationStore;

// Computed properties do store
const sortedNotifications = computed(() => notificationStore.sortedNotifications);
const unreadNotifications = computed(() => sortedNotifications.value.filter(notification => !notification.read));
const unreadCount = computed(() => unreadNotifications.value.length);
const isLoading = computed(() => notificationStore.isLoading);
const error = computed(() => notificationStore.error);

// Métodos
const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  
  // Se abrir o dropdown, recarregar as notificações
  if (isOpen.value) {
    try {
      console.log('Recarregando notificações ao abrir dropdown');
      await reloadNotifications();
      console.log('Notificações recarregadas:', notificationStore.sortedNotifications);
    } catch (error) {
      console.error('Erro ao recarregar notificações:', error);
    }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const handleNotificationClick = async (notification: Notification) => {
  // Marcar como lida
  if (!notification.read && notification.id) {
    try {
      console.log('Marcando notificação como lida:', notification.id);
      await markAsRead(notification.id);
      console.log('Notificação marcada como lida com sucesso');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }
  
  // Fechar o dropdown
  isOpen.value = false;
};

const markAllAsRead = async () => {
  try {
    console.log('Marcando todas as notificações como lidas');
    await markAllAsReadAction();
    console.log('Todas as notificações marcadas como lidas com sucesso');
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
  }
};

const viewAllNotifications = () => {
  router.push('/notifications');
  isOpen.value = false;
};

const viewNotificationDetails = (notification: Notification) => {
  console.log('Visualizando detalhes da notificação:', notification);
  selectedNotification.value = notification;
  showNotificationModal.value = true;
};

const closeNotificationModal = () => {
  showNotificationModal.value = false;
  selectedNotification.value = null;
};

const markSelectedNotificationAsRead = async () => {
  if (selectedNotification.value && !selectedNotification.value.read) {
    try {
      console.log('Marcando notificação como lida:', selectedNotification.value.id);
      await markAsRead(selectedNotification.value.id);
      console.log('Notificação marcada como lida com sucesso');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }
};

// Formatar data
const formatDate = (timestamp: Date | any) => {
  if (!timestamp) return '';
  
  // Converter para Date se for um Timestamp do Firestore
  const date = timestamp.toDate ? timestamp.toDate() : timestamp;
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Menos de 1 minuto
  if (diff < 60 * 1000) {
    return 'Agora';
  }
  
  // Menos de 1 hora
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} min atrás`;
  }
  
  // Menos de 24 horas
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h atrás`;
  }
  
  // Menos de 7 dias
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d atrás`;
  }
  
  // Formato de data normal
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

// Obter nome do tipo
const getTypeName = (type: string) => {
  const typeNames: Record<string, string> = {
    'info': 'Informação',
    'success': 'Sucesso',
    'warning': 'Aviso',
    'error': 'Erro',
    'like': 'Curtida',
    'comment': 'Comentário',
    'interest': 'Interesse'
  };
  
  return typeNames[type] || type;
};

onMounted(async () => {
  console.log('Montando componente NotificationBell');
  
  // Verificar se o authStore está inicializado
  console.log('AuthStore no NotificationBell:', authStore);
  console.log('Usuário autenticado no NotificationBell:', authStore.user);
  
  // Verificar todas as propriedades do objeto de usuário
  if (authStore.user) {
    console.log('Propriedades do objeto de usuário:', Object.keys(authStore.user));
    console.log('authStore.user.uid:', authStore.user.uid);
    console.log('authStore.user.id:', authStore.user.id);
    console.log('authStore.user.email:', authStore.user.email);
    console.log('authStore.user.displayName:', authStore.user.displayName);
    console.log('authStore.user.role:', authStore.user.role);
  }
  
  try {
    // Recarregar notificações usando o método do store
    await reloadNotifications();
    console.log('Notificações carregadas no sininho:', sortedNotifications.value);
  } catch (error) {
    console.error('Erro ao carregar notificações no sininho:', error);
  }
  
  // Adicionar listener para cliques fora do componente
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
