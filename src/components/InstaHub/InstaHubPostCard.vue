<template>
  <!-- Cabeçalho do Post -->
  <div 
    :id="`post-${post.id}`"
    class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
  >
    <!-- Cabeçalho do Post -->
    <div class="p-4 flex items-center space-x-3">
      <div class="flex items-center space-x-3">
        <div class="cursor-pointer" @click="showUserCard(post.author)">
          <img 
            :src="getUserPhotoUrl(post.author.id)" 
            alt="Avatar" 
            class="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            @error="handleImageError($event, post.id)"
          >
        </div>
        <div>
          <router-link 
            :to="`/instahub/profile/${post.author.id}`" 
            class="font-semibold text-gray-800 hover:text-[#012928] hover:underline transition-colors"
          >
            {{ getUserName(post.author.id) }}
          </router-link>
          <p class="text-xs text-gray-500">{{ t(`roles.${post.author.role || 'user'}`) }}</p>
        </div>
      </div>
      
      <div class="ml-auto flex items-center gap-3">
        <!-- Características principais -->
        <div v-if="post.propertyInfo?.features" class="flex items-center gap-4">
          <div v-if="post.propertyInfo.features.bedrooms !== undefined" class="flex items-center gap-1 text-sm text-gray-700">
            <span class="font-semibold">Bed:</span>
            {{ post.propertyInfo.features.bedrooms }}
          </div>
          <div v-if="post.propertyInfo.features.bathrooms !== undefined" class="flex items-center gap-1 text-sm text-gray-700">
            <span class="font-semibold">Bath:</span>
            {{ post.propertyInfo.features.bathrooms }}
          </div>
          <div v-if="post.propertyInfo.features.area !== undefined" class="flex items-center gap-1 text-sm text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-3m-6 0h-3m6 0V7m3 14V7" />
            </svg>
            {{ post.propertyInfo.features.area }}m²
          </div>
          <div v-if="post.propertyInfo.address" class="flex items-center gap-1 text-sm text-gray-700">
            <a :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.propertyInfo.address)}`" 
               target="_blank" 
               title="Ver no Google Maps"
               class="text-blue-500 hover:text-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Categoria -->
        <span 
          v-if="post.category" 
          class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          {{ post.category }}
        </span>
        
        <!-- Botão Tenho Interesse -->
        <button 
          @click="toggleInteresse" 
          class="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300"
          :class="[
            isInteressado ? interestButtonColors[selectedInterestColor] : 'bg-[#451A37] text-white hover:bg-[#FF6A00] pulse-neon-lime'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{{ isInteressado ? 'Interessado' : 'Interesse' }}</span>
          <span class="ml-1 text-xs font-bold">{{ interesseCount }}</span>
        </button>
      </div>
    </div>
    
    <!-- Carrossel de mídia -->
    <div class="relative w-full">
      <div class="relative w-full" style="max-height: 500px; min-height: 300px; aspect-ratio: 16/9;">
        <!-- Indicador de carregamento centralizado -->
        <div 
          v-if="imageLoading[post.id]" 
          class="absolute inset-0 flex items-center justify-center bg-gray-100/70 z-20"
        >
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01FBA1]"></div>
            <span class="mt-2 text-sm text-gray-600">Carregando mídia...</span>
          </div>
        </div>
        
        <!-- Container para as mídias com posicionamento absoluto -->
        <div class="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
          <div 
            v-for="(media, index) in post.mediaFiles" 
            :key="`media-${index}`"
            class="absolute inset-0 w-full h-full transition-opacity duration-500 flex items-center justify-center"
            :class="index === post.currentMediaIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
          >
            <!-- Imagem -->
            <img 
              v-if="isImage(media)" 
              :key="`img-${index}`"
              :src="sanitizeUrl(media.url || media)" 
              :alt="`Imagem ${index + 1} do post`"
              class="w-full h-full object-cover object-center"
              @load="handleImageLoaded(post.id)"
              @error="handleImageError($event, post.id)"
            />
            
            <!-- Vídeo -->
            <div 
              v-else-if="isVideo(media)"
              :key="`video-${index}`" 
              class="h-full w-full flex items-center justify-center"
            >
              <!-- Ícone de vídeo no canto superior direito -->
              <div class="absolute top-2 right-2 bg-black/50 rounded-full p-1 z-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              
              <video 
                :ref="el => { if (el) videoRefs[index] = el }"
                :src="sanitizeUrl(media.url || media)" 
                controls
                class="w-full h-full object-cover object-center"
                @loadeddata="handleImageLoaded(post.id)"
                @error="handleImageError($event, post.id)"
                playsinline
                preload="auto"
                style="pointer-events: auto !important;"
              ></video>
            </div>
          </div>
        </div>
        
        <!-- Indicadores de mídia -->
        <div v-if="post.mediaFiles && post.mediaFiles.length > 1" class="absolute bottom-2 left-0 right-0 flex justify-center space-x-2 z-20">
          <button 
            v-for="(_, index) in post.mediaFiles" 
            :key="index"
            type="button"
            @click="() => selectMedia(post, index)"
            class="w-2 h-2 rounded-full transition-all duration-200"
            :class="index === post.currentMediaIndex ? 'bg-white scale-125' : 'bg-white/50'"
          ></button>
        </div>
      </div>
      
      <!-- Botões de navegação -->
      <div v-if="post.mediaFiles && post.mediaFiles.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10">
        <button 
          type="button"
          @click="previousImage(post)"
          class="bg-black/20 hover:bg-black/40 rounded-full p-1 ml-2 transition-colors duration-200 pointer-events-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          type="button"
          @click="nextImage(post)"
          class="bg-black/20 hover:bg-black/40 rounded-full p-1 mr-2 transition-colors duration-200 pointer-events-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Conteúdo do post -->
    <div class="p-4">
      <!-- Título e preço -->
      <div class="flex justify-between items-start mb-2">
        <!-- Ações de like e comentário -->
        <div class="flex space-x-4 mr-4">
          <button @click="toggleLike" class="flex items-center text-gray-600 hover:text-gray-800">
            <svg :class="['h-6 w-6', isLiked ? 'text-red-500 fill-current' : '']" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="ml-1 text-sm">{{ likeCount }}</span>
          </button>
          <button @click="handleComment" class="flex items-center text-gray-600 hover:text-gray-800">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="ml-1 text-sm">{{ commentCount }}</span>
          </button>
        </div>
        
        <h2 class="text-xl font-bold text-gray-800">{{ post.title }}</h2>
        <div class="flex items-center gap-2">
          <!-- MLS ID -->
          <div v-if="post.propertyInfo?.mlsId" class="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
            <span class="font-bold">MLS ID:</span>
            <span>{{ post.propertyInfo.mlsId }}</span>
          </div>
          
          <!-- Valor do imóvel -->
          <div v-if="post.propertyInfo?.price" class="bg-[#FF6A00] text-[#FFFFFF] text-lg font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(post.propertyInfo.price) }}</span>
          </div>
          
          <!-- Ícones de edição e exclusão (visíveis apenas para o autor do post ou administradores) -->
          <div v-if="canDeletePost" class="flex items-center gap-1">
            <button 
              @click="openEditModal" 
              class="bg-blue-100 p-1.5 rounded-full hover:bg-blue-200 transition-colors"
              title="Editar informações do imóvel"
            >
              <svg class="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              @click="deletePost" 
              class="bg-red-100 p-1.5 rounded-full hover:bg-red-200 transition-colors"
              title="Excluir post"
            >
              <svg class="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Localização -->
      <div v-if="post.propertyInfo?.location" class="flex items-center gap-1 text-gray-500 text-sm mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {{ post.propertyInfo.location }}
      </div>
      
      <!-- Conteúdo do post -->
      <p class="text-gray-700 mb-4">{{ post.content }}</p>
      
      <!-- Data de publicação -->
      <div class="flex justify-between items-center mb-4">
        <p class="text-xs text-gray-500">Publicado em {{ formatDate(post.createdAt) }}</p>
      </div>
      
      <!-- Acordeão de informações do imóvel -->
      <div v-if="post.propertyInfo" class="mb-4">
        <button 
          @click="toggleAccordion('details')" 
          class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-xl"
        >
          <span class="font-medium text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#451A37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-3m-6 0h-3m6 0V7m3 14V7" />
            </svg>
            Detalhes do Imóvel
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 transition-transform duration-200" 
            :class="{'rotate-180': accordionOpen.details}"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div 
          v-show="accordionOpen.details" 
          class="p-4 bg-white rounded-b-xl"
        >
          <!-- Informações básicas -->
          <div class="grid grid-cols-3 gap-4 mb-4 border border-gray-200 rounded-lg p-3">
            <div v-if="post.propertyInfo.type" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Tipo</p>
                <p class="font-medium">{{ post.propertyInfo.type }}</p>
              </div>
            </div>
            
            <div v-if="post.propertyInfo.status" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Status</p>
                <p class="font-medium">{{ post.propertyInfo.status }}</p>
              </div>
            </div>
            
            <div v-if="post.propertyInfo.timeOnMarket" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Tempo no Mercado</p>
                <p class="font-medium">{{ post.propertyInfo.timeOnMarket }} dias</p>
              </div>
            </div>
            
            <div v-if="post.propertyInfo.mlsId" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V8m-4 0h-4m4 0h-4m6 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <div>
                <p class="text-xs text-gray-500">MLS ID</p>
                <p class="font-medium">{{ post.propertyInfo.mlsId }}</p>
              </div>
            </div>
            
            <div v-if="post.propertyInfo.address" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Endereço</p>
                <p class="font-medium">{{ post.propertyInfo.address }}</p>
                
                <!-- Mapa estático do Google Maps quando houver dados de localização -->
                <div v-if="post.propertyInfo.location && post.propertyInfo.location.lat && post.propertyInfo.location.lng" class="mt-2">
                  <img 
                    :src="`https://maps.googleapis.com/maps/api/staticmap?center=${post.propertyInfo.location.lat},${post.propertyInfo.location.lng}&zoom=15&size=600x200&maptype=roadmap&markers=color:red%7C${post.propertyInfo.location.lat},${post.propertyInfo.location.lng}&key=${googleMapsApiKey}`"
                    alt="Mapa da localização do imóvel"
                    class="w-full h-32 object-cover rounded-md shadow-sm"
                    @click="openGoogleMaps"
                  />
                  <p class="text-xs text-gray-500 text-center mt-1 cursor-pointer hover:text-[#012928]" @click="openGoogleMaps">
                    <span class="flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V8m-4 0h-4m4 0h-4m6 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      Ver no Google Maps
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div v-if="post.propertyInfo.location" class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Localização</p>
                <p class="font-medium">{{ post.propertyInfo.location }}</p>
              </div>
            </div>
          </div>
          
          <!-- Características do imóvel -->
          <div v-if="post.propertyInfo.features" class="mb-4 border border-gray-200 rounded-lg p-3">
            <h4 class="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Características
            </h4>
            
            <div class="grid grid-cols-3 gap-3">
              <div v-if="post.propertyInfo.features.bedrooms !== undefined" class="flex items-center gap-2">
                <span class="font-semibold">Bed:</span>
                {{ post.propertyInfo.features.bedrooms }}
              </div>
              
              <div v-if="post.propertyInfo.features.bathrooms !== undefined" class="flex items-center gap-2">
                <span class="font-semibold">Bath:</span>
                {{ post.propertyInfo.features.bathrooms }}
              </div>
              
              <div v-if="post.propertyInfo.features.garageSpaces !== undefined" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-5m-4 0H5a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2V8m-4 0h-4m4 0h-4m6 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <span>{{ post.propertyInfo.features.garageSpaces }} Vagas</span>
              </div>
              
              <div v-if="post.propertyInfo.features.squareFootage" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5V20m0 0h-4m4 0l-5-5" />
                </svg>
                <span>{{ post.propertyInfo.features.squareFootage }} sq ft</span>
              </div>
            </div>
            
            <!-- Diferenciais -->
            <div class="mt-3 grid grid-cols-3 gap-2">
              <div v-if="post.propertyInfo.features.hasPool" class="flex items-center gap-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#451A37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Piscina</span>
              </div>
              
              <div v-if="post.propertyInfo.features.hasGarden" class="flex items-center gap-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#01FBA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Jardim</span>
              </div>
              
              <div v-if="post.propertyInfo.features.hasAirConditioning" class="flex items-center gap-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#01FBA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Ar-condicionado</span>
              </div>
              
              <div v-if="post.propertyInfo.features.hasSecurity" class="flex items-center gap-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#01FBA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Segurança</span>
              </div>
            </div>
          </div>
          
          <!-- Informações financeiras -->
          <div v-if="post.propertyInfo.hoa !== undefined || post.propertyInfo.commission !== undefined" class="mb-3 border border-gray-200 rounded-lg p-3">
            <h4 class="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informações Financeiras
            </h4>
            
            <div class="grid grid-cols-3 gap-3">
              <div v-if="post.propertyInfo.hoa !== undefined" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-3m-6 0h-3m6 0V7m3 14V7" />
                </svg>
                <div>
                  <p class="text-xs text-gray-500">Condomínio</p>
                  <p class="text-sm font-medium">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(post.propertyInfo.hoa) }}</p>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.hoaFees !== undefined" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-3m-6 0h-3m6 0V7m3 14V7" />
                </svg>
                <div>
                  <p class="text-xs text-gray-500">Taxa HOA</p>
                  <p class="text-sm font-medium">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(post.propertyInfo.hoaFees) }}</p>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.commission !== undefined && post.propertyInfo.commissionPercentage !== undefined" class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2m-6 0h6" />
                </svg>
                <div>
                  <p class="text-xs text-gray-500">Comissão ({{ post.propertyInfo.commissionPercentage }}%)</p>
                  <p class="text-sm font-medium">{{ formatCommission(post.propertyInfo.price, post.propertyInfo.commissionPercentage) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Observações -->
          <div v-if="post.propertyInfo.observations" class="mt-3 border border-gray-200 rounded-lg p-3">
            <h4 class="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#01FBA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Observações
            </h4>
            <p class="text-gray-700 text-sm">{{ post.propertyInfo.observations }}</p>
          </div>
        </div>
      </div>
      
      <!-- Ações do post -->
      <div class="flex justify-between mt-4 pt-3">
        <div class="flex space-x-4">
          <!-- Espaço vazio, botões movidos para outros locais -->
        </div>
        
        <div class="flex space-x-2">
          <!-- Botão Tenho Interesse removido daqui -->
        </div>
      </div>
      
      <!-- Modal de Edição -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-800">Editar Informações do Imóvel</h3>
            <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-700">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2" for="price">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Valor do Imóvel (USD)
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">$</span>
              <input 
                id="price" 
                v-model="formattedEditPrice" 
                @input="formatEditPrice"
                type="text" 
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#012928]"
                placeholder="Ex: 350,000.00"
              />
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2" for="mlsId">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V8m-4 0h-4m4 0h-4m6 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              MLS ID
            </label>
            <input 
              id="mlsId" 
              v-model="editForm.mlsId" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#012928]"
              placeholder="Ex: MLS123456"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2" for="commissionPercentage">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2m-6 0h6" />
              </svg>
              Porcentagem da Comissão (%)
            </label>
            <div class="relative">
              <input 
                id="commissionPercentage" 
                v-model="editForm.commissionPercentage" 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                class="w-full pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#012928]"
                placeholder="Porcentagem da comissão"
              />
              <span class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">%</span>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showEditModal = false" 
              class="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button 
              @click="saveEdit" 
              class="flex items-center gap-2 px-4 py-2 bg-[#012928] text-white rounded-md hover:bg-[#023e3d] focus:outline-none focus:ring-2 focus:ring-[#01FBA1]"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Salvar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal de comentários -->
      <div v-if="showCommentsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <!-- Cabeçalho do modal -->
          <div class="flex justify-between items-center p-4">
            <h3 class="text-lg font-medium">Comentários</h3>
            <button @click="showCommentsModal = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Lista de comentários -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="post.comments && post.comments.length > 0" class="space-y-4">
              <div v-for="comment in post.comments" :key="comment.id" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="flex items-baseline gap-2">
                    <span class="font-medium">{{ comment.author }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="text-sm text-gray-700">{{ comment.text }}</p>
                </div>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center h-40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          </div>
          
          <!-- Formulário para adicionar comentário -->
          <div class="p-4">
            <form @submit.prevent="addComment" class="flex gap-2">
              <input 
                v-model="newComment" 
                type="text" 
                placeholder="Adicione um comentário..." 
                class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#012928]"
              >
              <button 
                type="submit" 
                class="bg-[#012928] text-white px-4 py-2 rounded-lg hover:bg-[#023e3d] transition-colors"
                :disabled="!newComment.trim()"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInstaHubStore } from '../../stores/instaHubStore';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notifications/notificationStore';
import { googleMapsConfig } from '../../config/googleMaps';
import { db } from '../../firebase';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';

// Constante para a chave da API do Google Maps
const googleMapsApiKey = googleMapsConfig.apiKey;

// Props e Emits
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['openModal', 'showUserCard', 'comment', 'delete']);

// Stores
const authStore = useAuthStore();
const instaHubStore = useInstaHubStore();
const notificationStore = useNotificationStore();

// Estado para carregamento de imagens
const imageLoading = ref<Record<string, boolean>>({});

// Cache para fotos e nomes de usuários
const userPhotoCache = ref<Record<string, string>>({});
const userNameCache = ref<Record<string, string>>({});
const nonExistentUsers = ref<Record<string, boolean>>({});

// Estado para acordeão
const accordionOpen = ref({
  details: false,
});

// Estado para edição
const showEditModal = ref(false);
const editForm = ref({
  price: 0,
  mlsId: '',
  commissionPercentage: 0
});
const formattedEditPrice = ref('');

// Estado para modal de comentários
const showCommentsModal = ref(false);
const newComment = ref('');

// Referências para vídeos
const videoRefs = ref<Record<number, HTMLVideoElement>>({});

// Opções de cores para o botão de interesse
const interestButtonColors = {
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
  purple: 'bg-purple-600 text-white hover:bg-purple-700',
  teal: 'bg-teal-600 text-white hover:bg-teal-700',
  green: 'bg-green-600 text-white hover:bg-green-700',
  red: 'bg-red-600 text-white hover:bg-red-700',
  orange: 'bg-orange-600 text-white hover:bg-orange-700',
  amber: 'bg-amber-600 text-white hover:bg-amber-700',
  pink: 'bg-pink-600 text-white hover:bg-pink-700',
  default: 'bg-[#012928] text-white hover:bg-[#023e3d] pulse-neon'
};

// Cor selecionada para o botão de interesse (altere para qualquer uma das opções acima)
const selectedInterestColor = 'purple';

// Função para obter a foto do perfil do usuário
const getUserPhotoUrl = (userId: string): string => {
  // Verificação de segurança
  if (!userId) {
    console.warn('getUserPhotoUrl chamado com userId vazio');
    return '';
  }

  // Verificar se o usuário está marcado como não existente
  if (nonExistentUsers.value[userId]) {
    console.log(`Usuário ${userId} já foi marcado como não existente`);
    return '';
  }

  // Se a URL já estiver no cache, retorna imediatamente
  if (userPhotoCache.value[userId]) {
    console.log(`Usando URL do cache para ${userId}: ${userPhotoCache.value[userId]}`);
    return userPhotoCache.value[userId];
  }
  
  // URL vazia enquanto a busca assíncrona está em andamento
  const loadingUrl = '';
  
  // Inicia a busca assíncrona e atualiza o cache quando concluída
  getDoc(doc(db, 'users', userId)).then(userDoc => {
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`Dados do usuário ${userId} obtidos diretamente do Firestore:`, userData);
      
      let photoUrl = null;
      
      if (userData.photoURL) {
        photoUrl = userData.photoURL;
        console.log(`Usando photoURL do Firestore para ${userId}: ${photoUrl}`);
      } else if (userData.profilePicture) {
        photoUrl = userData.profilePicture;
        console.log(`Usando profilePicture do Firestore para ${userId}: ${photoUrl}`);
      }
      
      if (photoUrl) {
        console.log(`Atualizando cache com foto do Firestore para ${userId}: ${photoUrl}`);
        Object.assign(userPhotoCache.value, { [userId]: photoUrl });
      } else {
        // Se não tiver foto, deixa vazio para mostrar as iniciais
        console.log(`Usuário ${userId} não tem foto de perfil`);
        Object.assign(userPhotoCache.value, { [userId]: '' });
      }
    } else {
      console.error(`Usuário ${userId} não encontrado no Firestore`);
      Object.assign(nonExistentUsers.value, { [userId]: true });
      Object.assign(userPhotoCache.value, { [userId]: '' });
    }
  }).catch(error => {
    console.error('Erro ao buscar usuário no Firestore:', error);
    Object.assign(userPhotoCache.value, { [userId]: '' });
  });
  
  // Retorna a URL vazia enquanto a busca assíncrona está em andamento
  return loadingUrl;
};

