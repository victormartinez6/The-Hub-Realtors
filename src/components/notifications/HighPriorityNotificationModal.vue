<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Fundo desfocado -->
        <div 
          class="absolute inset-0 bg-black/40 backdrop-blur-md"
          @click.self="handleBackdropClick"
        ></div>
        
        <!-- Modal com efeito de vidro -->
        <div 
          class="relative w-full max-w-2xl mx-4 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20"
          style="max-height: 90vh; overflow-y: auto;"
        >
          <!-- Cabeçalho -->
          <div class="text-center mb-6">
            <div class="flex justify-center mb-4">
              <div class="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Notificação de Extrema Importância</h2>
            <p class="text-gray-600 mt-2">
              Você tem notificações que requerem sua atenção imediata. O sistema permanecerá bloqueado até que você confirme a leitura.
            </p>
          </div>
          
          <!-- Lista de notificações -->
          <div class="space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              class="p-4 bg-white/80 rounded-lg border border-red-200 shadow-sm"
            >
              <div class="flex items-start">
                <!-- Ícone baseado no tipo -->
                <div 
                  class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3"
                  :class="{
                    'bg-blue-100 text-blue-600': notification.type === 'info',
                    'bg-green-100 text-green-600': notification.type === 'success',
                    'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                    'bg-red-100 text-red-600': notification.type === 'error',
                    'bg-pink-100 text-pink-600': notification.type === 'like',
                    'bg-purple-100 text-purple-600': notification.type === 'comment',
                    'bg-indigo-100 text-indigo-600': notification.type === 'interest'
                  }"
                >
                  <svg v-if="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                
                <!-- Conteúdo da notificação -->
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <h3 class="font-semibold text-gray-800">{{ notification.title }}</h3>
                    <span class="text-xs text-gray-500">{{ formatDate(notification.timestamp) }}</span>
                  </div>
                  <p class="text-gray-600 mt-1">{{ notification.message }}</p>
                  <div class="mt-2 text-xs text-gray-500">
                    De: {{ notification.sender ? notification.sender.name : 'Sistema' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Botões de ação -->
          <div class="flex justify-center">
            <button 
              @click="markAllAsReadAndClose" 
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
            >
              Confirmar Leitura e Continuar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/notifications/notificationStore';
import type { Notification } from '../../services/notifications/notificationService';

// Props
defineProps<{
  show: boolean;
  notifications: Notification[];
}>();

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'markAsRead'): void;
}>();

// Router
const router = useRouter();

// Store
const notificationStore = useNotificationStore();

// Métodos
const markAllAsReadAndClose = async () => {
  try {
    await notificationStore.markAllAsRead();
    emit('markAsRead');
    emit('close');
    
    // Redirecionar para a página de notificações após confirmar a leitura
    router.push('/notifications');
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
  }
};

// Função não é mais necessária, pois o redirecionamento ocorre no markAllAsReadAndClose
// Mantida apenas para compatibilidade, caso seja chamada de outro lugar
const viewAllNotifications = () => {
  router.push('/notifications');
  emit('close');
};

const handleBackdropClick = () => {
  // Não permitir fechar o modal clicando fora
  // Apenas para fins de UX, mostrar um efeito visual
  const modal = document.querySelector('.bg-white/90');
  if (modal) {
    modal.classList.add('animate-shake');
    setTimeout(() => {
      modal.classList.remove('animate-shake');
    }, 500);
  }
};

// Formatar data
const formatDate = (timestamp: Date | any) => {
  if (!timestamp) return '';
  
  try {
    // Converter para Date se for um Timestamp do Firestore
    const date = timestamp instanceof Date 
      ? timestamp 
      : (timestamp && timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
    
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
  } catch (err) {
    console.error('Erro ao formatar data:', err, timestamp);
    return 'Data inválida';
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
</style>
