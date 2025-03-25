<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Criar Novo Post</h2>
    
    <!-- Formulário de criação de post -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Upload de imagem -->
      <div class="space-y-2">
        <label for="media-upload" class="block text-sm font-medium text-gray-700">
          Imagens e Vídeos do Post
        </label>
        
        <!-- Área de upload -->
        <div 
          class="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          :class="{ 'border-[#01FBA1]': mediaFiles.length > 0 }"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput"
            type="file" 
            id="media-upload" 
            accept="image/*,video/*" 
            class="hidden"
            @change="handleMediaChange" 
            multiple
          />
          
          <!-- Preview das mídias (carrossel) -->
          <div v-if="mediaFiles.length > 0" class="mb-3">
            <!-- Controles do carrossel -->
            <div class="relative max-w-lg mx-auto">
              <!-- Imagens/Vídeos -->
              <div class="overflow-hidden rounded-lg shadow-sm">
                <div class="relative">
                  <!-- Imagem -->
                  <img 
                    v-if="mediaFiles[currentMediaIndex].type.includes('image')"
                    :src="mediaFiles[currentMediaIndex].preview" 
                    alt="Preview" 
                    class="max-h-64 w-full object-contain mx-auto rounded-lg" 
                  />
                  <!-- Vídeo -->
                  <video 
                    v-else-if="mediaFiles[currentMediaIndex].type.includes('video')"
                    :src="mediaFiles[currentMediaIndex].preview" 
                    controls
                    class="max-h-64 w-full mx-auto rounded-lg"
                  ></video>
                  
                  <!-- Indicadores de quantidade -->
                  <div class="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    {{ currentMediaIndex + 1 }} / {{ mediaFiles.length }}
                  </div>
                </div>
              </div>
              
              <!-- Botões de navegação (apenas se houver mais de uma mídia) -->
              <div v-if="mediaFiles.length > 1" class="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-2">
                <button 
                  type="button" 
                  @click.stop="prevMedia" 
                  class="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  type="button" 
                  @click.stop="nextMedia" 
                  class="bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <!-- Miniaturas das mídias -->
              <div v-if="mediaFiles.length > 1" class="flex justify-center mt-2 space-x-1 overflow-x-auto">
                <button 
                  v-for="(media, index) in mediaFiles" 
                  :key="index"
                  type="button"
                  @click.stop="currentMediaIndex = index"
                  class="w-10 h-10 rounded-md overflow-hidden focus:outline-none"
                  :class="{ 'ring-2 ring-[#01FBA1]': currentMediaIndex === index }"
                >
                  <img 
                    v-if="media.type.includes('image')"
                    :src="media.preview" 
                    alt="Thumbnail" 
                    class="w-full h-full object-cover" 
                  />
                  <div 
                    v-else
                    class="w-full h-full bg-gray-800 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Texto de instrução -->
          <div v-if="mediaFiles.length === 0" class="py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">
              Clique para selecionar imagens ou vídeos (ou arraste e solte aqui)
            </p>
            <p class="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, MP4 até 10MB (máximo 5 arquivos)
            </p>
          </div>
          
          <!-- Botões para gerenciar mídias -->
          <div v-if="mediaFiles.length > 0" class="mt-2 flex justify-center space-x-2">
            <!-- Botão para adicionar mais mídias -->
            <button 
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
              @click.stop="triggerFileInput"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar mais
            </button>
            
            <!-- Botão para remover mídia atual -->
            <button 
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white rounded-md border border-gray-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              @click.stop="removeCurrentMedia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remover
            </button>
            
            <!-- Botão para limpar todas as mídias -->
            <button 
              type="button"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1]"
              @click.stop="resetMedia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpar tudo
            </button>
          </div>
        </div>
      </div>
      
      <!-- Campo de legenda -->
      <div class="space-y-2">
        <label for="caption" class="block text-sm font-medium text-gray-700">
          Legenda
        </label>
        <div class="relative">
          <textarea 
            id="caption" 
            v-model="caption" 
            rows="4" 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring focus:ring-[#01FBA1] focus:ring-opacity-50"
            placeholder="Escreva uma legenda para seu post..."
          ></textarea>
          
          <!-- Botão de emojis -->
          <button 
            type="button" 
            class="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            @click="toggleEmojiPicker"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <!-- Seletor de emojis -->
          <div 
            v-if="showEmojiPicker" 
            class="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10"
          >
            <div class="grid grid-cols-8 gap-1">
              <button 
                v-for="emoji in emojis" 
                :key="emoji" 
                type="button"
                class="w-8 h-8 text-xl hover:bg-gray-100 rounded focus:outline-none"
                @click="addEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Campo de categoria -->
      <div class="space-y-2">
        <label for="category" class="block text-sm font-medium text-gray-700">
          Categoria
        </label>
        <select 
          id="category" 
          v-model="selectedCategory" 
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring focus:ring-[#01FBA1] focus:ring-opacity-50"
        >
          <option 
            v-for="category in categories" 
            :key="category" 
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
      
      <!-- Botão de publicar -->
      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#012928] bg-[#01FBA1] hover:bg-[#01FBA1]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01FBA1] disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !isFormValid"
        >
          <svg 
            v-if="isLoading" 
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#012928]" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Publicando...' : 'Publicar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useInstaHubStore } from '../stores/instaHubStore';
import instaHubService, { MediaFile } from '../services/instaHubService';

// Store do InstaHub
const instaHubStore = useInstaHubStore();

// Estado do componente
const fileInput = ref<HTMLInputElement | null>(null);
const mediaFiles = ref<Array<{ file: File, preview: string, type: string }>>([]);
const currentMediaIndex = ref(0);
const caption = ref('');
const isLoading = ref(false);
const showEmojiPicker = ref(false);
const emojiPickerRef = ref<HTMLElement | null>(null);
const selectedCategory = ref('Imóveis à Venda');
const error = ref<string | null>(null);

// Lista de emojis
const emojis = ['😊', '👍', '🔥', '❤️', '🏠', '🏢', '🌆', '🌇', '🏙️', '🏘️', '🏗️', '🏛️', '🏚️', '🏡', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💰', '💵', '🔑', '🗝️'];

// Validação do formulário
const isFormValid = computed(() => {
  return mediaFiles.value.length > 0 && caption.value.trim() !== '';
});

// Categorias disponíveis
const categories = computed(() => instaHubStore.categories.filter(cat => cat !== 'Todos'));

// Métodos
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleMediaChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    // Limitar a 5 arquivos no total
    const remainingSlots = 5 - mediaFiles.value.length;
    const filesToAdd = Array.from(target.files).slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      alert('Você já atingiu o limite máximo de 5 arquivos.');
      return;
    }
    
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const type = file.type;
        mediaFiles.value.push({ file, preview, type });
      };
      reader.readAsDataURL(file);
    });
  }
};