// Função para obter o nome do usuário
const getUserName = (userId: string): string => {
  // Verificação de segurança
  if (!userId) {
    console.warn('getUserName chamado com userId vazio');
    return 'Usuário';
  }

  // Verificar se o usuário está marcado como não existente
  if (nonExistentUsers.value[userId]) {
    console.log(`Usuário ${userId} já foi marcado como não existente`);
    return 'Usuário não encontrado';
  }

  // Se o nome já estiver no cache, retorna imediatamente
  if (userNameCache.value[userId]) {
    return userNameCache.value[userId];
  }
  
  // Nome padrão enquanto a busca assíncrona está em andamento
  const defaultName = 'Carregando...';
  
  // Inicia a busca assíncrona e atualiza o cache quando concluída
  getDoc(doc(db, 'users', userId)).then(userDoc => {
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const name = userData.displayName || user.name || 'Usuário';
      console.log(`Nome do usuário ${userId} obtido do Firestore: ${name}`);
      Object.assign(userNameCache.value, { [userId]: name });
    } else {
      console.error(`Usuário ${userId} não encontrado no Firestore`);
      Object.assign(nonExistentUsers.value, { [userId]: true });
      Object.assign(userNameCache.value, { [userId]: 'Usuário não encontrado' });
    }
  }).catch(error => {
    console.error(`Erro ao buscar nome do usuário ${userId}:`, error);
    Object.assign(userNameCache.value, { [userId]: 'Erro' });
  });
  
  return defaultName;
};

