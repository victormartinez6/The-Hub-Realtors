<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCostCenterStore } from '../../stores/costCenter'

interface CostCenter {
  id: string
  code: string
  name: string
}

interface CostType {
  code: string
  name: string
  description: string
}

const props = defineProps<{
  center: CostCenter | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', type: Omit<CostType, 'id' | 'active' | 'createdAt' | 'updatedAt'>): void
}>()

const costCenterStore = useCostCenterStore()

const newType = ref({
  name: '',
  description: ''
})

// Compute the next available code
const nextCode = computed(() => {
  if (!props.center?.id) return '1'
  
  const existingTypes = costCenterStore.getCostTypesForCenter(props.center.id)
  if (!existingTypes.length) return `${props.center.code}.1`

  const codes = existingTypes
    .map(type => parseInt(type.code.split('.')[1]))
    .filter(code => !isNaN(code))
  
  const maxCode = Math.max(...codes, 0)
  return `${props.center.code}.${maxCode + 1}`
})

const addType = () => {
  emit('add', {
    code: nextCode.value,
    ...newType.value
  })
  newType.value = {
    name: '',
    description: ''
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">
        Novo Tipo de Custo - {{ center?.name }}
      </h2>
      <form @submit.prevent="addType" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome</label>
          <input
            v-model="newType.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="newType.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>