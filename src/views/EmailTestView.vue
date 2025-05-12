<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Teste de Envio de Email</h1>
      <p class="text-gray-600">Use esta página para testar o envio de emails usando o SendGrid.</p>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <SendGridEmailTester />
    </div>
  </div>
</template>

<script setup lang="ts">
import SendGridEmailTester from '../components/SendGridEmailTester.vue';
</script>
