<template>
  <div class="mb-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ title }} ({{ posts.length }})</h2>
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01FBA1]"></div>
    </div>
    <div v-else-if="posts.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
      {{ emptyMessage }}
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer relative" 
        @click="$emit('openPost', post)"
      >
        <div class="relative h-48">
          <!-- Imagem do Post -->
          <img 
            v-if="getPostCoverImage(post)"
            :src="getPostCoverImage(post)" 
            class="w-full h-full object-cover"
            alt="Imagem do imóvel"
            loading="lazy"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          
          <!-- Preço (se houver) -->
          <div 
            v-if="post.propertyInfo?.price" 
            class="absolute bottom-2 left-2 bg-[#FF6A00] text-white text-xs font-bold px-2 py-1 rounded-md"
          >
            ${{ formatCurrency(post.propertyInfo.price) }}
          </div>
          
          <!-- Data de publicação -->
          <div class="absolute top-2 left-2 bg-gray-200 bg-opacity-80 text-xs px-2 py-0.5 rounded-md text-gray-700">
            {{ formatDate(post.createdAt) }}
          </div>
        </div>
        
        <!-- Conteúdo do Post -->
        <div class="p-2">
          <!-- Tipo e categoria -->
          <div class="flex justify-between items-center mb-1">
            <span 
              v-if="post.category" 
              class="text-xs font-medium px-2 py-0.5 rounded-xl"
              :class="variant === 'interesse' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
            >
              {{ post.category }}
            </span>
            <span 
              v-if="post.propertyInfo?.type" 
              class="text-xs font-medium px-2 py-0.5 rounded-xl"
              :class="variant === 'interesse' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'"
            >
              {{ post.propertyInfo.type }}
            </span>
          </div>
          
          <!-- Título -->
          <h3 class="font-bold text-gray-800 text-sm line-clamp-1 mb-1">{{ post.caption }}</h3>
          
          <!-- Endereço (se houver) -->
          <p 
            v-if="post.propertyInfo?.address" 
            class="text-xs text-gray-700 truncate mb-1"
          >
            {{ post.propertyInfo.address }}
          </p>
          
          <!-- Características principais -->
          <div class="flex justify-between mt-1 text-xs text-gray-600">
            <span v-if="post.propertyInfo?.rooms" class="flex items-center">
              <i class="fas fa-bed mr-1"></i>
              {{ post.propertyInfo.rooms }}
            </span>
            <span v-if="post.propertyInfo?.bathrooms" class="flex items-center">
              <i class="fas fa-bath mr-1"></i>
              {{ post.propertyInfo.bathrooms }}
            </span>
            <span v-if="post.propertyInfo?.area" class="flex items-center">
              <i class="fas fa-vector-square mr-1"></i>
              {{ post.propertyInfo.area }}
            </span>
          </div>
          
          <!-- Botão para desmarcar interesse -->
          <button 
            v-if="variant === 'interesse'"
            @click.stop="$emit('desmarcarInteresse', post.id)" 
            class="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium py-1 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <i class="fas fa-times-circle"></i> Remover
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Post {
  id: string;
  caption: string;
  mediaFiles?: any[];
  images?: string[];
  category?: string;
  createdAt?: any;
  author?: {
    id: string;
    name: string;
    photoURL?: string;
  };
  likedBy?: string[];
  interesseBy?: string[];
  comments?: any[];
  propertyInfo?: {
    address?: string;
    type?: string;
    rooms?: number;
    bathrooms?: number;
    area?: string;
    price?: number;
    imageUrl?: string;
    images?: string[];
  };
}

// Definir props com defineProps diretamente, sem atribuir a uma variável
const { title, posts, isLoading, emptyMessage = 'Nenhum post encontrado.', variant = 'default' } = defineProps({
  title: {
    type: String,
    required: true
  },
  posts: {
    type: Array as () => Post[],
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'Nenhum post encontrado.'
  },
  variant: {
    type: String,
    default: 'default'
  }
});

defineEmits(['openPost', 'desmarcarInteresse']);

// Função para obter a imagem de capa do post
function getPostCoverImage(post: any): string {
  // Verificar diferentes propriedades onde a imagem pode estar
  if (post.mediaFiles && post.mediaFiles.length > 0) {
    // Se tiver mediaFiles, pegar a primeira
    const media = post.mediaFiles[0];
    return media.url || (typeof media === 'string' ? media : '');
  } else if (post.images && post.images.length > 0) {
    // Se tiver array de images, pegar a primeira
    return post.images[0];
  } else if (post.imageUrl) {
    // Se tiver imageUrl direto
    return post.imageUrl;
  } else if (post.coverImage) {
    // Se tiver coverImage
    return post.coverImage;
  } else if (post.propertyInfo?.imageUrl) {
    // Se tiver imagem nas informações da propriedade
    return post.propertyInfo.imageUrl;
  } else if (post.propertyInfo?.images && post.propertyInfo.images.length > 0) {
    // Se tiver array de imagens nas informações da propriedade
    return post.propertyInfo.images[0];
  }
  
  // Se não encontrar nenhuma imagem
  return '';
}

// Função para lidar com erros de carregamento de imagem
function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement;
  // Em vez de usar uma imagem externa ou local, aplicar estilos para mostrar um placeholder visual
  target.style.display = 'none'; // Esconder a imagem com erro
  
  // Obter o elemento pai da imagem
  const parentElement = target.parentElement;
  if (parentElement) {
    // Adicionar um elemento de fallback com ícone e texto
    if (!parentElement.querySelector('.image-fallback')) {
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'image-fallback w-full h-full flex flex-col items-center justify-center bg-gray-100';
      fallbackDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs text-gray-500">Imagem não disponível</span>
      `;
      parentElement.appendChild(fallbackDiv);
    }
  }
}

// Função para formatar valores monetários
function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(Number(value));
}

// Função para formatar datas
function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  // Se for um timestamp do Firestore
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  }
  
  // Se for uma data normal
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
}
</script>
