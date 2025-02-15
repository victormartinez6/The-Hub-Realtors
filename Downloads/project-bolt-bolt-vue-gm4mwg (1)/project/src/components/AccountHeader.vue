<template>
  <div class="bg-white p-4 rounded-lg shadow mb-2">
    <div class="grid grid-cols-6 gap-4">
      <div v-for="column in columns" :key="column.key" 
        :class="column.key === 'entityName' ? 'col-span-2' : ''"
        class="flex items-center"
      >
        <button
          v-if="column.sortable"
          @click="toggleSort(column.key)"
          class="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {{ column.label }}
          <span v-if="sortConfig.key === column.key" class="text-blue-600">
            <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
          </span>
        </button>
        <span v-else class="text-sm font-medium text-gray-700">
          {{ column.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  columns: Array<{
    key: string
    label: string
    sortable: boolean
  }>,
  modelValue: {
    key: string
    direction: 'asc' | 'desc'
  }
}>()

const emit = defineEmits(['update:modelValue'])

const sortConfig = ref({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  sortConfig.value = { ...newValue }
}, { deep: true })

const toggleSort = (key: string) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
  emit('update:modelValue', { ...sortConfig.value })
}
</script>
