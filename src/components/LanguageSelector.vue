<template>
  <div class="language-selector">
    <button 
      @click="toggleLanguageMenu" 
      class="language-button flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
    >
      <img :src="currentFlag" alt="Bandeira" class="w-5 h-5 rounded-sm" />
      <span class="text-sm">{{ currentLanguage }}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-4 w-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div 
      v-if="showLanguageMenu" 
      class="absolute mt-2 right-0 w-48 bg-white rounded-md shadow-lg py-1 z-50"
    >
      <button 
        v-for="lang in languages" 
        :key="lang.code" 
        @click="changeLanguage(lang.code)" 
        class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
      >
        <img :src="lang.flag" alt="Bandeira" class="w-5 h-5 rounded-sm" />
        <span>{{ lang.name }}</span>
        <svg 
          v-if="lang.code === currentLocale" 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5 text-green-500 ml-auto" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTranslation } from '@/composables/useTranslation';

// Importar imagens das bandeiras
import brFlag from '@/assets/flags/br.svg';
import usFlag from '@/assets/flags/us.svg';

// Tipo para os idiomas suportados
type Locale = 'pt' | 'en';

// Estado para controlar a exibição do menu de idiomas
const showLanguageMenu = ref(false);

// Obter o i18n via nosso composable personalizado
const { getLocale, setLocale } = useTranslation();

// Definir os idiomas disponíveis
const languages = [
  { code: 'pt' as Locale, name: 'Português', flag: brFlag },
  { code: 'en' as Locale, name: 'English', flag: usFlag }
];

// Obter o idioma atual
const currentLocale = computed(() => getLocale() as Locale);

// Obter o nome do idioma atual
const currentLanguage = computed(() => {
  const lang = languages.find(l => l.code === currentLocale.value);
  return lang ? lang.name : 'Português';
});

// Obter a bandeira do idioma atual
const currentFlag = computed(() => {
  const lang = languages.find(l => l.code === currentLocale.value);
  return lang ? lang.flag : brFlag;
});

// Função para alternar a exibição do menu de idiomas
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value;
};

// Função para alterar o idioma
const changeLanguage = (locale: Locale) => {
  setLocale(locale);
  showLanguageMenu.value = false;
  console.log('Idioma alterado para:', locale);
};

// Fechar o menu quando clicar fora dele
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-selector')) {
    showLanguageMenu.value = false;
  }
};

// Adicionar e remover o event listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}
</style>