// Carregar dados dos usuários quando o componente for montado
onMounted(() => {
  if (props.post && props.post.author && props.post.author.id) {
    getUserPhotoUrl(props.post.author.id);
    getUserName(props.post.author.id);
  }
  
  if (props.post && !props.post.currentMediaIndex && props.post.mediaFiles?.length > 0) {
    props.post.currentMediaIndex = 0;
    console.log('Inicializando currentMediaIndex para o post:', props.post.id);
  }
  
  if (props.post && props.post.id) {
    imageLoading.value[props.post.id] = true;
  }
});

// Verificar se o usuário já curtiu ou tem interesse no post
const isLiked = computed(() => {
  return props.post.likedBy?.includes(authStore.user?.uid) || false;
});

const isInteressado = computed(() => {
  return props.post.interesseBy?.includes(authStore.user?.uid) || false;
});

// Verificar se o post é do usuário atual
const isMyPost = computed(() => {
  // Verificar se o autor do post é o usuário atual
  const currentUserId = authStore.user?.uid;
  // O post pode ter userId ou author.id
  const result = (props.post.userId === currentUserId) || 
         (props.post.author?.id === currentUserId) ||
         (props.post.authorId === currentUserId);
  
  return result;
});

// Verificar se o usuário é administrador
const isAdmin = computed(() => {
  return authStore.userRole === 'admin' || authStore.userRole === 'super_admin';
});

