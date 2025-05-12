<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Configurações SendGrid</h1>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <SendgridSettings />
      </div>
      
      <div class="flex justify-end mt-6">
        <router-link 
          to="/settings" 
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Voltar para Configurações
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SendgridSettings from '../components/SendGridSettings.vue';
</script>
