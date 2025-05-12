<template>
  <div class="min-h-full bg-gray-100">
    <div class="py-10">
      <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.name"
                @click="currentTab = tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-[#01FBA1] text-[#012928]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <div class="px-4 py-5 sm:p-6">
            <!-- Aba de Perfil -->
            <div v-if="currentTab === 'profile'" class="space-y-6">
              <div class="flex items-center space-x-6">
                <div class="relative">
                  <img
                    :src="photoPreview || userData.photoURL || userPhotoUrl || 'https://ui-avatars.com/api/?name=' + userData.displayName"
                    class="h-24 w-24 rounded-full object-cover border-2 border-[#01FBA1]"
                    :alt="userData.displayName"
                  >
                  <label
                    class="absolute bottom-0 right-0 bg-[#01FBA1] rounded-full p-1 cursor-pointer hover:bg-[#01FBA1]/80"
                    title="Alterar foto"
                  >
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="handlePhotoChange"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-[#012928]">Foto do Perfil</h3>
                  <p class="text-sm text-gray-500">JPG ou PNG. Máximo 1MB.</p>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                      Nome Completo
                    </div>
                  </label>
                  <input
                    type="text"
                    v-model="userData.displayName"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    :placeholder="authStore.userData?.displayName || 'Seu nome completo'"
                    :disabled="!authStore.isAdmin"
                  >
                  <p v-if="!authStore.isAdmin" class="mt-1 text-sm text-gray-500">
                    Apenas administradores podem alterar o nome completo
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Nome Curto/Apelido
                    </div>
                  </label>
                  <input
                    type="text"
                    v-model="userData.name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    :placeholder="authStore.userData?.name || 'Como você gostaria de ser chamado'"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      E-mail
                    </div>
                  </label>
                  <input
                    type="email"
                    v-model="userData.email"
                    disabled
                    class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Telefone
                    </div>
                  </label>
                  <input
                    type="tel"
                    v-model="userData.phoneNumber"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>

                <!-- Novos campos de redes sociais -->
                <div class="mt-6 mb-2">
                  <h3 class="text-lg font-medium text-[#012928]">Redes Sociais e Website</h3>
                  <p class="text-sm text-gray-500">Adicione seus links para que clientes possam encontrá-lo online</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd" />
                      </svg>
                      Website
                    </div>
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      v-model="userData.website"
                      class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      placeholder="www.seusite.com"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                      Instagram
                    </div>
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      instagram.com/
                    </span>
                    <input
                      type="text"
                      v-model="userData.instagram"
                      class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      placeholder="seu.usuario"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Facebook
                    </div>
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      facebook.com/
                    </span>
                    <input
                      type="text"
                      v-model="userData.facebook"
                      class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      placeholder="seuperfil"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </div>
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      linkedin.com/in/
                    </span>
                    <input
                      type="text"
                      v-model="userData.linkedin"
                      class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      placeholder="seu-perfil"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </div>
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      youtube.com/
                    </span>
                    <input
                      type="text"
                      v-model="userData.youtube"
                      class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      placeholder="c/seucanal"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#012928]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                      TikTok
                    </div>
                  </label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      tiktok.com/@
                    </span>
                    <input
                      type="text"
                      v-model="userData.tiktok"
                      class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                      placeholder="seuusuario"
                    >
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  @click="saveProfile"
                  class="inline-flex justify-center rounded-md border border-transparent bg-[#012928] py-2 px-4 text-sm font-medium text-[#01FBA1] shadow-sm hover:bg-[#012928]/80 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>

            <!-- Aba de Segurança -->
            <div v-else-if="currentTab === 'security'" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[#012928]">Senha Atual</label>
                  <input
                    type="password"
                    v-model="currentPassword"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Nova Senha</label>
                  <input
                    type="password"
                    v-model="newPassword"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    v-model="confirmPassword"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  @click="changePassword"
                  class="inline-flex justify-center rounded-md border border-transparent bg-[#01FBA1] py-2 px-4 text-sm font-medium text-[#012928] shadow-sm hover:bg-[#01FBA1]/80 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                >
                  Alterar Senha
                </button>
              </div>
            </div>

            <!-- Aba de Config Marketing -->
            <div v-else-if="currentTab === 'marketing'" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[#012928]">Nome do Remetente de Email</label>
                  <input
                    type="text"
                    v-model="userData.senderName"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    placeholder="Nome que aparecerá como remetente nos emails"
                  >
                  <p class="mt-1 text-xs text-gray-500">Este nome será exibido como remetente nos emails de marketing.</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Largura do Header (px)</label>
                  <input
                    type="number"
                    v-model="userData.marketingConfig.headerWidth"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    min="300"
                    max="800"
                    step="10"
                  >
                  <p class="mt-1 text-xs text-gray-500">Largura padrão recomendada: 600px</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Logo da Empresa</label>
                  <div class="mt-1 flex items-center space-x-4">
                    <div class="flex-shrink-0 h-16 w-32 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                      <img 
                        v-if="userData.marketingConfig.logoUrl" 
                        :src="userData.marketingConfig.logoUrl" 
                        alt="Logo da empresa" 
                        class="max-h-full max-w-full object-contain"
                      >
                      <span v-else class="text-gray-400 text-sm">Sem logo</span>
                    </div>
                    <div>
                      <label class="bg-[#012928] hover:bg-[#012928]/80 text-[#01FBA1] px-3 py-2 rounded cursor-pointer">
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          @change="handleLogoChange"
                        >
                        Selecionar Logo
                      </label>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">Formatos recomendados: PNG ou SVG com fundo transparente</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Imagem de Header Padrão</label>
                  <div class="mt-1 flex flex-col space-y-2">
                    <div class="bg-gray-100 rounded border overflow-hidden" style="max-width: 600px;">
                      <img 
                        v-if="userData.marketingConfig.headerImageUrl" 
                        :src="userData.marketingConfig.headerImageUrl" 
                        alt="Imagem de header padrão" 
                        class="w-full object-cover"
                        style="max-height: 200px;"
                      >
                      <div v-else class="h-32 flex items-center justify-center">
                        <span class="text-gray-400 text-sm">Sem imagem de header</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="bg-[#012928] hover:bg-[#012928]/80 text-[#01FBA1] px-3 py-2 rounded cursor-pointer">
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          @change="handleHeaderImageChange"
                        >
                        Selecionar Imagem de Header
                      </label>
                      <button 
                        v-if="userData.marketingConfig.headerImageUrl"
                        @click="userData.marketingConfig.headerImageUrl = ''"
                        class="text-red-500 text-sm hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">Imagem que será usada como header padrão nos emails. Largura recomendada: 600px</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-[#012928]">Cor Primária</label>
                    <div class="mt-1 flex items-center space-x-2">
                      <input
                        type="color"
                        v-model="userData.marketingConfig.primaryColor"
                        class="h-10 w-10 rounded border-0 cursor-pointer"
                      >
                      <input
                        type="text"
                        v-model="userData.marketingConfig.primaryColor"
                        class="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                        placeholder="#000000"
                      >
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Cor principal para títulos e destaques</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-[#012928]">Cor Secundária</label>
                    <div class="mt-1 flex items-center space-x-2">
                      <input
                        type="color"
                        v-model="userData.marketingConfig.secondaryColor"
                        class="h-10 w-10 rounded border-0 cursor-pointer"
                      >
                      <input
                        type="text"
                        v-model="userData.marketingConfig.secondaryColor"
                        class="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                        placeholder="#000000"
                      >
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Cor para botões e elementos de destaque secundário</p>
                  </div>
                </div>

                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 class="text-sm font-medium text-[#012928] mb-2">Visualização</h3>
                  <div 
                    class="border rounded-lg overflow-hidden" 
                    :style="{ maxWidth: userData.marketingConfig.headerWidth + 'px' }"
                  >
                    <!-- Header com imagem de fundo -->
                    <div 
                      class="relative" 
                      :style="{ 
                        height: '180px',
                        backgroundImage: userData.marketingConfig.headerImageUrl ? `url(${userData.marketingConfig.headerImageUrl})` : `linear-gradient(to right, ${userData.marketingConfig.primaryColor}, ${userData.marketingConfig.secondaryColor})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }"
                    >
                      <!-- Overlay para texto se necessário -->
                      <div 
                        v-if="userData.marketingConfig.headerImageUrl" 
                        class="absolute bottom-0 left-0 right-0 py-2 px-4" 
                        :style="{ backgroundColor: 'rgba(0,0,0,0.5)' }"
                      >
                        <h2 class="text-white text-lg font-bold">Imóvel em Destaque</h2>
                      </div>
                    </div>
                    
                    <!-- Conteúdo do email -->
                    <div class="p-4 bg-white">
                      <div class="h-4 w-3/4 rounded" :style="{ backgroundColor: userData.marketingConfig.primaryColor }"></div>
                      <div class="h-4 w-1/2 rounded bg-gray-200 mt-2"></div>
                      <div class="h-4 w-5/6 rounded bg-gray-200 mt-2"></div>
                      <div class="h-20 w-full rounded bg-gray-100 mt-4 flex items-center justify-center">
                        <span class="text-gray-400">Conteúdo do email</span>
                      </div>
                      <div class="mt-4">
                        <div class="h-8 rounded" :style="{ backgroundColor: userData.marketingConfig.secondaryColor, width: '180px' }"></div>
                      </div>
                    </div>
                    
                    <!-- Rodapé com logo e informações de contato -->
                    <div class="p-4 border-t" :style="{ backgroundColor: '#ffffff' }">
                      <div class="flex flex-wrap items-center gap-4">
                        <!-- Logo -->
                        <div class="flex-shrink-0" style="width: 100px; height: 50px;">
                          <img 
                            v-if="userData.marketingConfig.logoUrl" 
                            :src="userData.marketingConfig.logoUrl" 
                            alt="Logo da empresa" 
                            class="max-h-full max-w-full object-contain"
                          >
                          <div v-else class="h-full flex items-center">
                            <span class="font-bold text-gray-800">The Hub Realtors</span>
                          </div>
                        </div>
                        
                        <!-- Informações de contato com foto do perfil -->
                        <div class="flex-1 flex items-center gap-3">
                          <div class="flex-shrink-0">
                            <img 
                              :src="userData.photoURL || userPhotoUrl || 'https://ui-avatars.com/api/?name=' + userData.displayName"
                              class="h-12 w-12 rounded-full object-cover border border-gray-200"
                              :alt="userData.displayName"
                            >
                          </div>
                          <div>
                            <div class="text-sm font-medium text-gray-800">
                              {{ userData.displayName || 'Nome do Usuário' }}
                            </div>
                            <div class="text-xs text-gray-600">
                              {{ userData.email || 'email@exemplo.com' }}
                            </div>
                            <div class="text-xs text-gray-600">
                              {{ userData.phoneNumber || '(00) 00000-0000' }}
                            </div>
                          </div>
                        </div>
                        
                        <!-- Ícones de redes sociais -->
                        <div class="flex gap-2">
                          <a v-if="userData.facebook" class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200" href="#" title="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                          <a v-if="userData.instagram" class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200" href="#" title="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                          </a>
                          <a v-if="userData.linkedin" class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200" href="#" title="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                          <a v-if="userData.youtube" class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200" href="#" title="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                          <a v-if="userData.tiktok" class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200" href="#" title="TikTok">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                            </svg>
                          </a>
                          <a v-if="userData.website" class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200" href="#" title="Website">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd" />
                            </svg>
                          </a>
                        </div>
                      </div>
                      
                      <!-- Texto legal -->
                      <div class="mt-2 text-xs text-gray-400 text-center">
                        &copy; {{ new Date().getFullYear() }} The Hub Realtors. Todos os direitos reservados.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-end">
                <button
                  @click="saveProfile"
                  class="inline-flex justify-center rounded-md border border-transparent bg-[#012928] py-2 px-4 text-sm font-medium text-[#01FBA1] shadow-sm hover:bg-[#012928]/80 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const authStore = useAuthStore();
const toast = useToast();
const storage = getStorage();

const tabs = [
  { id: 'profile', name: 'Perfil' },
  { id: 'security', name: 'Segurança' },
  { id: 'marketing', name: 'Config Marketing' }
];

const currentTab = ref('profile');
const photoPreview = ref('');
const userPhotoUrl = ref(authStore.userData?.photoURL || '');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const userData = ref({
  displayName: authStore.userData?.displayName || '',  // Nome completo
  name: authStore.userData?.name || '',               // Nome curto/apelido
  senderName: authStore.userData?.senderName || '',   // Nome do remetente de email
  email: authStore.userData?.email || '',
  phoneNumber: authStore.userData?.phoneNumber || '',
  photoURL: authStore.userData?.photoURL || '',
  website: authStore.userData?.website || '',
  instagram: authStore.userData?.instagram || '',
  facebook: authStore.userData?.facebook || '',
  linkedin: authStore.userData?.linkedin || '',
  youtube: authStore.userData?.youtube || '',
  tiktok: authStore.userData?.tiktok || '',
  marketingConfig: {
    headerWidth: authStore.userData?.marketingConfig?.headerWidth || 600,
    logoUrl: authStore.userData?.marketingConfig?.logoUrl || '',
    headerImageUrl: authStore.userData?.marketingConfig?.headerImageUrl || '',
    primaryColor: authStore.userData?.marketingConfig?.primaryColor || '#451A37',
    secondaryColor: authStore.userData?.marketingConfig?.secondaryColor || '#01FBA1'
  }
});

onMounted(async () => {
  if (authStore.userData?.photoURL) {
    userPhotoUrl.value = authStore.userData.photoURL;
    userData.value.photoURL = authStore.userData.photoURL;
  }
  // Recarregar os dados do usuário para garantir que estão atualizados
  await authStore.refreshUserData();
});

watch(() => authStore.userData?.photoURL, (newPhotoURL) => {
  if (newPhotoURL) {
    userPhotoUrl.value = newPhotoURL;
    userData.value.photoURL = newPhotoURL;
  }
});

const handlePhotoChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Verificar o tamanho do arquivo (máximo 1MB)
  if (file.size > 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 1MB');
    return;
  }

  // Criar preview
  const reader = new FileReader();
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  try {
    const storageReference = storageRef(storage, `profile-photos/${authStore.user?.uid}`);
    await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(storageReference);
    
    // Atualizar URL da foto no Auth e Firestore
    await authStore.updateUserPhoto(downloadURL);
    userPhotoUrl.value = downloadURL;
    userData.value.photoURL = downloadURL; // Atualiza o userData local
    toast.success('Foto atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    toast.error('Erro ao atualizar a foto');
    // Limpar o preview em caso de erro
    photoPreview.value = '';
  }
};

const saveProfile = async () => {
  try {
    if (!authStore.user?.uid) return;

    await updateDoc(doc(db, 'users', authStore.user.uid), {
      displayName: userData.value.displayName,
      name: userData.value.name,
      senderName: userData.value.senderName,
      phoneNumber: userData.value.phoneNumber,
      website: userData.value.website,
      instagram: userData.value.instagram,
      facebook: userData.value.facebook,
      linkedin: userData.value.linkedin,
      youtube: userData.value.youtube,
      tiktok: userData.value.tiktok,
      marketingConfig: userData.value.marketingConfig
    });

    // Atualizar o estado global
    await authStore.refreshUserData();
    
    toast.success('Perfil atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    toast.error('Erro ao atualizar perfil');
  }
};

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.error('As senhas não coincidem');
    return;
  }

  try {
    await authStore.updatePassword(currentPassword.value, newPassword.value);
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    toast.success('Senha alterada com sucesso!');
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    toast.error('Erro ao alterar senha');
  }
};

const handleLogoChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Verificar o tamanho do arquivo (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 2MB');
    return;
  }

  try {
    const storageReference = storageRef(storage, `marketing-assets/${authStore.user?.uid}/logo`);
    await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(storageReference);
    
    // Atualizar URL da logo no estado local
    userData.value.marketingConfig.logoUrl = downloadURL;
    toast.success('Logo atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer upload da logo:', error);
    toast.error('Erro ao atualizar a logo');
  }
};

const handleHeaderImageChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Verificar o tamanho do arquivo (máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 2MB');
    return;
  }

  try {
    const storageReference = storageRef(storage, `marketing-assets/${authStore.user?.uid}/header-image`);
    await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(storageReference);
    
    // Atualizar URL da imagem de header no estado local
    userData.value.marketingConfig.headerImageUrl = downloadURL;
    toast.success('Imagem de header atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer upload da imagem de header:', error);
    toast.error('Erro ao atualizar a imagem de header');
  }
};
</script>