// Verificar se o usuário pode excluir o post (autor ou administrador)
const canDeletePost = computed(() => {
  return isMyPost.value || isAdmin.value;
});

// Estado para contador de interessados
const interesseCount = computed(() => {
  return props.post.interesseBy?.length || 0;
});

// Estado para contador de likes
const likeCount = computed(() => {
  return props.post.likedBy?.length || 0;
});

// Estado para contador de comentários
const commentCount = computed(() => {
  return props.post.comments?.length || 0;
});

// Função para abrir/fechar acordeão
function toggleAccordion(tab: string) {
  accordionOpen.value[tab] = !accordionOpen.value[tab];
}

// Funções para o carrossel de imagens
const pauseCurrentVideo = () => {
  // Encontrar todos os vídeos na página
  const videos = document.querySelectorAll('video');
  
  // Pausar cada vídeo
  videos.forEach(video => {
    try {
      if (!video.paused) {
        // Usar setTimeout para garantir que a pausa não bloqueie a navegação
        setTimeout(() => {
          try {
            video.pause();
            console.log('Vídeo pausado com sucesso');
          } catch (innerError) {
            console.error('Erro ao pausar vídeo no timeout:', innerError);
          }
        }, 0);
      }
    } catch (error) {
      console.error('Erro ao pausar vídeo:', error);
    }
  });
};

