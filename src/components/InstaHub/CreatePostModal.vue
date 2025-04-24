<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <!-- Overlay com efeito de vidro fosco -->
        <div 
          class="fixed inset-0 bg-black/30 backdrop-blur-sm" 
          @click="$emit('update:modelValue', false)"
        ></div>
        
        <!-- Overlay de carregamento (agora fixo na tela) -->
        <div 
          v-if="isSubmitting" 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-[60]"
        >
          <div class="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <img src="@/assets/images/favicon.svg" alt="Loading" class="h-24 w-24 animate-spin mb-6" />
            <p class="text-xl font-medium text-[#012928]">Publishing...</p>
          </div>
        </div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl z-10">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Create Post
            </h2>
            <button 
              @click="$emit('update:modelValue', false)" 
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
              :disabled="isSubmitting"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Form Content -->
          <form @submit.prevent="handleSubmit" class="p-6 pt-4">
            
            <!-- Categoria do Post -->
            <div class="space-y-2 mb-8">
              <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button 
                  v-for="category in availableCategories" 
                  :key="category" 
                  type="button"
                  @click="postCategory = category"
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 focus:outline-none"
                  :class="[
                    postCategory === category 
                      ? 'bg-[#01FBA1] text-[#012928] shadow-md scale-105' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <!-- Ícones para cada categoria -->
                  <svg v-if="category === 'Imóveis à Venda'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-2 2h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <svg v-else-if="category === 'Imóveis para Alugar'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg v-else-if="category === 'Lançamentos'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <svg v-else-if="category === 'Comercial'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <svg v-else-if="category === 'Eventos'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ category }}
                </button>
              </div>
            </div>
            
            <!-- Upload da Foto de Capa -->
            <div class="space-y-4 mb-6 border-2 border-[#01FBA1] rounded-lg p-4">
              <label class="block text-sm font-medium text-gray-700 flex items-center gap-2" for="coverPhoto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cover Photo (Featured)
              </label>
              <p class="text-sm text-gray-600">This will be the first photo displayed in the post and used as a featured image in Top Properties</p>
              
              <!-- Área de upload da capa -->
              <div class="relative">
                <!-- Área clicável para upload quando não há foto de capa -->
                <div 
                  v-if="!coverPhoto"
                  class="border-2 border-dashed border-[#01FBA1] rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  @click="openCoverPhotoPicker"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Click to select cover photo</p>
                  <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF (max 10MB)</p>
                </div>
                
                <!-- Input de arquivo oculto para a capa -->
                <input 
                  ref="coverPhotoInput"
                  type="file" 
                  accept="image/*" 
                  class="hidden"
                  @change="handleCoverPhotoSelect" 
                />
                
                <!-- Preview da foto de capa -->
                <div v-if="coverPhoto" class="mb-3 border-2 border-dashed border-[#01FBA1] rounded-lg p-4">
                  <div class="relative">
                    <img 
                      :src="coverPhoto.preview" 
                      alt="Cover preview" 
                      class="max-h-[300px] mx-auto rounded-lg object-contain"
                    />
                    <div class="flex justify-center mt-4 space-x-2">
                      <button 
                        type="button"
                        @click="openCoverPhotoPicker"
                        class="px-2 py-1 text-xs text-[#012928] bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Change photo
                      </button>
                      <button 
                        type="button"
                        @click="removeCoverPhoto"
                        class="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors duration-200 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Upload de Imagens e Vídeos Adicionais -->
            <div class="space-y-4 mb-6">
              <label class="block text-sm font-medium text-gray-700 flex items-center gap-2" for="media">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Photos and Videos
              </label>
              
              <!-- Área de upload -->
              <div class="relative">
                <!-- Área clicável para upload apenas quando não há arquivos -->
                <div 
                  v-if="selectedFiles.length === 0"
                  class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  @click="openFilePicker"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-600">Click to select media</p>
                  <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF, MP4 (max 50MB)</p>
                </div>
                
                <!-- Input de arquivo oculto -->
                <input 
                  ref="fileInput"
                  type="file" 
                  accept="image/*,video/*" 
                  class="hidden"
                  @change="handleFileSelect" 
                  multiple
                />
                
                <!-- Preview das mídias (carrossel) - fora da área clicável -->
                <div v-if="selectedFiles.length > 0" class="mb-3 border-2 border-dashed border-[#012928] rounded-lg p-4">
                  <!-- Controles do carrossel -->
                  <div class="relative max-w-lg mx-auto">
                    <!-- Imagens/Vídeos -->
                    <div class="overflow-hidden rounded-lg shadow-sm">
                      <div class="relative" style="min-height: 200px;">
                        <!-- Imagem -->
                        <img 
                          v-if="selectedFiles[currentMediaIndex].type === 'image'"
                          :src="selectedFiles[currentMediaIndex].preview" 
                          alt="Preview" 
                          class="max-h-64 w-full object-contain mx-auto rounded-lg" 
                        />
                        <!-- Vídeo -->
                        <div v-else-if="selectedFiles[currentMediaIndex].type === 'video'" 
                             class="relative w-full h-full flex items-center justify-center">
                          <video 
                            ref="videoPlayer"
                            :src="selectedFiles[currentMediaIndex].preview" 
                            controls
                            class="max-h-64 max-w-full rounded-lg object-contain"
                            @loadeddata="() => {}"
                            @error="() => {}"
                            playsinline
                            preload="auto"
                            style="pointer-events: auto !important; z-index: 10;"
                          ></video>
                          
                          <!-- Indicador de tipo de mídia -->
                          <div class="absolute top-2 right-2 bg-black/50 rounded-full p-1 z-20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        
                        <!-- Indicadores de quantidade -->
                        <div v-if="selectedFiles.length > 1" class="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                          <button 
                            v-for="(_, index) in selectedFiles" 
                            :key="index"
                            type="button"
                            @click="() => { pauseCurrentVideo(); currentMediaIndex = index; }"
                            class="w-2 h-2 rounded-full transition-all duration-200"
                            :class="index === currentMediaIndex ? 'bg-[#012928] scale-125' : 'bg-gray-300'"
                          ></button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Botões de navegação -->
                    <div v-if="selectedFiles.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-30">
                      <button 
                        type="button"
                        @click="prevMedia"
                        class="bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition-colors duration-200 ml-2 pointer-events-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        type="button"
                        @click="nextMedia"
                        class="bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition-colors duration-200 mr-2 pointer-events-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Ações de mídia -->
                  <div class="flex justify-center gap-2 mt-2">
                    <button 
                      type="button"
                      @click="openFilePicker"
                      class="px-2 py-1 text-xs text-[#012928] bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add more
                    </button>
                    <button 
                      type="button"
                      @click="removeFile(selectedFiles[currentMediaIndex].id)"
                      class="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                    <button 
                      type="button"
                      @click="clearAllFiles"
                      class="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Legenda com emojis -->
            <div class="space-y-4 mb-6">
              <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Caption
              </label>
              <div class="relative">
                <textarea 
                  v-model="caption" 
                  rows="3" 
                  class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50"
                  placeholder="Write a caption..."
                ></textarea>
                <button 
                  type="button"
                  @click="toggleEmojiPicker"
                  class="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <!-- Emoji Picker -->
                <div v-if="showEmojiPicker" class="absolute right-0 bottom-12 z-10 bg-white rounded-lg shadow-xl border border-gray-200 p-2" ref="emojiPickerRef">
                  <div class="grid grid-cols-8 gap-1">
                    <button 
                      v-for="emoji in commonEmojis" 
                      :key="emoji"
                      type="button"
                      @click="addEmoji(emoji)"
                      class="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Seção de Informações do Imóvel -->
            <div class="pt-4 border-t border-gray-200 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-2 2h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Property Information
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Valor do imóvel em USD -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Property Price (USD)
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span class="text-gray-500">$</span>
                    </div>
                    <input 
                      type="text" 
                      v-model="formattedPropertyPrice" 
                      @input="formatCurrency"
                      class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 pl-8 bg-white"
                      placeholder="Ex: 350,000.00"
                    />
                  </div>
                </div>
                
                <!-- Endereço do imóvel -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Property Address
                  </label>
                  <GooglePlacesAutocomplete
                    v-model="propertyAddress"
                    :api-key="googleMapsApiKey"
                    placeholder="Ex: 123 Main St, Miami, FL 33101"
                    @place-selected="handlePlaceSelected"
                  />
                </div>
                
                <!-- Tipo de propriedade -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Property Type
                  </label>
                  <select 
                    v-model="propertyType" 
                    class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 bg-white"
                  >
                    <option value="">Select type</option>
                    <option v-for="type in propertyTypes" :key="type" :value="type">{{ type }}</option>
                  </select>
                </div>
                
                <!-- Status do imóvel -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Property Status
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <label v-for="status in propertyStatuses" :key="status" class="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                      <input 
                        type="radio" 
                        :value="status" 
                        v-model="propertyStatus" 
                        class="h-4 w-4 text-[#012928] focus:ring-[#012928]"
                      />
                      <span class="ml-2 text-sm text-gray-700">{{ status }}</span>
                    </label>
                  </div>
                </div>
                
                <!-- Tempo no mercado -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Time on Market
                  </label>
                  <input 
                    type="text" 
                    v-model="timeOnMarket" 
                    class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 bg-white"
                    placeholder="Ex: 30 days"
                  />
                </div>

                <!-- MLS ID -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    MLS ID
                  </label>
                  <input 
                    type="text" 
                    v-model="mlsId" 
                    class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 bg-white"
                    placeholder="Ex: MLS123456"
                  />
                </div>
              </div>
            </div>
            
            <!-- Características do Imóvel e Informações Financeiras -->
            <div class="pt-8 border-t border-gray-200 mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Property Features and Financial Information
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Comissão -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Commission Percentage
                  </label>
                  <div class="relative">
                    <input 
                      type="number" 
                      v-model="commissionPercentage" 
                      min="0" 
                      max="100" 
                      step="0.1"
                      class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 pr-8 bg-white"
                      placeholder="Ex: 3.5"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span class="text-gray-500">%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Taxa de HOA -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2m-6 0h6" />
                    </svg>
                    HOA Fees (USD)
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span class="text-gray-500">$</span>
                    </div>
                    <input 
                      type="number" 
                      v-model="hoaFees" 
                      min="0" 
                      step="1"
                      class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 pl-8 bg-white"
                      placeholder="Ex: 250"
                    />
                  </div>
                </div>
                
                <!-- Características do imóvel -->
                <div class="col-span-1 md:col-span-2 space-y-3">
                  <label class="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Property Features
                  </label>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <!-- Quartos -->
                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-gray-700">Bedrooms</label>
                      <div class="flex items-center">
                        <button 
                          type="button" 
                          @click="bedrooms > 0 ? bedrooms-- : null"
                          class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          v-model="bedrooms" 
                          min="0" 
                          class="h-8 w-12 text-center border-y border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                          readonly
                        />
                        <button 
                          type="button" 
                          @click="bedrooms++"
                          class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Banheiros -->
                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-gray-700">Bathrooms</label>
                      <div class="flex items-center">
                        <button 
                          type="button" 
                          @click="bathrooms > 0 ? bathrooms -= 0.5 : null"
                          class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input 
                          type="text" 
                          :value="bathrooms.toString()" 
                          class="h-8 w-12 text-center border-y border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                          readonly
                        />
                        <button 
                          type="button" 
                          @click="bathrooms += 0.5"
                          class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Vagas de Garagem -->
                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-gray-700">Garage Spaces</label>
                      <div class="flex items-center">
                        <button 
                          type="button" 
                          @click="garageSpaces > 0 ? garageSpaces-- : null"
                          class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          v-model="garageSpaces" 
                          min="0" 
                          class="h-8 w-12 text-center border-y border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                          readonly
                        />
                        <button 
                          type="button" 
                          @click="garageSpaces++"
                          class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Área (SQFT) -->
                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-gray-700">Square Footage (SQFT)</label>
                      <input 
                        type="text" 
                        v-model="squareFootage" 
                        class="h-8 w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 bg-white"
                        placeholder="Ex: 1500"
                      />
                    </div>
                  </div>
                  
                  <!-- Recursos adicionais -->
                  <div class="pt-2">
                    <label class="block text-xs font-medium text-gray-700 mb-2">Additional Features</label>
                    <div class="flex flex-wrap gap-2">
                      <label class="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                        <input type="checkbox" v-model="hasPool" class="h-4 w-4 text-[#012928] focus:ring-[#012928] rounded" />
                        <span class="ml-2 text-sm text-gray-700">Pool</span>
                      </label>
                      <label class="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                        <input type="checkbox" v-model="hasGarden" class="h-4 w-4 text-[#012928] focus:ring-[#012928] rounded" />
                        <span class="ml-2 text-sm text-gray-700">Garden</span>
                      </label>
                      <label class="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                        <input type="checkbox" v-model="hasAirConditioning" class="h-4 w-4 text-[#012928] focus:ring-[#012928] rounded" />
                        <span class="ml-2 text-sm text-gray-700">Air Conditioning</span>
                      </label>
                      <label class="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors">
                        <input type="checkbox" v-model="hasSecurity" class="h-4 w-4 text-[#012928] focus:ring-[#012928] rounded" />
                        <span class="ml-2 text-sm text-gray-700">Security</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Campo de observações -->
            <div class="pt-4 border-t border-gray-200">
              <label class="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#012928]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Observations
              </label>
              <textarea 
                v-model="observations" 
                rows="3" 
                class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50 bg-white"
                placeholder="Additional information about the property..."
              ></textarea>
            </div>
            
            <!-- Botões de ação -->
            <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                @click="$emit('update:modelValue', false)" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="!isFormValid || isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-[#012928] border border-transparent rounded-md shadow-sm hover:bg-[#012928]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
    
    <!-- Modal de confirmação de sucesso -->
    <transition name="modal-fade">
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" @click="closeSuccessModal"></div>
        <div class="relative bg-white rounded-lg shadow-xl z-10 p-6 max-w-md w-full">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Post Created Successfully!</h3>
            <p class="text-gray-600 mb-6">Your post has been created and is now available in the feed.</p>
            <button 
              @click="closeSuccessModal" 
              class="w-full px-4 py-2 bg-[#012928] text-white rounded-lg hover:bg-[#023e3d] transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useInstaHubStore } from '@/stores/instaHubStore';
import { useAuthStore } from '@/stores/auth';
import GooglePlacesAutocomplete from '@/components/common/GooglePlacesAutocomplete.vue';
import { googleMapsConfig } from '@/config/googleMaps';

const googleMapsApiKey = googleMapsConfig.apiKey;

// Interface para arquivos selecionados
interface SelectedFile {
  id: number;
  file: File;
  preview: string;
  type: 'image' | 'video';
  fileName?: string;
}

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const authStore = useAuthStore();
const instaHubStore = useInstaHubStore();

// Referências para elementos do DOM
const fileInput = ref<HTMLInputElement | null>(null);
const emojiPickerRef = ref<HTMLDivElement | null>(null);
const coverPhotoInput = ref<HTMLInputElement | null>(null);

// Estado do formulário
const selectedFiles = ref<Array<SelectedFile>>([]);
const currentMediaIndex = ref(0);
const caption = ref('');
const propertyAddress = ref('');
const propertyType = ref('');
const propertyStatus = ref('Active');
const timeOnMarket = ref('');
const mlsId = ref('');
const commissionPercentage = ref('');
const bedrooms = ref(0);
const bathrooms = ref(0);
const garageSpaces = ref(0);
const squareFootage = ref('');
const hoaFees = ref('');
const observations = ref('');
const hasPool = ref(false);
const hasGarden = ref(false);
const hasAirConditioning = ref(false);
const hasSecurity = ref(false);
const showEmojiPicker = ref(false);
const isSubmitting = ref(false);
const postCategory = ref('');
const showSuccessModal = ref(false);
const availableCategories = ref([
  'Imóveis à Venda',
  'Imóveis para Alugar',
  'Lançamentos',
  'Comercial',
  'Eventos'
]);
const propertyPrice = ref('');
const formattedPropertyPrice = ref('');
const coverPhoto = ref<SelectedFile | null>(null);

// Emojis comuns
const commonEmojis = ['😊', '👍', '🎉', '🏠', '🔑', '💰', '🏢', '🌆', '🌇', '🌅', '🌄', '🏘️', '🏙️', '🏗️', '🏡', '🏚️'];

// Opções para os selects
const propertyTypes = ['Townhouse', 'Single Family', 'Apartment', 'Commercial'];
const propertyStatuses = ['Active', 'Pending', 'Closed'];

// Estado para o endereço selecionado
const selectedPlace = ref<any>(null);

// Validação do formulário
const isFormValid = computed(() => {
  return selectedFiles.value.length > 0 && postCategory.value !== '';
});

// Função para abrir o seletor de arquivos
const openFilePicker = () => {
  fileInput.value?.click();
};

// Função para lidar com a seleção de arquivos
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const files = Array.from(target.files);
  
  // Limitar a 5 arquivos
  const totalFiles = selectedFiles.value.length + files.length;
  if (totalFiles > 5) {
    alert('You can add up to 5 files.');
    return;
  }
  
  files.forEach((file) => {
    // Verificar se o arquivo é uma imagem ou vídeo
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select only images or videos.');
      return;
    }
    
    // Verificar o tamanho do arquivo (limite de 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB em bytes
    if (file.size > maxSize) {
      alert(`The file ${file.name} exceeds the 50MB limit.`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const isVideo = file.type.startsWith('video/');
      
      console.log(`Processing file: ${file.name}, type: ${file.type}, is video: ${isVideo}`);
      
      // Adicionar o arquivo à lista de arquivos selecionados
      selectedFiles.value.push({
        id: Date.now() + Math.random(), // Garantir ID único
        file: file,
        preview: preview,
        type: isVideo ? 'video' : 'image',
        fileName: file.name
      });
      
      // Atualizar o índice para mostrar o arquivo recém-adicionado
      currentMediaIndex.value = selectedFiles.value.length - 1;
      
      // Pausar qualquer vídeo em reprodução
      pauseCurrentVideo();
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    // Ler o arquivo como URL de dados
    reader.readAsDataURL(file);
  });
  
  // Limpar o input para permitir selecionar o mesmo arquivo novamente
  target.value = '';
};

// Funções para navegação entre mídias
const prevMedia = () => {
  if (selectedFiles.value.length <= 1) return;
  
  // Pausar vídeo atual se estiver sendo exibido
  pauseCurrentVideo();
  
  currentMediaIndex.value = (currentMediaIndex.value - 1 + selectedFiles.value.length) % selectedFiles.value.length;
};

const nextMedia = () => {
  if (selectedFiles.value.length <= 1) return;
  
  // Pausar vídeo atual se estiver sendo exibido
  pauseCurrentVideo();
  
  currentMediaIndex.value = (currentMediaIndex.value + 1) % selectedFiles.value.length;
};

// Função para pausar o vídeo atual
const pauseCurrentVideo = () => {
  // Encontrar todos os vídeos na página
  const videos = document.querySelectorAll('video');
  
  // Pausar cada vídeo
  videos.forEach(video => {
    if (!video.paused) {
      video.pause();
    }
  });
};

// Função para remover um arquivo
const removeFile = (id: number) => {
  selectedFiles.value = selectedFiles.value.filter(file => file.id !== id);
  if (selectedFiles.value.length === 0) {
    currentMediaIndex.value = 0;
  } else if (currentMediaIndex.value >= selectedFiles.value.length) {
    currentMediaIndex.value = selectedFiles.value.length - 1;
  }
};

// Função para limpar todos os arquivos
const clearAllFiles = () => {
  selectedFiles.value = [];
  currentMediaIndex.value = 0;
};

// Função para abrir o seletor de foto de capa
const openCoverPhotoPicker = () => {
  coverPhotoInput.value?.click();
};

// Função para lidar com a seleção da foto de capa
const handleCoverPhotoSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  
  // Verificar se o arquivo é uma imagem
  if (!file.type.startsWith('image/')) {
    alert('Please select only images.');
    return;
  }
  
  // Verificar o tamanho do arquivo (limite de 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB em bytes
  if (file.size > maxSize) {
    alert(`The file ${file.name} exceeds the 10MB limit.`);
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = e.target?.result as string;
    
    console.log(`Processing file: ${file.name}, type: ${file.type}`);
    
    // Adicionar o arquivo à lista de arquivos selecionados
    coverPhoto.value = {
      id: Date.now() + Math.random(), // Garantir ID único
      file: file,
      preview: preview,
      type: 'image',
      fileName: file.name
    };
  };
  
  reader.onerror = (error) => {
    console.error('Error reading file:', error);
  };
  
  // Ler o arquivo como URL de dados
  reader.readAsDataURL(file);
  
  // Limpar o input para permitir selecionar o mesmo arquivo novamente
  target.value = '';
};

// Função para remover a foto de capa
const removeCoverPhoto = () => {
  coverPhoto.value = null;
};

// Função para alternar o seletor de emojis
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

// Função para adicionar um emoji à legenda
const addEmoji = (emoji: string) => {
  caption.value += emoji;
};

// Função para fechar o modal
const closeModal = () => {
  emit('close');
  emit('update:modelValue', false);
  resetForm();
};

// Função para resetar o formulário
const resetForm = () => {
  selectedFiles.value = [];
  caption.value = '';
  propertyAddress.value = '';
  propertyType.value = '';
  propertyStatus.value = 'Active';
  timeOnMarket.value = '';
  mlsId.value = '';
  commissionPercentage.value = '';
  bedrooms.value = 0;
  bathrooms.value = 0;
  garageSpaces.value = 0;
  squareFootage.value = '';
  hoaFees.value = '';
  observations.value = '';
  hasPool.value = false;
  hasGarden.value = false;
  hasAirConditioning.value = false;
  hasSecurity.value = false;
  showEmojiPicker.value = false;
  currentMediaIndex.value = 0;
  postCategory.value = '';
  propertyPrice.value = '';
  formattedPropertyPrice.value = '';
  coverPhoto.value = null;
};

// Função para enviar o formulário
const handleSubmit = async () => {
  if (!isFormValid.value) {
    return;
  }
  
  try {
    // Verificar se há foto de capa
    if (!coverPhoto.value) {
      alert('Please select a cover photo for the post.');
      return;
    }
    
    // Preparar os arquivos de mídia para upload, colocando a foto de capa como primeiro item
    const allMediaFiles = [];
    
    // Adicionar a foto de capa como primeiro item
    allMediaFiles.push({
      file: coverPhoto.value.file,
      type: 'image',
      isCoverPhoto: true // Marcar como foto de capa
    });
    
    // Adicionar as demais mídias
    const additionalMedia = selectedFiles.value.map(file => ({
      file: file.file,
      type: file.type,
      isCoverPhoto: false
    }));
    
    const mediaFilesToUpload = [...allMediaFiles, ...additionalMedia];
    
    // Iniciar o processo de submissão
    isSubmitting.value = true;
    
    console.log('Sending post with category:', postCategory.value);
    console.log('Cover photo:', coverPhoto.value.fileName);
    console.log('Total media files:', mediaFilesToUpload.length);
    console.log('Media types:', mediaFilesToUpload.map(m => m.type).join(', '));
    
    // Upload das mídias e criação do post usando a store
    await instaHubStore.createPost(
      caption.value,
      mediaFilesToUpload,
      postCategory.value,
      {
        address: propertyAddress.value,
        type: propertyType.value,
        status: propertyStatus.value,
        timeOnMarket: timeOnMarket.value,
        mlsId: mlsId.value,
        price: propertyPrice.value,
        features: {
          bedrooms: bedrooms.value,
          bathrooms: bathrooms.value,
          garageSpaces: garageSpaces.value,
          squareFootage: squareFootage.value.toString(), // Convertendo para string conforme a interface
          hasPool: hasPool.value,
          hasGarden: hasGarden.value,
          hasAirConditioning: hasAirConditioning.value,
          hasSecurity: hasSecurity.value
        },
        hoaFees: hoaFees.value,
        commissionPercentage: parseFloat(commissionPercentage.value) || 0,
        observations: observations.value,
        // Adicionar dados de geolocalização se disponíveis
        location: selectedPlace.value ? {
          lat: selectedPlace.value.geometry?.location?.lat(),
          lng: selectedPlace.value.geometry?.location?.lng(),
          formattedAddress: selectedPlace.value.formatted_address,
          placeId: selectedPlace.value.place_id
        } : null
      },
      {
        name: authStore.user?.displayName || 'User',
        role: authStore.userRole || 'Real Estate Agent'
      }
    );
    
    // Fechar o modal de criação e mostrar o modal de sucesso
    emit('update:modelValue', false);
    showSuccessModal.value = true;
    
    // Resetar o formulário
    resetForm();
  } catch (error) {
    console.error('Error creating post:', error);
    alert(`Error creating the post: ${error instanceof Error ? error.message : 'Try again later.'}`);
  } finally {
    isSubmitting.value = false;
  }
};

// Função para fechar o modal de sucesso
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

// Função para formatar o valor como moeda
const formatCurrency = (event: Event) => {
  // Remove todos os caracteres não numéricos
  let value = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '');
  
  // Se não houver valor, retorna vazio
  if (!value) {
    formattedPropertyPrice.value = '';
    propertyPrice.value = '';
    return;
  }
  
  // Converte para número e formata com separadores de milhar e decimal
  const numValue = parseFloat(value) / 100;
  propertyPrice.value = numValue.toString(); // Guarda o valor numérico sem formatação
  
  // Formata o valor com separadores de milhar e 2 casas decimais
  formattedPropertyPrice.value = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Função para lidar com a seleção de um lugar no autocompletar
const handlePlaceSelected = (place: any) => {
  selectedPlace.value = place;
  propertyAddress.value = place.formatted_address;
};

// Função para detectar clique fora do modal
function handleClickOutside(event: MouseEvent) {
  const modalContent = document.querySelector('.modal-content');
  if (modalContent && !modalContent.contains(event.target as Node)) {
    emit('update:modelValue', false);
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  resetForm();
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Animação de rotação para o ícone de carregamento */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
