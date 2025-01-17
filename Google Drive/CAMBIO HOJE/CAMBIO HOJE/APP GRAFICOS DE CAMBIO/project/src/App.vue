<script setup lang="ts">
import { ref } from 'vue';
import CurrencyWidget from './components/CurrencyWidget.vue';
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline';

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark');
}
</script>

<template>
  <div :class="[
    'min-h-screen transition-colors duration-200',
    isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
  ]">
    <!-- Navbar -->
    <nav class="border-b" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <img src="/vite.svg" alt="Logo" class="h-8 w-8" />
            <span class="ml-2 text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Câmbio Hoje
            </span>
          </div>
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-lg"
            :class="isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'"
          >
            <SunIcon v-if="isDarkMode" class="h-6 w-6 text-gray-400" />
            <MoonIcon v-else class="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>

    <main>
      <CurrencyWidget />
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-4" :class="isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ new Date().getFullYear() }} Câmbio Hoje. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
.dark {
  color-scheme: dark;
}

.dark body {
  background-color: #111827;
  color: #fff;
}
</style>