const previousImage = (post: any) => {
  // Pausar vídeo atual se estiver sendo exibido
  pauseCurrentVideo();
  
  if (!post.mediaFiles || post.mediaFiles.length <= 1) return;
  
  // Calcular o índice anterior
  const prevIndex = (post.currentMediaIndex - 1 + post.mediaFiles.length) % post.mediaFiles.length;
  
  // Atualizar o índice
  post.currentMediaIndex = prevIndex;
};

const nextImage = (post: any) => {
  // Pausar vídeo atual se estiver sendo exibido
  pauseCurrentVideo();
  
  if (!post.mediaFiles || post.mediaFiles.length <= 1) return;
  
  // Calcular o próximo índice
  const nextIndex = (post.currentMediaIndex + 1) % post.mediaFiles.length;
  
  // Atualizar o índice
  post.currentMediaIndex = nextIndex;
};

// Função para selecionar uma mídia específica pelo índice
const selectMedia = (post: any, index: number) => {
  // Pausar vídeo atual se estiver sendo exibido
  pauseCurrentVideo();
  
  if (!post.mediaFiles || index >= post.mediaFiles.length || index < 0) return;
  
  // Atualizar o índice
  post.currentMediaIndex = index;
};

// Atualizar o estado de carregamento quando o post mudar
watch(() => props.post, (newPost) => {
  if (newPost && newPost.id) {
    imageLoading.value[newPost.id] = true;
  }
});