const resetMedia = () => {
  mediaFiles.value = [];
  currentMediaIndex.value = 0;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const removeCurrentMedia = () => {
  mediaFiles.value.splice(currentMediaIndex.value, 1);
  if (mediaFiles.value.length === 0) {
    currentMediaIndex.value = 0;
  } else if (currentMediaIndex.value >= mediaFiles.value.length) {
    currentMediaIndex.value = mediaFiles.value.length - 1;
  }
};

const prevMedia = () => {
  if (currentMediaIndex.value > 0) {
    currentMediaIndex.value--;
  }
};

const nextMedia = () => {
  if (currentMediaIndex.value < mediaFiles.value.length - 1) {
    currentMediaIndex.value++;
  }
};

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const addEmoji = (emoji: string) => {
  caption.value += emoji;
  showEmojiPicker.value = false;
};

const handleSubmit = async () => {
  try {
    if (!isFormValid.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    // Upload de todas as mídias para o Firebase Storage
    const uploadedMediaFiles: MediaFile[] = [];
    
    for (const media of mediaFiles.value) {
      const uploadedMedia = await instaHubService.uploadMedia(media.file);
      uploadedMediaFiles.push(uploadedMedia);
    }
    
    // Criar o post usando a store
    await instaHubStore.createPost(
      caption.value,
      uploadedMediaFiles,
      selectedCategory.value
    );
    
    // Limpar formulário
    resetMedia();
    caption.value = '';
    
    // Notificar usuário
    alert('Post publicado com sucesso!');
    
  } catch (err) {
    console.error('Erro ao publicar post:', err);
    error.value = err instanceof Error ? err.message : 'Ocorreu um erro ao publicar o post. Tente novamente.';
    alert(error.value);
  } finally {
    isLoading.value = false;
  }
};

// Fechar o seletor de emojis quando clicar fora dele
const handleClickOutside = (event: MouseEvent) => {
  if (
    showEmojiPicker.value && 
    emojiPickerRef.value && 
    !emojiPickerRef.value.contains(event.target as Node)
  ) {
    showEmojiPicker.value = false;
  }
};

// Adicionar e remover event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
textarea {
  resize: none;
}
</style>
