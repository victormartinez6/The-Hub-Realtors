<template>
  <Accordion :activeIndex="null" class="mb-4">
    <AccordionTab header="Filtros">
      <div class="flex justify-end mb-4">
        <button
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Limpar Filtros
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Fornecedor/Cliente -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fornecedor/Cliente
          </label>
          <input
            v-model="filters.entityName"
            type="text"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Buscar por nome..."
            @input="emitUpdate"
          />
        </div>

        <!-- Tipo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            v-model="filters.type"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            @change="emitUpdate"
          >
            <option value="">Todos</option>
            <option value="payable">A Pagar</option>
            <option value="receivable">A Receber</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            v-model="filters.statusId"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            @change="emitUpdate"
          >
            <option value="">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="PROGRAMADO">Programado</option>
          </select>
        </div>

        <!-- Valor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Valor
          </label>
          <div class="flex space-x-2">
            <input
              v-model.number="filters.amount.min"
              type="number"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Mínimo"
              @input="emitUpdate"
            />
            <input
              v-model.number="filters.amount.max"
              type="number"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Máximo"
              @input="emitUpdate"
            />
          </div>
        </div>

        <!-- Vencimento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Vencimento
          </label>
          <div class="flex space-x-2">
            <input
              v-model="filters.dueDate.start"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="emitUpdate"
            />
            <input
              v-model="filters.dueDate.end"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="emitUpdate"
            />
          </div>
        </div>

        <!-- Agendado Para -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Agendado Para
          </label>
          <div class="flex space-x-2">
            <input
              v-model="filters.scheduledFor.start"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="emitUpdate"
            />
            <input
              v-model="filters.scheduledFor.end"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              @input="emitUpdate"
            />
          </div>
        </div>
      </div>
    </AccordionTab>
  </Accordion>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

interface Filters {
  entityName: string
  type: string
  statusId: string
  amount: {
    min: number | null
    max: number | null
  }
  dueDate: {
    start: string
    end: string
  }
  scheduledFor: {
    start: string
    end: string
  }
}

const props = defineProps<{
  modelValue: Filters
}>()

const emit = defineEmits(['update:modelValue'])

const filters = ref<Filters>({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  filters.value = { ...newValue }
}, { deep: true })

const emitUpdate = () => {
  emit('update:modelValue', { ...filters.value })
}

const clearFilters = () => {
  filters.value = {
    entityName: '',
    type: '',
    statusId: '',
    amount: {
      min: null,
      max: null
    },
    dueDate: {
      start: '',
      end: ''
    },
    scheduledFor: {
      start: '',
      end: ''
    }
  }
  emitUpdate()
}
</script>
