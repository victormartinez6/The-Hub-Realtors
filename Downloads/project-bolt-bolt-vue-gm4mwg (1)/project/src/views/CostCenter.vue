<script setup lang="ts">
import { ref } from 'vue'
import CostCenterChart from '../components/cost-center/CostCenterChart.vue'
import CostCenterList from '../components/cost-center/CostCenterList.vue'
import CostTypeModal from '../components/cost-center/CostTypeModal.vue'

interface CostType {
  id: number
  name: string
  description: string
  budget: number
}

interface CostCenter {
  id: number
  name: string
  description: string
  budget: number
  spent: number
  types: CostType[]
}

const costCenters = ref<CostCenter[]>([
  {
    id: 1,
    name: 'Marketing',
    description: 'Despesas relacionadas a marketing e publicidade',
    budget: 15000,
    spent: 12000,
    types: [
      { id: 1, name: 'Publicidade Online', description: 'Google Ads, Meta Ads', budget: 8000 },
      { id: 2, name: 'Marketing de Conteúdo', description: 'Blog, Redes Sociais', budget: 4000 }
    ]
  },
  {
    id: 2,
    name: 'TI',
    description: 'Infraestrutura e sistemas',
    budget: 25000,
    spent: 20000,
    types: [
      { id: 3, name: 'Licenças de Software', description: 'Assinaturas mensais', budget: 15000 },
      { id: 4, name: 'Hardware', description: 'Equipamentos', budget: 10000 }
    ]
  }
])

const showNewCenterModal = ref(false)
const showNewTypeModal = ref(false)
const selectedCenter = ref<CostCenter | null>(null)

const newCostCenter = ref({
  name: '',
  description: '',
  budget: 0,
  types: []
})

const addCostCenter = () => {
  costCenters.value.push({
    id: costCenters.value.length + 1,
    ...newCostCenter.value,
    spent: 0,
    types: []
  })
  showNewCenterModal.value = false
  newCostCenter.value = {
    name: '',
    description: '',
    budget: 0,
    types: []
  }
}

const openNewTypeModal = (center: CostCenter) => {
  selectedCenter.value = center
  showNewTypeModal.value = true
}

const addCostType = (type: CostType) => {
  if (selectedCenter.value) {
    selectedCenter.value.types.push({
      id: type.id,
      name: type.name,
      description: type.description,
      budget: type.budget
    })
  }
  showNewTypeModal.value = false
  selectedCenter.value = null
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">Centro de Custos</h1>
        <p class="text-gray-600">Gerencie seus centros de custo e categorias</p>
      </div>
      <button
        @click="showNewCenterModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Novo Centro de Custo
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Gráfico -->
      <CostCenterChart :cost-centers="costCenters" />

      <!-- Lista de Centros de Custo -->
      <CostCenterList
        :cost-centers="costCenters"
        @add-type="openNewTypeModal"
      />
    </div>

    <!-- Modal Novo Centro de Custo -->
    <div v-if="showNewCenterModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Novo Centro de Custo</h2>
        <form @submit.prevent="addCostCenter" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="newCostCenter.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              v-model="newCostCenter.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Orçamento</label>
            <input
              v-model="newCostCenter.budget"
              type="number"
              step="0.01"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showNewCenterModal = false"
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

    <!-- Modal Tipo de Custo -->
    <CostTypeModal
      v-if="showNewTypeModal"
      :center="selectedCenter"
      @close="showNewTypeModal = false"
      @add="addCostType"
    />
  </div>
</template>