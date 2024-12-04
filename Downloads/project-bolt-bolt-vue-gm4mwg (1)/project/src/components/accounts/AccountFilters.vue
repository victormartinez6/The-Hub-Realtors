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
        <!-- Data de Vencimento - Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vencimento - Início</label>
          <Calendar
            v-model="filters.dueDateStart"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Selecione uma data"
          />
        </div>

        <!-- Data de Vencimento - Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vencimento - Fim</label>
          <Calendar
            v-model="filters.dueDateEnd"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Selecione uma data"
          />
        </div>

        <!-- Tipo de Conta -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
          <Dropdown
            v-model="filters.type"
            :options="accountTypes"
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
            v-model="filters.statusId"
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

        <!-- Fornecedor/Cliente -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fornecedor/Cliente</label>
          <AutoComplete
            v-model="filters.entityName"
            :suggestions="entitySuggestions"
            @complete="searchEntity"
            placeholder="Digite para buscar"
            class="w-full"
          />
        </div>

        <!-- Data de Agendamento - Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Agendamento - Início</label>
          <Calendar
            v-model="filters.scheduledStart"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Selecione uma data"
          />
        </div>

        <!-- Data de Agendamento - Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Agendamento - Fim</label>
          <Calendar
            v-model="filters.scheduledEnd"
            :showIcon="true"
            dateFormat="dd/mm/yy"
            class="w-full"
            placeholder="Selecione uma data"
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
import AutoComplete from 'primevue/autocomplete'
import { useSupplierStore } from '../../stores/supplier'
import { useCustomerStore } from '../../stores/customer'

const supplierStore = useSupplierStore()
const customerStore = useCustomerStore()

const emit = defineEmits(['update:modelValue'])

const isExpanded = ref(false)
const entitySuggestions = ref([])

const filters = ref({
  dueDateStart: null,
  dueDateEnd: null,
  scheduledStart: null,
  scheduledEnd: null,
  type: null,
  statusId: null,
  minAmount: null,
  maxAmount: null,
  entityName: null
})

const accountTypes = [
  { label: 'A Pagar', value: 'payable' },
  { label: 'A Receber', value: 'receivable' }
]

const statusOptions = [
  { label: 'Em Aberto', value: 'open' },
  { label: 'Vencida', value: 'overdue' },
  { label: 'Paga', value: 'paid' },
  { label: 'Agendada', value: 'scheduled' },
  { label: 'Cancelada', value: 'cancelled' }
]

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => value !== null && value !== '')
})

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(value => value !== null && value !== '').length
})

const searchEntity = async (event: { query: string }) => {
  const query = event.query.toLowerCase()
  const suppliers = await supplierStore.fetchSuppliers()
  const customers = await customerStore.fetchCustomers()
  
  const allEntities = [
    ...suppliers.map(s => s.name),
    ...customers.map(c => c.name)
  ]
  
  entitySuggestions.value = allEntities.filter(name => 
    name.toLowerCase().includes(query)
  )
}

const clearFilters = () => {
  filters.value = {
    dueDateStart: null,
    dueDateEnd: null,
    scheduledStart: null,
    scheduledEnd: null,
    type: null,
    statusId: null,
    minAmount: null,
    maxAmount: null,
    entityName: null
  }
  emit('update:modelValue', filters.value)
}

const applyFilters = () => {
  emit('update:modelValue', filters.value)
}
</script>
