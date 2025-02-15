```vue
<script setup lang="ts">
import ActionButtons from '../common/ActionButtons.vue'

interface CostType {
  id: string
  name: string
  description: string
  active: boolean
}

interface CostCenter {
  id: number
  code: string
  name: string
  description: string
  budget: number
  spent: number
  types: CostType[]
  active: boolean
}

const props = defineProps<{
  costCenters: CostCenter[]
}>()

const emit = defineEmits<{
  (e: 'addType', center: CostCenter): void
  (e: 'editCenter', center: CostCenter): void
  (e: 'deleteCenter', id: number): void
  (e: 'editType', type: CostType): void
  (e: 'deleteType', id: string): void
}>()
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h2 class="text-lg font-semibold mb-4">Centros de Custo</h2>
    <div class="space-y-6">
      <div v-for="center in costCenters" :key="center.id" class="border-b pb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="flex items-center">
              <h3 class="font-medium text-lg">
                <span class="text-blue-600 mr-2">{{ center.code }}</span>
                {{ center.name }}
              </h3>
              <ActionButtons
                class="ml-4"
                @edit="emit('editCenter', center)"
                @delete="emit('deleteCenter', center.id)"
              />
            </div>
            <p class="text-gray-600 text-sm">{{ center.description }}</p>
          </div>
          <button
            @click="emit('addType', center)"
            class="text-blue-600 hover:text-blue-800"
          >
            <i class="pi pi-plus mr-1"></i>
            Adicionar Tipo
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Orçamento Utilizado</span>
            <span class="font-medium">
              R$ {{ center.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              /
              R$ {{ center.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full"
              :style="{ width: `${(center.spent / center.budget) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Tipos de Custo -->
        <div v-if="center.types.length > 0">
          <h4 class="font-medium text-sm text-gray-500 mb-2">Tipos de Custo</h4>
          <div class="space-y-3">
            <div
              v-for="type in center.types.filter(t => t.active)"
              :key="type.id"
              class="bg-gray-50 p-3 rounded-lg"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h5 class="font-medium">
                    <span class="text-blue-600 mr-2">{{ type.id }}</span>
                    {{ type.name }}
                  </h5>
                  <p class="text-sm text-gray-600">{{ type.description }}</p>
                </div>
                <ActionButtons
                  @edit="emit('editType', type)"
                  @delete="emit('deleteType', type.id)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```