// Função para formatar datas
function formatDate(dateValue: any): string {
  if (!dateValue) return '';
  
  try {
    const date = typeof dateValue === 'number' 
      ? new Date(dateValue) 
      : dateValue instanceof Date 
        ? dateValue 
        : new Date(dateValue);
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

// Função para calcular e formatar a comissão
function formatCommission(price: number, percentage: number) {
  if (!price || !percentage) return 'N/A';
  const commission = price * (percentage / 100);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(commission);
}

// Abrir modal de edição
function openEditModal() {
  editForm.value = {
    price: Number(props.post.propertyInfo.price),
    mlsId: props.post.propertyInfo.mlsId || '',
    commissionPercentage: props.post.propertyInfo.commissionPercentage || 0
  };
  formattedEditPrice.value = new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(props.post.propertyInfo.price));
  showEditModal.value = true;
}

// Formatar o preço de edição
function formatEditPrice() {
  // Remover todos os caracteres não numéricos, exceto ponto decimal
  const numericValue = formattedEditPrice.value.replace(/[^0-9.]/g, '');
  
  // Converter para número
  const numberValue = parseFloat(numericValue);
  
  // Atualizar o valor numérico no formulário
  editForm.value.price = isNaN(numberValue) ? 0 : numberValue;
  
  // Formatar o valor para exibição, mas apenas se o usuário não estiver digitando atualmente
  // Isso evita que o cursor pule para o final do campo a cada digitação
  if (!isNaN(numberValue) && formattedEditPrice.value !== '') {
    // Preservar a posição do cursor
    const input = document.getElementById('price') as HTMLInputElement;
    const cursorPosition = input?.selectionStart || 0;
    const oldLength = formattedEditPrice.value.length;
    
    // Formatar o valor
    formattedEditPrice.value = new Intl.NumberFormat('en-US').format(numberValue);
    
    // Calcular nova posição do cursor
    const newLength = formattedEditPrice.value.length;
    const newPosition = cursorPosition + (newLength - oldLength);
    
    // Restaurar posição do cursor após a renderização
    setTimeout(() => {
      if (input) {
        input.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  }
}

// Salvar edição
async function saveEdit() {
  try {
    await instaHubStore.updatePostPropertyInfo(props.post.id, {
      price: editForm.value.price,
      mlsId: editForm.value.mlsId,
      commissionPercentage: editForm.value.commissionPercentage
    });
    showEditModal.value = false;
  } catch (error) {
    console.error('Erro ao atualizar informações:', error);
  }
}

// Excluir post
async function deletePost() {
  try {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      await instaHubStore.deletePost(props.post.id);
      emit('delete', props.post.id);
    }
  } catch (error) {
    console.error('Erro ao excluir post:', error);
  }
}

// Função para abrir o Google Maps com a localização do imóvel
function openGoogleMaps() {
  if (props.post.propertyInfo?.location?.lat && props.post.propertyInfo?.location?.lng) {
    const url = `https://www.google.com/maps?q=${props.post.propertyInfo.location.lat},${props.post.propertyInfo.location.lng}`;
    window.open(url, '_blank');
  } else if (props.post.propertyInfo?.address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.post.propertyInfo.address)}`;
    window.open(url, '_blank');
  }
}

// Função para mostrar o cartão de usuário
function showUserCard(user: any) {
  // Garantir que temos um objeto de usuário completo
  if (user && user.id) {
    // Buscar dados atualizados do usuário no Firestore
    getDoc(doc(db, 'users', user.id)).then(userDoc => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Criar um objeto de usuário completo
        const completeUser = {
          id: user.id,
          name: userData.displayName || user.name || 'Usuário',
          role: userData.role || user.role || 'user',
          photoURL: userData.photoURL || userData.profilePicture || user.photoURL || '',
          email: userData.email || user.email || '',
          phone: userData.phone || user.phone || '',
          website: userData.website || user.website || '',
          creci: userData.creci || user.creci || '',
          bio: userData.bio || user.bio || ''
        };
        // Emitir o evento com o usuário completo
        emit('showUserCard', completeUser);
      } else {
        // Se o usuário não existir no Firestore, usar os dados que temos
        emit('showUserCard', {
          id: user.id,
          name: user.name || 'Usuário não encontrado',
          role: user.role || 'user',
          photoURL: user.photoURL || '',
          email: user.email || '',
          phone: user.phone || '',
          website: user.website || '',
          creci: user.creci || '',
          bio: user.bio || ''
        });
      }
    }).catch(error => {
      console.error('Erro ao buscar dados do usuário:', error);
      // Em caso de erro, usar os dados que temos
      emit('showUserCard', user);
    });
  } else {
    // Se não tivermos um ID de usuário, apenas passar os dados que temos
    emit('showUserCard', user);
  }
}

// Função para sanitizar URLs
function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Verificar se a URL já é segura
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  
  // Adicionar protocolo https se não existir
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  
  return url;
}

// Função para marcar uma imagem como carregada
function handleImageLoaded(postId: string) {
  if (postId) {
    imageLoading.value[postId] = false;
    console.log(`Mídia carregada com sucesso para o post ${postId}`);
  }
}

// Função para lidar com erros de carregamento de mídia
function handleImageError(e: any, postId: string) {
  if (postId) {
    imageLoading.value[postId] = false;
    console.error(`Erro ao carregar mídia para o post ${postId}: ${e}`);
  }
}

// Função para lidar com comentários
function handleComment() {
  showCommentsModal.value = true;
}

// Funções para interação com posts
async function toggleLike() {
  try {
    const wasLiked = isLiked.value;
    await instaHubStore.toggleLike(props.post.id);
    
    // Enviar notificação ao autor do post quando um usuário curte o post
    if (!wasLiked && props.post.author && props.post.author.id) {
      try {
        // Criar notificação diretamente
        const notificationData = {
          title: 'Curtida',
          message: `${authStore.user?.displayName || 'Alguém'} curtiu sua publicação.`,
          timestamp: Timestamp.fromDate(new Date()),
          read: false,
          type: 'info',
          sender: {
            id: authStore.user?.id || 'system',
            name: authStore.user?.displayName || 'Sistema',
            role: authStore.user?.role || 'system'
          },
          recipient: {
            id: props.post.author.id
          }
        };
        
        await addDoc(collection(db, 'notifications'), notificationData);
      } catch (error) {
        console.warn('Não foi possível enviar notificação:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao alternar like:', error);
  }
}

// Função para abrir o modal do post
function openPostModal(post: any, tab: string = 'details') {
  emit('openModal', post, tab);
}

// Função para adicionar um comentário
async function addComment() {
  if (!newComment.value.trim()) return;
  
  try {
    await instaHubStore.addComment(props.post.id, newComment.value);
    
    // Enviar notificação ao autor do post
    if (props.post.author && props.post.author.id) {
      try {
        // Criar notificação diretamente
        const notificationData = {
          title: 'Comentário',
          message: `${authStore.user?.displayName || 'Alguém'} comentou em sua publicação: "${newComment.value.substring(0, 50)}${newComment.value.length > 50 ? '...' : ''}"`,
          timestamp: Timestamp.fromDate(new Date()),
          read: false,
          type: 'info',
          sender: {
            id: authStore.user?.id || 'system',
            name: authStore.user?.displayName || 'Sistema',
            role: authStore.user?.role || 'system'
          },
          recipient: {
            id: props.post.author.id
          }
        };
        
        await addDoc(collection(db, 'notifications'), notificationData);
      } catch (error) {
        console.warn('Não foi possível enviar notificação:', error);
      }
    }
    
    newComment.value = ''; // Limpar o campo após enviar
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
  }
}

// Função para alternar o estado de "interesse"
async function toggleInteresse() {
  try {
    const wasInterested = isInteressado.value;
    await instaHubStore.toggleInteresse(props.post.id);
    
    // Enviar notificação ao autor do post quando um usuário marca interesse
    if (!wasInterested && props.post.author && props.post.author.id) {
      try {
        // Criar notificação diretamente
        const notificationData = {
          title: 'Interesse',
          message: `${authStore.user?.displayName || 'Alguém'} demonstrou interesse em seu imóvel ${props.post.propertyInfo?.address ? `em ${props.post.propertyInfo.address}` : ''}.`,
          timestamp: Timestamp.fromDate(new Date()),
          read: false,
          type: 'success',
          sender: {
            id: authStore.user?.id || 'system',
            name: authStore.user?.displayName || 'Sistema',
            role: authStore.user?.role || 'system'
          },
          recipient: {
            id: props.post.author.id
          }
        };
        
        await addDoc(collection(db, 'notifications'), notificationData);
      } catch (error) {
        console.warn('Não foi possível enviar notificação:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao alternar interesse:', error);
  }
}

// Internacionalização
const { t } = useI18n();

// Função para verificar se o arquivo é uma imagem
function isImage(media: any): boolean {
  if (!media) return false;
  
  // Se for um objeto com propriedade type
  if (typeof media === 'object' && media !== null) {
    // Verificar se tem propriedade 'type' direta
    if (media.type && (media.type === 'image' || media.type.startsWith('image/'))) {
      return true;
    }
    
    // Verificar se tem URL que termina com extensão de imagem
    if (media.url) {
      const url = media.url.toLowerCase();
      if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || 
          url.endsWith('.gif') || url.endsWith('.bmp') || url.endsWith('.webp') || 
          url.endsWith('.svg')) {
        return true;
      }
      
      // Verificar se a URL contém indicadores de imagem
      if (url.includes('image') && !url.includes('video')) {
        return true;
      }
    }
    
    return false;
  }
  
  // Se for uma string (URL)
  if (typeof media === 'string') {
    const url = media.toLowerCase();
    if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || 
        url.endsWith('.gif') || url.endsWith('.bmp') || url.endsWith('.webp') || 
        url.endsWith('.svg')) {
      return true;
    }
    
    // Verificar se a URL contém indicadores de imagem
    if (url.includes('image') && !url.includes('video')) {
      return true;
    }
    
    return false;
  }
  
  return false;
}

// Função para verificar se o arquivo é um vídeo
function isVideo(media: any): boolean {
  if (!media) return false;
  
  // Se for um objeto com propriedade type
  if (typeof media === 'object' && media !== null) {
    // Verificar se tem propriedade 'type' direta
    if (media.type && (media.type === 'video' || media.type.startsWith('video/'))) {
      return true;
    }
    
    // Verificar se tem URL que termina com extensão de vídeo
    if (media.url) {
      const url = media.url.toLowerCase();
      if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || 
          url.endsWith('.mov') || url.endsWith('.avi') || url.endsWith('.wmv') || 
          url.endsWith('.flv') || url.endsWith('.mkv')) {
        return true;
      }
      
      // Verificar se a URL contém indicadores de vídeo
      if (url.includes('video') && !url.includes('image')) {
        return true;
      }
    }
    
    return false;
  }
  
  // Se for uma string (URL)
  if (typeof media === 'string') {
    const url = media.toLowerCase();
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || 
        url.endsWith('.mov') || url.endsWith('.avi') || url.endsWith('.wmv') || 
        url.endsWith('.flv') || url.endsWith('.mkv')) {
      return true;
    }
    
    // Verificar se a URL contém indicadores de vídeo
    if (url.includes('video') && !url.includes('image')) {
      return true;
    }
    
    return false;
  }
  
  return false;
}
</script>

<style scoped>
/* Animação de transição para o carrossel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Efeito de pulsação neon para o botão de interesse */
.pulse-neon-lime {
  animation: pulse-neon-lime-effect 2s infinite;
  box-shadow: 0 0 5px rgba(210, 255, 31, 0.2);
  position: relative;
}

.pulse-neon-active {
  animation: pulse-neon-active-effect 2s infinite;
  box-shadow: 0 0 8px rgba(210, 255, 31, 0.6);
  position: relative;
}

@keyframes pulse-neon-lime-effect {
  0% {
    box-shadow: 0 0 5px rgba(210, 255, 31, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(210, 255, 31, 0.6), 0 0 20px rgba(210, 255, 31, 0.4);
    transform: scale(1.03);
  }
  100% {
    box-shadow: 0 0 5px rgba(210, 255, 31, 0.2);
  }
}

@keyframes pulse-neon-active-effect {
  0% {
    box-shadow: 0 0 8px rgba(210, 255, 31, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(210, 255, 31, 0.8), 0 0 30px rgba(210, 255, 31, 0.6);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 8px rgba(210, 255, 31, 0.6);
  }
}

/* Efeito de pulsação neon para o botão de interesse (original) */
.pulse-neon {
  animation: pulse-neon-effect 2s infinite;
  box-shadow: 0 0 5px rgba(1, 251, 161, 0.2);
  position: relative;
}

@keyframes pulse-neon-effect {
  0% {
    box-shadow: 0 0 5px rgba(1, 251, 161, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(1, 251, 161, 0.6), 0 0 20px rgba(1, 251, 161, 0.4);
    transform: scale(1.03);
  }
  100% {
    box-shadow: 0 0 5px rgba(1, 251, 161, 0.2);
  }
}
</style>
