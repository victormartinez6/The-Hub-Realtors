<template>
  <div class="mb-8">
    <!-- Botão para abrir o modal de criação de post -->
    <button 
      @click="openModal" 
      class="w-full bg-[#012928] shadow-md rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-all duration-300"
    >
      <div class="w-10 h-10 rounded-full bg-[#012928] border-2 border-[#01FBA1] flex items-center justify-center text-[#01FBA1]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <span class="text-[#01FBA1] font-medium">{{ t('instahub.createPost') }}</span>
    </button>
    
    <!-- Modal de criação de post -->
    <CreatePostModal 
      v-model="showModal"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
// Importação absoluta em vez de relativa
import CreatePostModal from '@/components/InstaHub/CreatePostModal.vue';

const { t } = useI18n();

// Estado do modal
const showModal = ref(false);

// Métodos para controlar o modal
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
/* Efeito de hover no botão */
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
