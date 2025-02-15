<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBankStore } from '../../stores/bank'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'

const bankStore = useBankStore()
const showNewBankModal = ref(false)
const showConfirmDelete = ref(false)
const bankToDelete = ref<number | null>(null)

const newBank = ref({
  name: '',
  agency: '',
  account: '',
  initialBalance: 0,
  initialBalanceDate: new Date().toISOString().split('T')[0]
})

onMounted(() => {
  bankStore.fetchBanks()
})

const addBank = async () => {
  const success = await bankStore.addBank(newBank.value)
  if (success) {
    showNewBankModal.value = false
    newBank.value = {
      name: '',
      agency: '',
      account: '',
      initialBalance: 0,
      initialBalanceDate: new Date().toISOString().split('T')[0]
    }
  }
}

const confirmDelete = (id: number) => {
  bankToDelete.value = id
  showConfirmDelete.value = true
}

const handleDelete = async () => {
  if (bankToDelete.value) {
    await bankStore.deleteBank(bankToDelete.value)
    showConfirmDelete.value = false
    bankToDelete.value = null
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">Bancos</h1>
        <p class="text-gray-600">Gerencie suas contas bancárias</p>
      </div>
      <button
        @click="showNewBankModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Novo Banco
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="bankStore.loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="bankStore.error" class="text-center py-8 text-red-600">
      {{ bankStore.error }}
    </div>

    <!-- Lista de Bancos -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banco</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agência</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Inicial</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Data do Saldo</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="bank in bankStore.banks" :key="bank.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">{{ bank.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ bank.agency }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ bank.account }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              R$ {{ bank.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              {{ new Date(bank.initialBalanceDate).toLocaleDateString('pt-BR') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                @click="confirmDelete(bank.id)"
                class="text-red-600 hover:text-red-900"
                title="Excluir banco"
              >
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="bankStore.banks.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              Nenhum banco cadastrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Novo Banco -->
    <div v-if="showNewBankModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Novo Banco</h2>
        <form @submit.prevent="addBank" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome do Banco</label>
            <input
              v-model="newBank.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Agência</label>
            <input
              v-model="newBank.agency"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Conta</label>
            <input
              v-model="newBank.account"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Saldo Inicial</label>
              <input
                v-model="newBank.initialBalance"
                type="number"
                step="0.01"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Data do Saldo</label>
              <input
                v-model="newBank.initialBalanceDate"
                type="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showNewBankModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="bankStore.loading"
            >
              <i v-if="bankStore.loading" class="pi pi-spin pi-spinner mr-2"></i>
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showConfirmDelete"
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este banco?"
      @confirm="handleDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>