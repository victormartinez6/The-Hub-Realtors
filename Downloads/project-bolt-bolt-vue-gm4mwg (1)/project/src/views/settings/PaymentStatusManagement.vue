<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePaymentStatusStore } from '../../stores/paymentStatus'
import ActionButtons from '../../components/common/ActionButtons.vue'
import EditModal from '../../components/common/EditModal.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const paymentStatusStore = usePaymentStatusStore()
const showNewStatusModal = ref(false)
const showEditModal = ref(false)
const showConfirmDelete = ref(false)
const statusToDelete = ref<string | null>(null)
const editingStatus = ref<any>(null)

const newStatus = ref({
  name: '',
  description: '',
  color: '#3B82F6', // Default blue color
  isActive: true
})

onMounted(() => {
  paymentStatusStore.fetchPaymentStatuses()
})

const handleSubmit = async () => {
  await paymentStatusStore.createPaymentStatus(newStatus.value)
  showNewStatusModal.value = false
  newStatus.value = {
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true
  }
}

const handleEdit = (status: any) => {
  editingStatus.value = { ...status }
  showEditModal.value = true
}

const saveEdit = async () => {
  try {
    if (editingStatus.value && editingStatus.value.id) {
      await paymentStatusStore.updatePaymentStatus(editingStatus.value.id, {
        name: editingStatus.value.name,
        description: editingStatus.value.description,
        color: editingStatus.value.color,
        isActive: editingStatus.value.isActive
      })
      showEditModal.value = false
      editingStatus.value = null
    }
  } catch (error) {
    console.error('Erro ao salvar status:', error)
  }
}

const confirmDelete = (status: any) => {
  statusToDelete.value = status.id
  showConfirmDelete.value = true
}

const handleDelete = async () => {
  if (statusToDelete.value) {
    await paymentStatusStore.deletePaymentStatus(statusToDelete.value)
    showConfirmDelete.value = false
    statusToDelete.value = null
  }
}

const toggleStatus = async (status: any) => {
  await paymentStatusStore.updatePaymentStatus(status.id, {
    ...status,
    isActive: !status.isActive
  })
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">Status de Pagamento</h1>
        <p class="text-gray-600">Gerencie os status de pagamento do sistema</p>
      </div>
      <button
        @click="showNewStatusModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Novo Status
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="paymentStatusStore.loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="paymentStatusStore.error" class="text-center py-8 text-red-600">
      {{ paymentStatusStore.error }}
    </div>

    <!-- Lista de Status -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="status in paymentStatusStore.paymentStatuses" :key="status.id">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div
                  class="w-3 h-3 rounded-full mr-2"
                  :style="{ backgroundColor: status.color }"
                ></div>
                {{ status.name }}
              </div>
            </td>
            <td class="px-6 py-4">{{ status.description }}</td>
            <td class="px-6 py-4">
              <div
                class="w-8 h-8 rounded"
                :style="{ backgroundColor: status.color }"
              ></div>
            </td>
            <td class="px-6 py-4">
              <button
                @click="toggleStatus(status)"
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  status.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ status.isActive ? 'Ativo' : 'Inativo' }}
              </button>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center space-x-2">
                <button
                  @click="handleEdit(status)"
                  class="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                  title="Editar"
                >
                  <i class="pi pi-pencil text-lg"></i>
                </button>
                <button
                  @click="confirmDelete(status)"
                  class="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  title="Excluir"
                >
                  <i class="pi pi-trash text-lg"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Novo Status -->
    <EditModal
      v-if="showNewStatusModal"
      :show="showNewStatusModal"
      title="Novo Status de Pagamento"
      @close="showNewStatusModal = false"
      @save="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="newStatus.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              v-model="newStatus.description"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Cor</label>
            <input
              v-model="newStatus.color"
              type="color"
              class="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="newStatus.isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label class="ml-2 block text-sm text-gray-700">Status Ativo</label>
          </div>
        </div>
      </form>
    </EditModal>

    <!-- Modal Editar -->
    <EditModal
      v-if="showEditModal"
      :show="showEditModal"
      title="Editar Status de Pagamento"
      @close="showEditModal = false"
      @save="saveEdit"
    >
      <form @submit.prevent="saveEdit">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              v-model="editingStatus.name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              v-model="editingStatus.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Cor</label>
            <input
              type="color"
              v-model="editingStatus.color"
              class="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 w-20"
            />
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="editingStatus.isActive"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label class="ml-2 block text-sm text-gray-900">Status Ativo</label>
          </div>
        </div>
      </form>
    </EditModal>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-if="showConfirmDelete"
      :show="showConfirmDelete"
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este status de pagamento? Esta ação não pode ser desfeita."
      @confirm="handleDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>
