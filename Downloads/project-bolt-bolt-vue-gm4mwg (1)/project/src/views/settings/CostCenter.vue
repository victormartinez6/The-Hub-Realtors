<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCostCenterStore } from '../../stores/costCenter'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import EditModal from '../../components/common/EditModal.vue'
import CostTypeModal from '../../components/cost-center/CostTypeModal.vue'

const costCenterStore = useCostCenterStore()
const showNewCenterModal = ref(false)
const showEditModal = ref(false)
const showNewTypeModal = ref(false)
const showConfirmDelete = ref(false)
const selectedCenter = ref<any>(null)
const editingCenter = ref<any>(null)
const itemToDelete = ref<{ type: 'center' | 'type', id: string, centerId?: string } | null>(null)
const expandedCenters = ref<Set<string>>(new Set())

const newCostCenter = ref({
  code: '',
  name: '',
  description: ''
})

onMounted(() => {
  costCenterStore.fetchCostCenters()
})

const toggleCenter = (centerId: string) => {
  if (expandedCenters.value.has(centerId)) {
    expandedCenters.value.delete(centerId)
  } else {
    expandedCenters.value.add(centerId)
  }
}

const isCenterExpanded = (centerId: string) => {
  return expandedCenters.value.has(centerId)
}

const getNextCenterCode = () => {
  if (costCenterStore.costCenters.length === 0) return '1'
  const codes = costCenterStore.costCenters
    .map(c => parseInt(c.code))
    .filter(code => !isNaN(code))
  const maxCode = Math.max(...codes, 0)
  return (maxCode + 1).toString()
}

const addCostCenter = async () => {
  const code = getNextCenterCode()
  const success = await costCenterStore.addCostCenter({
    ...newCostCenter.value,
    code
  })

  if (success) {
    showNewCenterModal.value = false
    newCostCenter.value = {
      code: '',
      name: '',
      description: ''
    }
  }
}

const openNewTypeModal = (center: any) => {
  selectedCenter.value = center
  showNewTypeModal.value = true
}

const addCostType = async (type: any) => {
  if (!selectedCenter.value?.id) return

  const success = await costCenterStore.addCostType(
    selectedCenter.value.id,
    type
  )

  if (success) {
    showNewTypeModal.value = false
    selectedCenter.value = null
  }
}

const startEdit = (center: any) => {
  editingCenter.value = JSON.parse(JSON.stringify(center))
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!editingCenter.value?.id) return

  const success = await costCenterStore.updateCenterData(
    editingCenter.value.id,
    editingCenter.value
  )

  if (success) {
    showEditModal.value = false
    editingCenter.value = null
  }
}

const confirmDelete = (type: 'center' | 'type', id: string, centerId?: string) => {
  itemToDelete.value = { type, id, centerId }
  showConfirmDelete.value = true
}

const handleDelete = async () => {
  if (!itemToDelete.value) return

  if (itemToDelete.value.type === 'center') {
    await costCenterStore.deleteCenterById(itemToDelete.value.id)
  } else if (itemToDelete.value.centerId) {
    await costCenterStore.deleteCostTypeById(itemToDelete.value.centerId, itemToDelete.value.id)
  }

  showConfirmDelete.value = false
  itemToDelete.value = null
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

    <!-- Loading State -->
    <div v-if="costCenterStore.loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="costCenterStore.error" class="text-center py-8 text-red-600">
      {{ costCenterStore.error }}
    </div>

    <!-- Lista de Centros de Custo -->
    <div v-else class="space-y-4">
      <div v-for="center in costCenterStore.costCenters" :key="center.id" class="bg-white rounded-lg shadow">
        <!-- Accordion Header -->
        <div 
          class="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
          @click="toggleCenter(center.id!)"
        >
          <div class="flex items-center space-x-4">
            <i 
              :class="[
                'pi text-gray-500 transition-transform',
                isCenterExpanded(center.id!) ? 'pi-chevron-down' : 'pi-chevron-right'
              ]"
            ></i>
            <div>
              <h3 class="font-medium">
                <span class="text-blue-600 mr-2">{{ center.code }}</span>
                {{ center.name }}
              </h3>
              <p class="text-sm text-gray-600">{{ center.description }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click.stop="startEdit(center)"
              class="text-blue-600 hover:text-blue-900 p-2"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              @click.stop="confirmDelete('center', center.id!)"
              class="text-red-600 hover:text-red-900 p-2"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Accordion Content -->
        <div 
          v-show="isCenterExpanded(center.id!)"
          class="border-t"
        >
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium text-gray-700">Tipos de Custo</h4>
              <button
                @click="openNewTypeModal(center)"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="pi pi-plus mr-1"></i>
                Adicionar Tipo
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="type in costCenterStore.getCostTypesForCenter(center.id!)"
                :key="type.id"
                class="bg-gray-50 p-3 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="font-medium">
                      <span class="text-blue-600 mr-2">{{ type.code }}</span>
                      {{ type.name }}
                    </h5>
                    <p class="text-sm text-gray-600">{{ type.description }}</p>
                  </div>
                  <div class="space-x-2">
                    <button
                      @click="confirmDelete('type', type.id!, center.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="!costCenterStore.getCostTypesForCenter(center.id!).length" class="text-gray-500 text-sm text-center py-4">
                Nenhum tipo de custo cadastrado
              </div>
            </div>
          </div>
        </div>
      </div>
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
              :disabled="costCenterStore.loading"
            >
              <i v-if="costCenterStore.loading" class="pi pi-spin pi-spinner mr-2"></i>
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

    <!-- Edit Modal -->
    <EditModal
      v-if="showEditModal"
      :show="showEditModal"
      title="Editar Centro de Custo"
      @close="showEditModal = false"
      @save="saveEdit"
    >
      <form @submit.prevent="saveEdit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome</label>
          <input
            v-model="editingCenter.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="editingCenter.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>
      </form>
    </EditModal>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showConfirmDelete"
      title="Confirmar Exclusão"
      :message="itemToDelete?.type === 'center' ? 'Tem certeza que deseja excluir este centro de custo?' : 'Tem certeza que deseja excluir este tipo de custo?'"
      @confirm="handleDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease-out;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
}
</style>