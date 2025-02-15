<script setup lang="ts">
import { useBankList } from '../../composables/useBankList'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { banks, loading, error } = useBankList()
</script>

<template>
  <div>
    <select
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      :disabled="loading"
    >
      <option value="">Selecione um banco</option>
      <option v-for="bank in banks" :key="bank.code" :value="bank.name">
        {{ bank.code }} - {{ bank.name }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>