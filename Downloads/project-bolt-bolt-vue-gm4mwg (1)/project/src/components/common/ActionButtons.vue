<script setup lang="ts">
const props = defineProps<{
  canEdit?: boolean
  canDelete?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="flex items-center justify-center space-x-2">
    <button
      v-if="canEdit !== false"
      @click="emit('edit')"
      class="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
      title="Editar"
    >
      <i class="pi pi-pencil text-lg"></i>
    </button>
    <button
      v-if="canDelete !== false"
      @click="emit('delete')"
      class="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
      title="Excluir"
    >
      <i class="pi pi-trash text-lg"></i>
    </button>
  </div>
</template>