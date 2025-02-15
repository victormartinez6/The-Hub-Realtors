<template>
  <div class="bg-white rounded-lg shadow mb-6">
    <button 
      @click="isExpanded = !isExpanded"
      class="w-full px-6 py-4 flex items-center justify-between text-left"
    >
      <div class="flex items-center">
        <i class="pi pi-filter mr-2 text-gray-500"></i>
        <span class="font-medium text-gray-700">Filtros</span>
        <span 
          v-if="hasActiveFilters" 
          class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
        >
          {{ activeFiltersCount }}
        </span>
      </div>
      <i 
        :class="[
          'pi',
          isExpanded ? 'pi-chevron-up' : 'pi-chevron-down',
          'text-gray-500'
        ]"
      ></i>
    </button>

    <div v-if="isExpanded" class="px-6 pb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Data Inicial -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <Calendar
            v-model="filters.startDate"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Selecione uma data"
          />
        </div>

        <!-- Data Final -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <Calendar
            v-model="filters.endDate"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Selecione uma data"
          />
        </div>

        <!-- Tipo de Transação -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Transação</label>
          <Dropdown
            v-model="filters.type"
            :options="transactionTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione um tipo"
            class="w-full"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione um status"
            class="w-full"
          />
        </div>

        <!-- Valor Mínimo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo</label>
          <InputNumber
            v-model="filters.minAmount"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            class="w-full"
            placeholder="R$ 0,00"
          />
        </div>

        <!-- Valor Máximo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor Máximo</label>
          <InputNumber
            v-model="filters.maxAmount"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            class="w-full"
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <!-- Botões -->
      <div class="flex justify-end mt-4 space-x-2">
        <Button
          @click="clearFilters"
          class="p-button-text"
          label="Limpar Filtros"
        />
        <Button
          @click="applyFilters"
          label="Aplicar Filtros"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

const emit = defineEmits(['update:modelValue'])

const isExpanded = ref(false)

const filters = ref({
  startDate: null,
  endDate: null,
  type: null,
  status: null,
  minAmount: null,
  maxAmount: null
})

const transactionTypes = [
  { label: 'Receita', value: 'income' },
  { label: 'Despesa', value: 'expense' }
]

const statusOptions = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Concluído', value: 'completed' }
]

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== null && value !== '')
})

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value !== null && value !== '').length
})

const clearFilters = () => {
  filters.value = {
    startDate: null,
    endDate: null,
    type: null,
    status: null,
    minAmount: null,
    maxAmount: null
  }
  emit('update:modelValue', filters.value)
}

const applyFilters = () => {
  emit('update:modelValue', filters.value)
}
</script>
