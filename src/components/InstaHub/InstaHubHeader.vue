<template>
  <div class="flex items-center justify-between mb-8">
    <!-- Logo do InstaHub -->
    <div class="h-10">
      <img src="@/assets/images/InstaHub_Logo.svg" alt="InstaHub" class="h-full" />
    </div>
    
    <!-- Perfil do usuário atual -->
    <div class="flex items-center space-x-3">
      <div class="flex items-center space-x-3 cursor-pointer" @click="showUserProfile">
        <img :src="sanitizeUrl(authStore.user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg')" 
             alt="Avatar" 
             class="w-10 h-10 rounded-full object-cover border-2 border-[#01FBA1] hover:border-4 transition-all duration-200">
        <div>
          <h3 class="font-semibold text-gray-800">{{ authStore.user?.displayName || 'WRA Real Estate' }}</h3>
          <p class="text-xs text-gray-500">{{ t(`roles.${authStore.userData?.role || 'user'}`) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">import { useTranslation } from '@/composables/useTranslation';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Função para mostrar o perfil do usuário
function showUserProfile() {
  if (authStore.user?.uid) {
    router.push(`/instahub/profile/${authStore.user.uid}`);
  }
}

// Função para sanitizar URLs
function sanitizeUrl(url?: any): string {
  if (!url) {
    return authStore.user?.photoURL || '';
  }
  
  if (typeof url === 'object' && url !== null) {
    if (url.url && typeof url.url === 'string') {
      return url.url;
    }
    return '';
  }
  
  if (typeof url !== 'string') {
    return '';
  }
  
  if (url.startsWith('@/')) {
    return url.replace('@/', '/');
  }
  
  return url;
}

// Internacionalização
const { t } = useTranslation();
</script>
