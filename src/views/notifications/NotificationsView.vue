<template>
  <div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Cabeçalho -->
      <div class="p-4 border-b flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-800">Histórico de Notificações</h1>
        <div class="flex space-x-2">
          <button 
            v-if="unreadCount > 0 && activeTab === 'received'"
            @click="markAllAsRead" 
            class="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
          >
            Marcar todas como lidas
          </button>
          <button 
            @click="refreshNotifications" 
            class="px-3 py-1 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center"
            :disabled="isLoading"
          >
            <span class="mr-1" :class="{ 'animate-spin': isLoading }">↻</span>
            Atualizar
          </button>
        </div>
      </div>
      
      <!-- Abas -->
      <div class="border-b">
        <div class="flex">
          <button 
            @click="switchTab('received')" 
            class="px-6 py-3 text-sm font-medium transition-colors"
            :class="activeTab === 'received' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-gray-500 hover:text-gray-700'"
          >
            Recebidas
            <span v-if="sortedNotifications.length > 0" class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              {{ sortedNotifications.length }}
            </span>
          </button>
          <button 
            @click="switchTab('sent')" 
            class="px-6 py-3 text-sm font-medium transition-colors"
            :class="activeTab === 'sent' ? 'text-blue-600 border-b-2 border-blue-500 font-bold' : 'text-gray-500 hover:text-gray-700'"
          >
            Enviadas
            <span v-if="sortedSentNotifications.length > 0" class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              {{ sortedSentNotifications.length }}
            </span>
          </button>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="py-20 text-center text-gray-500">
        <svg class="animate-spin h-10 w-10 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Carregando notificações...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="py-20 text-center text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{{ error }}</p>
        <button 
          @click="loadNotifications" 
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
      
      <!-- Empty state para notificações recebidas -->
      <div v-else-if="activeTab === 'received' && sortedNotifications.length === 0" class="py-20 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>Você não tem notificações recebidas</p>
      </div>
      
      <!-- Empty state para notificações enviadas -->
      <div v-else-if="activeTab === 'sent' && sortedSentNotifications.length === 0" class="py-20 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <p>Você não enviou nenhuma notificação</p>
      </div>
      
      <!-- Tabela de notificações recebidas -->
      <div v-else-if="activeTab === 'received'">
        <!-- Notificações do Sistema -->
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Notificações do Sistema</h2>
          <div v-if="systemNotifications.length === 0" class="py-4 text-center text-gray-500">
            <p>Nenhuma notificação do sistema.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remetente
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="notification in paginatedSystemNotifications" 
                  :key="notification.id"
                  :class="{ 'bg-blue-50': !notification.read }"
                >
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
                        'bg-red-100 text-red-800': notification.type === 'error'
                      }"
                    >
                      {{ 
                        notification.type === 'info' ? 'Informação' : 
                        notification.type === 'success' ? 'Sucesso' : 
                        notification.type === 'warning' ? 'Aviso' : 
                        notification.type === 'error' ? 'Erro' : notification.type
                      }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ notification.sender ? notification.sender.name : 'Sistema' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                      <span 
                        v-if="!notification.read" 
                        class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"
                      ></span>
                      {{ notification.title }}
                      <span v-if="notification.highPriority" class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                        Importante
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <div class="flex items-center">
                      <div class="max-w-xs truncate relative group">
                        {{ notification.message }}
                        <div class="cursor-help inline-block ml-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <!-- Tooltip -->
                        <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 absolute z-50 mt-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg p-4 max-w-md max-h-60 overflow-y-auto transform -translate-y-full top-0 left-0">
                          <p class="whitespace-normal">{{ notification.message }}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2 justify-end">
                      <button 
                        v-if="!notification.read"
                        @click="markAsRead(notification.id!)" 
                        class="text-green-600 hover:text-green-900"
                      >
                        Marcar como lida
                      </button>
                      <span v-else class="text-gray-400">Lida</span>
                      
                      <button 
                        @click="viewNotificationDetails(notification)"
                        class="text-indigo-600 hover:text-indigo-900 ml-3"
                      >
                        Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Paginação para notificações do sistema -->
          <div v-if="systemNotifications.length > 0" class="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div class="flex-1 flex justify-between">
              <button 
                @click="changePage('system', systemPage - 1)" 
                :disabled="systemPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                :class="{ 'opacity-50 cursor-not-allowed': systemPage === 1 }"
              >
                Anterior
              </button>
              <div class="text-sm text-gray-700">
                Página {{ systemPage }} de {{ totalSystemPages || 1 }}
              </div>
              <button 
                @click="changePage('system', systemPage + 1)" 
                :disabled="systemPage === totalSystemPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                :class="{ 'opacity-50 cursor-not-allowed': systemPage === totalSystemPages }"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
        
        <!-- Notificações InstaHub -->
        <div class="p-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Notificações InstaHub</h2>
          <div v-if="instaHubNotifications.length === 0" class="py-4 text-center text-gray-500">
            <p>Nenhuma notificação do InstaHub.</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remetente
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="notification in paginatedInstaHubNotifications" 
                  :key="notification.id"
                  :class="{ 'bg-blue-50': !notification.read }"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(notification.timestamp) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-pink-100 text-pink-800': notification.title?.toLowerCase().includes('curtida'),
                        'bg-purple-100 text-purple-800': notification.title?.toLowerCase().includes('comentário'),
                        'bg-indigo-100 text-indigo-800': notification.title?.toLowerCase().includes('interesse')
                      }"
                    >
                      {{ 
                        notification.title?.toLowerCase().includes('curtida') ? 'Curtida' :
                        notification.title?.toLowerCase().includes('comentário') ? 'Comentário' :
                        notification.title?.toLowerCase().includes('interesse') ? 'Interesse' : notification.type
                      }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <!-- Link para o perfil do remetente no InstaHub (quando não for sistema) -->
                    <router-link 
                      v-if="notification.sender && notification.sender.id !== 'system' && !notification.sender.name?.toLowerCase().includes('sistema')"
                      :to="`/instahub/profile/${notification.sender.id}`"
                      class="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {{ notification.sender.name }} <span class="text-xs">(ver perfil)</span>
                    </router-link>
                    <span v-else>
                      {{ notification.sender ? notification.sender.name : 'Sistema' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                      <span 
                        v-if="!notification.read" 
                        class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"
                      ></span>
                      {{ notification.title }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <div class="flex items-center">
                      <div class="max-w-xs truncate relative group">
                        {{ notification.message }}
                        <div class="cursor-help inline-block ml-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <!-- Tooltip -->
                        <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 absolute z-50 mt-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg p-4 max-w-md max-h-60 overflow-y-auto transform -translate-y-full top-0 left-0">
                          <p class="whitespace-normal">{{ notification.message }}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2 justify-end">
                      <button 
                        v-if="!notification.read"
                        @click="markAsRead(notification.id!)" 
                        class="text-green-600 hover:text-green-900"
                      >
                        Marcar como lida
                      </button>
                      <span v-else class="text-gray-400">Lida</span>
                      
                      <button 
                        @click="viewNotificationDetails(notification)"
                        class="text-indigo-600 hover:text-indigo-900 ml-3"
                      >
                        Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Paginação para notificações InstaHub -->
          <div v-if="instaHubNotifications.length > 0" class="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div class="flex-1 flex justify-between">
              <button 
                @click="changePage('instahub', instaHubPage - 1)" 
                :disabled="instaHubPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                :class="{ 'opacity-50 cursor-not-allowed': instaHubPage === 1 }"
              >
                Anterior
              </button>
              <div class="text-sm text-gray-700">
                Página {{ instaHubPage }} de {{ totalInstaHubPages || 1 }}
              </div>
              <button 
                @click="changePage('instahub', instaHubPage + 1)" 
                :disabled="instaHubPage === totalInstaHubPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                :class="{ 'opacity-50 cursor-not-allowed': instaHubPage === totalInstaHubPages }"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabela de notificações enviadas -->
      <div v-else-if="activeTab === 'sent'">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinatário
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensagem
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="notification in paginatedSentNotifications" :key="notification.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(notification.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
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
                    {{ getTypeName(notification.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ notification.recipient && notification.recipient.id ? 'Usuário específico' : 
                     (notification.recipient && notification.recipient.role ? 
                      (notification.recipient.role === 'all' ? 'Todos os usuários' : 
                       `Todos os ${getRoleName(notification.recipient.role)}`) : 'Desconhecido') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ getTypeName(notification.type) }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex items-center">
                    <div class="max-w-xs truncate relative group">
                      {{ notification.message }}
                      <div class="cursor-help inline-block ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <!-- Tooltip -->
                      <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 absolute z-50 mt-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg p-4 max-w-md max-h-60 overflow-y-auto transform -translate-y-full top-0 left-0">
                        <p class="whitespace-normal">{{ notification.message }}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="viewNotificationDetails(notification)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginação para notificações enviadas -->
        <div v-if="sortedSentNotifications.length > 0" class="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="flex-1 flex justify-between">
            <button 
              @click="changePage('sent', sentPage - 1)" 
              :disabled="sentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': sentPage === 1 }"
            >
              Anterior
            </button>
            <div class="text-sm text-gray-700">
              Página {{ sentPage }} de {{ totalSentPages || 1 }}
            </div>
            <button 
              @click="changePage('sent', sentPage + 1)" 
              :disabled="sentPage === totalSentPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': sentPage === totalSentPages }"
            >
              Próxima
            </button>
          </div>
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
        :class="{'animate-shake': isShaking}"
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
                'text-pink-600': selectedNotification.type === 'like',
                'text-purple-600': selectedNotification.type === 'comment',
                'text-indigo-600': selectedNotification.type === 'interest'
              }">
                <svg v-if="selectedNotification.type === 'info'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <svg v-else-if="selectedNotification.type === 'like'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <svg v-else-if="selectedNotification.type === 'comment'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <svg v-else-if="selectedNotification.type === 'interest'" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
              {{ 
                selectedNotification.title === 'Nova curtida em seu post' ? 'Curtida em sua publicação' :
                selectedNotification.title === 'Novo comentário em seu post' ? 'Comentário em sua publicação' :
                selectedNotification.title === 'Novo interesse em seu imóvel' ? 'Interesse em seu imóvel' :
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
              <a 
                v-if="selectedNotification.sender && selectedNotification.sender.id !== 'system' && !selectedNotification.sender.name?.toLowerCase().includes('sistema')"
                :href="`/instahub/profile/${selectedNotification.sender.id}`"
                class="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {{ selectedNotification.sender?.name }}
              </a>
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
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
          <button 
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#012928] text-base font-medium text-white hover:bg-[#023e3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928] sm:ml-3 sm:w-auto sm:text-sm"
            @click="closeNotificationModal"
          >
            Fechar
          </button>
          <button 
            v-if="!selectedNotification.read" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            @click="markSelectedNotificationAsRead"
          >
            Marcar como lida
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, nextTick } from 'vue';
  import { useNotificationStore } from '../../stores/notifications/notificationStore';
  import { storeToRefs } from 'pinia';
  
  // Estado local
  const activeTab = ref('received');
  const receivedPage = ref(1);
  const sentPage = ref(1);
  const itemsPerPage = ref(5); 
  const showNotificationModal = ref(false);
  const selectedNotification = ref<any>({
    id: '',
    title: '',
    message: '',
    timestamp: null,
    read: false,
    type: 'info',
    highPriority: false,
    sender: { id: '', name: '', role: '' },
    recipient: { id: '', role: '' }
  });
  const isShaking = ref(false);
  const systemPage = ref(1);
  const instaHubPage = ref(1);

  // Store de notificações
  const notificationStore = useNotificationStore();
  const { 
    sortedNotifications, 
    sortedSentNotifications,
    unreadCount, 
    isLoading, 
    error 
  } = storeToRefs(notificationStore);
  const { loadNotifications, markAsRead, markAllAsRead } = notificationStore;

  // Notificações paginadas
  const paginatedSystemNotifications = computed(() => {
    console.log('Recalculando paginatedSystemNotifications, página atual:', systemPage.value);
    
    // Abordagem simplificada: dividir as notificações em páginas de tamanho fixo
    const allNotifications = [...systemNotifications.value];
    
    // Ordenar para que as não lidas apareçam primeiro
    allNotifications.sort((a, b) => {
      if (a.read === b.read) return 0;
      return a.read ? 1 : -1;
    });
    
    // Calcular o índice de início e fim para a página atual
    const startIndex = (systemPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    
    // Retornar as notificações para a página atual
    return allNotifications.slice(startIndex, endIndex);
  });

  const paginatedInstaHubNotifications = computed(() => {
    console.log('Recalculando paginatedInstaHubNotifications, página atual:', instaHubPage.value);
    
    // Abordagem simplificada: dividir as notificações em páginas de tamanho fixo
    const allNotifications = [...instaHubNotifications.value];
    
    // Ordenar para que as não lidas apareçam primeiro
    allNotifications.sort((a, b) => {
      if (a.read === b.read) return 0;
      return a.read ? 1 : -1;
    });
    
    // Calcular o índice de início e fim para a página atual
    const startIndex = (instaHubPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    
    // Retornar as notificações para a página atual
    return allNotifications.slice(startIndex, endIndex);
  });

  const paginatedSentNotifications = computed(() => {
    // Calcular o índice de início e fim para a página atual
    const startIndex = (sentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    
    // Retornar as notificações para a página atual
    return sortedSentNotifications.value.slice(startIndex, endIndex);
  });

  // Total de páginas
  const totalSystemPages = computed(() => {
    return Math.max(1, Math.ceil(systemNotifications.value.length / itemsPerPage.value));
  });

  const totalInstaHubPages = computed(() => {
    return Math.max(1, Math.ceil(instaHubNotifications.value.length / itemsPerPage.value));
  });

  const totalSentPages = computed(() => {
    return Math.max(1, Math.ceil(sortedSentNotifications.value.length / itemsPerPage.value));
  });

  // Computed properties para filtrar as notificações
  const systemNotifications = computed(() => {
    return sortedNotifications.value.filter(notification => 
      !(notification.title?.toLowerCase().includes('curtida') || 
        notification.title?.toLowerCase().includes('interesse') || 
        notification.title?.toLowerCase().includes('comentário'))
    );
  });

  const instaHubNotifications = computed(() => {
    return sortedNotifications.value.filter(notification => 
      notification.title?.toLowerCase().includes('curtida') || 
      notification.title?.toLowerCase().includes('interesse') || 
      notification.title?.toLowerCase().includes('comentário')
    );
  });

  // Carregar notificações ao montar o componente
  onMounted(() => {
    loadNotifications();
  });

  // Função para atualizar notificações
  const refreshNotifications = () => {
    if (activeTab.value === 'received') {
      receivedPage.value = 1;
    } else {
      sentPage.value = 1;
    }
    loadNotifications();
  };

  // Função para trocar de aba
  const switchTab = (tab: string) => {
    activeTab.value = tab;
    if (tab === 'received') {
      receivedPage.value = 1;
    } else {
      sentPage.value = 1;
    }
  };

  // Obter nome do papel
  const getRoleName = (role?: string) => {
    if (!role) return '';
    
    const roleNames: Record<string, string> = {
      'super_admin': 'Super Administradores',
      'admin': 'Administradores',
      'broker': 'Corretores',
      'realtor': 'Agentes',
      'partner': 'Parceiros',
      'user': 'Usuários',
      'all': 'Todos'
    };
    
    return roleNames[role] || role;
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

  // Formatar data
  const formatDate = (timestamp: Date | any) => {
    if (!timestamp) return '';
    
    try {
      // Converter para Date se for um Timestamp do Firestore
      const date = timestamp.toDate ? timestamp.toDate() : 
                   timestamp instanceof Date ? timestamp : 
                   new Date(timestamp);
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função para visualizar detalhes da notificação
  const viewNotificationDetails = (notification: any) => {
    selectedNotification.value = notification;
    showNotificationModal.value = true;
  };

  // Função para fechar o modal
  const closeNotificationModal = () => {
    showNotificationModal.value = false;
    // Pequeno delay para permitir a animação de fechamento
    setTimeout(() => {
      selectedNotification.value = {
        id: '',
        title: '',
        message: '',
        timestamp: null,
        read: false,
        type: 'info',
        highPriority: false,
        sender: { id: '', name: '', role: '' },
        recipient: { id: '', role: '' }
      };
    }, 300);
  };

  // Função para marcar a notificação selecionada como lida
  const markSelectedNotificationAsRead = () => {
    markAsRead(selectedNotification.value.id!);
    selectedNotification.value.read = true;
    
    // Efeito visual para confirmar a ação
    isShaking.value = true;
    setTimeout(() => {
      isShaking.value = false;
    }, 500);
  };

  // Função para mudar de página
  const changePage = (type: string, newPage: number) => {
    console.log(`Mudando página de ${type} para ${newPage}`);
    
    // Verificar se a página é válida
    if (type === 'system') {
      if (newPage >= 1 && newPage <= totalSystemPages.value) {
        systemPage.value = newPage;
      }
    } else if (type === 'instahub') {
      if (newPage >= 1 && newPage <= totalInstaHubPages.value) {
        instaHubPage.value = newPage;
      }
    } else if (type === 'sent') {
      if (newPage >= 1 && newPage <= totalSentPages.value) {
        sentPage.value = newPage;
      }
    }
    
    // Forçar a atualização das notificações paginadas
    nextTick(() => {
      console.log(`Página atualizada para ${type}: ${newPage}`);
    });
  };
</script>

<style scoped>
  .animate-shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }

  @keyframes shake {
    10%, 90% {
      transform: translate3d(-1px, 0, 0);
    }
    
    20%, 80% {
      transform: translate3d(2px, 0, 0);
    }

    30%, 50%, 70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%, 60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>
