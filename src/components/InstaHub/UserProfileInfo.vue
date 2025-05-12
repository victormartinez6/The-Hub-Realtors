<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01FBA1]"></div>
    </div>
    <!-- Erro -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
      <strong class="font-bold">Erro!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    <!-- Perfil -->
    <div v-else>
      <!-- Dados do perfil -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6">
        <div v-if="!isEditing" class="flex items-center">
          <img :src="sanitizeUrl(userProfile.avatar)" alt="Foto de Perfil" class="w-24 h-24 rounded-full object-cover border-4 border-[#01FBA1] mr-6" />
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-1">{{ userProfile.name || 'Sem nome' }}</h1>
            <p class="text-sm text-gray-500 mb-3">{{ userProfile.role || 'Sem função' }}</p>
            <p v-if="userProfile.bio" class="text-gray-700 mb-4">{{ userProfile.bio }}</p>
            <p v-else class="text-gray-400 italic mb-4">Sem bio cadastrada.</p>
            
            <!-- Informações de contato -->
            <div class="flex flex-col gap-3 mt-4">
              <div v-if="userProfile.website" class="flex items-center gap-2 text-sm">
                <!-- Ícone do Website -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <a :href="userProfile.website.startsWith('http') ? userProfile.website : 'https://' + userProfile.website" 
                   target="_blank" 
                   class="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200">
                  {{ userProfile.website }}
                </a>
              </div>
              <div v-if="userProfile.phone" class="flex items-center gap-2 text-sm">
                <!-- Ícone do WhatsApp -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <a :href="`https://wa.me/${userProfile.phone.replace(/\D/g, '')}`" 
                   target="_blank" 
                   class="text-gray-700 hover:text-green-600 hover:underline transition-colors duration-200">
                  {{ userProfile.phone }}
                </a>
              </div>
              <div v-if="userProfile.email" class="flex items-center gap-2 text-sm">
                <!-- Ícone do Email -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <a :href="`mailto:${userProfile.email}`" 
                   class="text-gray-700 hover:text-blue-600 hover:underline transition-colors duration-200">
                  {{ userProfile.email }}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modo de Edição -->
        <div v-else class="space-y-4">
          <div class="flex items-center mb-4">
            <img :src="sanitizeUrl(editedProfile.avatar)" alt="Foto de Perfil" class="w-24 h-24 rounded-full object-cover border-4 border-[#01FBA1] mr-6" />
            <div class="flex-1">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  id="name" 
                  v-model="editedProfile.name" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                />
              </div>
              
              <div class="mt-3">
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <input 
                  id="role" 
                  v-model="editedProfile.role" 
                  type="text" 
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1] bg-gray-100"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea 
              id="bio" 
              v-model="editedProfile.bio" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
            ></textarea>
          </div>
          
          <!-- Campos de contato -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="website" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <input 
                  id="website" 
                  v-model="editedProfile.website" 
                  type="url" 
                  placeholder="https://seusite.com"
                  class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                />
              </div>
            </div>
            
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp com DDI)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <input 
                  id="phone" 
                  v-model="editedProfile.phone" 
                  type="tel" 
                  placeholder="+55 (11) 98765-4321"
                  class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                />
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input 
                  id="email" 
                  v-model="editedProfile.email" 
                  type="email" 
                  placeholder="seu@email.com"
                  class="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
                />
              </div>
            </div>
          </div>
          
          <div v-if="editedProfile.role === 'Corretor'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="propertiesSold" class="block text-sm font-medium text-gray-700 mb-1">Imóveis Vendidos</label>
              <input 
                id="propertiesSold" 
                v-model.number="editedProfile.propertiesSold" 
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
              />
            </div>
            
            <div>
              <label for="clientsCount" class="block text-sm font-medium text-gray-700 mb-1">Clientes</label>
              <input 
                id="clientsCount" 
                v-model.number="editedProfile.clientsCount" 
                type="number" 
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#01FBA1] focus:border-[#01FBA1]"
              />
            </div>
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button 
              @click="save" 
              class="flex-1 bg-[#451A37] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#733F63] transition-colors duration-200 focus:outline-none"
            >
              Salvar Alterações
            </button>
            <button 
              @click="cancel" 
              class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  editedProfile: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['startEditing', 'cancelEditing', 'saveProfile']);

// Função utilitária para sanitizar URLs de imagem
function sanitizeUrl(url?: string) {
  return url || '';
}

function save() {
  emit('saveProfile');
}

function cancel() {
  emit('cancelEditing');
}
</script>
