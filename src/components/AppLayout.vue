<template>
  <div class="flex h-screen overflow-hidden bg-white">
    <!-- Overlay -->
    <div
      v-show="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition duration-200 lg:static lg:inset-0 lg:translate-x-0"
      :class="{ '-translate-x-full': !isSidebarOpen }"
    >
      <Navigation />
    </div>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 min-h-screen overflow-x-hidden overflow-y-auto">
      <!-- Top Bar -->
      <header class="lg:hidden flex items-center justify-between p-4 bg-white border-b">
        <div class="flex items-center space-x-4">
          <button
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-1 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <svg
              class="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <img :src="logoNome" alt="The Hub Realtors" class="h-8 w-auto">
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Navigation from '@/components/Navigation.vue';
import logoNome from '@/assets/images/The Hub Realtors_nome.svg';

const isSidebarOpen = ref(false);
</script>

<style scoped>
.shadow-t {
  box-shadow: 0 -1px 3px 0 rgba(0, 0, 0, 0.1), 0 -1px 2px 0 rgba(0, 0, 0, 0.06);
}

:root {
  --primary-600: #012928;
  --primary-700: #011f26;
  --primary-800: #011521;
  --primary-50: #f7fafc;
  --primary-100: #e2e8f0;
  --secondary-50: #f7fafc;
}
</style>