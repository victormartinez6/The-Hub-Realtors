<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ title }}</h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
        >
          <i class="pi pi-times text-lg"></i>
        </button>
      </div>
      
      <slot></slot>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <i class="pi pi-times mr-2"></i>
          Cancelar
        </button>
        <button
          type="submit"
          @click="emit('save')"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <i class="pi pi-check mr-2"></i>
          Salvar
        </button>
      </div>
    </div>
  </div>
</template>