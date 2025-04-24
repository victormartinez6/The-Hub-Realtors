<template>
  <div 
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
    @click="$emit('click', property)"
  >
    <!-- Medalha de ranking -->
    <div 
      class="absolute -top-2 -right-2 z-10 w-10 h-10 flex items-center justify-center"
      :class="[
        ranking === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' : 
        ranking === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
        ranking === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
        'bg-gradient-to-br from-teal-400 to-[#012928]'
      ]"
      style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"
    >
      <span class="text-white font-bold text-lg">{{ ranking }}</span>
    </div>

    <div class="relative h-32">
      <!-- Imagem da propriedade -->
      <img 
        v-if="property.mediaFiles && property.mediaFiles.length > 0" 
        :src="property.mediaFiles[0].url" 
        alt="Imagem do imóvel"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      
      <!-- Valor do imóvel -->
      <div class="absolute bottom-2 right-2 bg-[#012928] text-[#01FBA1] text-sm font-bold px-2 py-1 rounded-lg shadow-md">
        {{ formatCurrency(property.propertyInfo.price) }}
      </div>
      
      <!-- MLS ID -->
      <div v-if="property.propertyInfo?.mlsId" class="absolute top-2 left-2 bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-lg shadow-md">
        <span class="font-bold">MLS:</span> {{ property.propertyInfo.mlsId }}
      </div>
    </div>
    
    <div class="p-3">
      <!-- Tipo e status -->
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          {{ property.propertyInfo.type }}
        </span>
        <span class="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">
          {{ property.propertyInfo.status }}
        </span>
      </div>
      
      <!-- Endereço -->
      <p class="text-sm text-gray-700 truncate">{{ property.propertyInfo.address }}</p>
      
      <!-- Características principais -->
      <div class="flex justify-between mt-2 text-xs text-gray-600">
        <span v-if="property.propertyInfo.features.bedrooms" class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-5m-4 0H5a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4m-4 0h-4m4 0h-4m6 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          {{ property.propertyInfo.features.bedrooms }}
        </span>
        <span v-if="property.propertyInfo.features.bathrooms" class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          {{ property.propertyInfo.features.bathrooms }}
        </span>
        <span v-if="property.propertyInfo.features.squareFootage" class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          {{ property.propertyInfo.features.squareFootage }}
        </span>
      </div>
      
      <!-- Interesse -->
      <div class="mt-2 flex items-center justify-between">
        <div class="flex items-center text-xs text-gray-600">
          <svg class="h-4 w-4 text-[#01FBA1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888z" />
          </svg>
          <span class="ml-1">{{ property.interesseBy?.length || 0 }} interessados</span>
        </div>
        <span class="text-xs text-gray-500">{{ formatDate(property.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  ranking: {
    type: Number,
    default: 0
  }
});

defineEmits(['click']);

// Formatação de moeda
function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value));
}

// Formatação de data
function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  // Calcular diferença em dias
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return date.toLocaleDateString('pt-BR');
  }
}
</script>
