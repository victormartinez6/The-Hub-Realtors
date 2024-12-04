<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useSupplierStore } from '../../stores/supplier'
import { useCostCenterStore } from '../../stores/costCenter'
import { validateCNPJ, validateCPF } from '../../utils/validators'
import { getBankList, type Bank } from '../../services/bank.service'
import axios from 'axios'
import Dialog from 'primevue/dialog'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import AddressLookup from '../../components/AddressLookup.vue'
import BankSelect from '../../components/common/BankSelect.vue'
import EditModal from '../../components/common/EditModal.vue'

// Estado
const supplierStore = useSupplierStore()
const costCenterStore = useCostCenterStore()
const loading = ref(false)
const showNewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Computed properties
const suppliers = computed(() => supplierStore.suppliers)
const isLoading = computed(() => supplierStore.loading || loading.value)

const newSupplier = ref<any>({
  name: '',
  document: '',
  email: '',
  phone: '',
  address: {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  },
  bankAccounts: [{
    bank: '',
    agency: '',
    account: '',
    type: 'checking',
    pixKey: ''
  }],
  costCenters: [{
    costCenterId: '',
    costTypeId: ''
  }]
})
const editingSupplier = ref(null)
const supplierToDelete = ref(null)
const banks = ref<Bank[]>([])
const loadError = ref<string | null>(null)

// Computed
const costCenters = computed(() => costCenterStore.costCenters)

// Função para obter tipos de um centro específico
const getTypesForCenter = (centerId: string) => {
  if (!centerId) return []
  return costCenterStore.getCostTypesForCenter(centerId)
}

// Função para limpar tipo quando centro é alterado
const handleCostCenterChange = async (center: any) => {
  center.costTypeId = '' // Reseta o tipo quando muda o centro
  if (center.costCenterId) {
    await costCenterStore.fetchCostTypesForCenter(center.costCenterId)
  }
}

// Funções de formatação
const formatDocument = (doc: string): string => {
  const cleanDoc = doc.replace(/\D/g, '')
  if (cleanDoc.length === 11) {
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (cleanDoc.length === 14) {
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return doc
}

const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Função para buscar dados do CNPJ
const fetchCNPJData = async (document: string) => {
  try {
    const cleanDoc = document.replace(/\D/g, '')
    if (cleanDoc.length !== 14) return

    const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`)
    const data = response.data

    newSupplier.value.name = data.razao_social
    newSupplier.value.email = ''  // CNPJ API não fornece email
    newSupplier.value.phone = ''  // CNPJ API não fornece telefone
    newSupplier.value.address = {
      cep: data.cep || '',
      street: data.logradouro || '',
      number: data.numero || '',
      complement: data.complemento || '',
      neighborhood: data.bairro || '',
      city: data.municipio || '',
      state: data.uf || ''
    }
  } catch (error) {
    console.error('Error fetching CNPJ data:', error)
  }
}

// Watch para buscar CNPJ quando documento é alterado
watch(() => newSupplier.value.document, async (newDoc) => {
  const cleanDoc = newDoc.replace(/\D/g, '')
  if (cleanDoc.length === 14) {
    await fetchCNPJData(cleanDoc)
  }
})

// Carregamento inicial
const loadInitialData = async () => {
  console.log('Loading initial data...')
  try {
    loading.value = true
    loadError.value = null
    
    await Promise.all([
      supplierStore.fetchSuppliers(),
      costCenterStore.fetchCostCenters(),
      loadBanks()
    ])
    
    console.log('Data loaded successfully')
    console.log('Suppliers:', supplierStore.suppliers)
  } catch (error: any) {
    console.error('[SupplierManagement] Error loading initial data:', error)
    loadError.value = 'Erro ao carregar dados iniciais. Por favor, tente novamente.'
  } finally {
    loading.value = false
  }
}

const loadBanks = async () => {
  try {
    banks.value = await getBankList()
  } catch (e) {
    console.error('Error loading banks:', e)
  }
}

// Funções
const openNewSupplierModal = () => {
  showNewModal.value = true
  newSupplier.value = {
    name: '',
    document: '',
    email: '',
    phone: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    bankAccounts: [{
      bank: '',
      agency: '',
      account: '',
      type: 'checking',
      pixKey: ''
    }],
    costCenters: [{
      costCenterId: '',
      costTypeId: ''
    }]
  }
}

const closeNewSupplierModal = () => {
  showNewModal.value = false
}

const addSupplier = async () => {
  try {
    loading.value = true
    
    // Validação do documento
    const cleanDoc = newSupplier.value.document.replace(/\D/g, '')
    if (cleanDoc.length === 11 && !validateCPF(cleanDoc)) {
      throw new Error('CPF inválido')
    }
    if (cleanDoc.length === 14 && !validateCNPJ(cleanDoc)) {
      throw new Error('CNPJ inválido')
    }
    
    console.log('Adding supplier:', newSupplier.value)
    const success = await supplierStore.addSupplier(newSupplier.value)
    console.log('Supplier added successfully:', success)
    
    if (success) {
      closeNewSupplierModal()
    }
  } catch (error: any) {
    console.error('Error adding supplier:', error)
    // TODO: Mostrar erro para o usuário
  } finally {
    loading.value = false
  }
}

const startEdit = (supplier: any) => {
  editingSupplier.value = JSON.parse(JSON.stringify(supplier))
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!editingSupplier.value?.id) return

  try {
    loading.value = true
    
    // Validação do documento
    const cleanDoc = editingSupplier.value.document.replace(/\D/g, '')
    if (cleanDoc.length === 11 && !validateCPF(cleanDoc)) {
      throw new Error('CPF inválido')
    }
    if (cleanDoc.length === 14 && !validateCNPJ(cleanDoc)) {
      throw new Error('CNPJ inválido')
    }
    
    const success = await supplierStore.updateSupplier(
      editingSupplier.value.id,
      editingSupplier.value
    )

    if (success) {
      showEditModal.value = false
      editingSupplier.value = null
    }
  } catch (error: any) {
    console.error('Error updating supplier:', error)
    // TODO: Mostrar erro para o usuário
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id: string) => {
  supplierToDelete.value = id
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!supplierToDelete.value) return

  try {
    loading.value = true
    await supplierStore.deleteSupplier(supplierToDelete.value)
    showDeleteModal.value = false
    supplierToDelete.value = null
  } catch (error) {
    console.error('Error deleting supplier:', error)
    // TODO: Mostrar erro para o usuário
  } finally {
    loading.value = false
  }
}

// Inicialização
onMounted(async () => {
  console.log('[SupplierManagement] Component mounted')
  try {
    loading.value = true
    await Promise.all([
      supplierStore.fetchSuppliers(),
      costCenterStore.fetchCostCenters(),
      loadBanks()
    ])
  } catch (error) {
    console.error('[SupplierManagement] Error loading initial data:', error)
    loadError.value = 'Erro ao carregar dados iniciais'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">Fornecedores</h1>
        <p class="text-gray-600">Gerencie seus fornecedores</p>
      </div>
      <button
        @click="openNewSupplierModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Novo Fornecedor
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="text-center py-8 text-red-600">
      {{ loadError }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!suppliers || suppliers.length === 0" class="text-center py-8 text-gray-600">
      <p>Nenhum fornecedor encontrado</p>
    </div>

    <!-- Lista de Fornecedores -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/Estado</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">{{ supplier.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDocument(supplier.document) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ supplier.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatPhone(supplier.phone) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ supplier.address?.city }}/{{ supplier.address?.state }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button 
                @click="startEdit(supplier)"
                class="text-blue-600 hover:text-blue-900"
                title="Editar fornecedor"
              >
                <i class="pi pi-pencil"></i>
              </button>
              <button 
                @click="confirmDelete(supplier.id!)"
                class="text-red-600 hover:text-red-900"
                title="Excluir fornecedor"
              >
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="suppliers.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
              Nenhum fornecedor cadastrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Novo Fornecedor -->
    <div v-if="showNewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Novo Fornecedor</h2>
        <form @submit.prevent="addSupplier" class="space-y-6">
          <!-- Informações Básicas -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nome</label>
              <input
                v-model="newSupplier.name"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">CNPJ/CPF</label>
              <input
                v-model="newSupplier.document"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="newSupplier.email"
                type="email"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                v-model="newSupplier.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <!-- Endereço -->
          <div class="border-t pt-4">
            <h3 class="text-lg font-medium mb-4">Endereço</h3>
            <AddressLookup v-model="newSupplier.address" />
          </div>

          <!-- Dados Bancários -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Dados Bancários</h3>
              <button
                type="button"
                @click="newSupplier.bankAccounts.push({
                  bank: '',
                  agency: '',
                  account: '',
                  type: 'checking',
                  pixKey: ''
                })"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="pi pi-plus mr-1"></i>
                Adicionar Conta
              </button>
            </div>

            <div v-for="(account, index) in newSupplier.bankAccounts" :key="index" class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between mb-4">
                <h4 class="font-medium">Conta {{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="newSupplier.bankAccounts.splice(index, 1)"
                  class="text-red-600 hover:text-red-800"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Banco</label>
                  <select
                    v-model="account.bank"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selecione um banco</option>
                    <option v-for="bank in banks" :key="bank.code || bank.ispb" :value="bank.name">
                      {{ bank.code ? `${bank.code} - ${bank.name}` : bank.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Conta</label>
                  <select
                    v-model="account.type"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Conta Poupança</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Agência</label>
                  <input
                    v-model="account.agency"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Conta</label>
                  <input
                    v-model="account.account"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Chave PIX</label>
                  <input
                    v-model="account.pixKey"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Centros de Custo -->
          <div class="border-t pt-4">
            <h3 class="text-lg font-medium mb-4">Centros de Custo</h3>
            <div v-for="(center, index) in newSupplier.costCenters" :key="index" class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between mb-4">
                <h4 class="font-medium">Centro de Custo {{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="newSupplier.costCenters.splice(index, 1)"
                  class="text-red-600 hover:text-red-800"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                  <select
                    v-model="center.costCenterId"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    @change="handleCostCenterChange(center)"
                  >
                    <option v-for="costCenter in costCenters" :key="costCenter.id" :value="costCenter.id">{{ costCenter.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tipo de Centro de Custo</label>
                  <select
                    v-model="center.costTypeId"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option v-for="type in getTypesForCenter(center.costCenterId)" :key="type.id" :value="type.id">{{ type.name }}</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="newSupplier.costCenters.push({
                costCenterId: '',
                costTypeId: ''
              })"
              class="text-blue-600 hover:text-blue-800"
            >
              <i class="pi pi-plus mr-1"></i>
              Adicionar Centro de Custo
            </button>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeNewSupplierModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="isLoading"
            >
              <i v-if="isLoading" class="pi pi-spin pi-spinner mr-2"></i>
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Modal -->
    <EditModal
      v-if="showEditModal"
      :show="showEditModal"
      title="Editar Fornecedor"
      @close="showEditModal = false"
      @save="saveEdit"
    >
      <div class="space-y-6">
        <!-- Informações Básicas -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="editingSupplier.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">CNPJ/CPF</label>
            <input
              v-model="editingSupplier.document"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="editingSupplier.email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              v-model="editingSupplier.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <!-- Endereço -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-4">Endereço</h3>
          <AddressLookup v-model="editingSupplier.address" />
        </div>

        <!-- Dados Bancários -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Dados Bancários</h3>
            <button
              type="button"
              @click="editingSupplier.bankAccounts.push({
                bank: '',
                agency: '',
                account: '',
                type: 'checking',
                pixKey: ''
              })"
              class="text-blue-600 hover:text-blue-800"
            >
              <i class="pi pi-plus mr-1"></i>
              Adicionar Conta
            </button>
          </div>

          <div v-for="(account, index) in editingSupplier.bankAccounts" :key="index" class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between mb-4">
              <h4 class="font-medium">Conta {{ index + 1 }}</h4>
              <button
                type="button"
                @click="editingSupplier.bankAccounts.splice(index, 1)"
                class="text-red-600 hover:text-red-800"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Banco</label>
                <select
                  v-model="account.bank"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione um banco</option>
                  <option v-for="bank in banks" :key="bank.code || bank.ispb" :value="bank.name">
                    {{ bank.code ? `${bank.code} - ${bank.name}` : bank.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo de Conta</label>
                <select
                  v-model="account.type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Conta Poupança</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Agência</label>
                <input
                  v-model="account.agency"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Conta</label>
                <input
                  v-model="account.account"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Chave PIX</label>
                <input
                  v-model="account.pixKey"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Centros de Custo -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-4">Centros de Custo</h3>
          <div v-for="(center, index) in editingSupplier.costCenters" :key="index" class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex justify-between mb-4">
              <h4 class="font-medium">Centro de Custo {{ index + 1 }}</h4>
              <button
                type="button"
                @click="editingSupplier.costCenters.splice(index, 1)"
                class="text-red-600 hover:text-red-800"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                <select
                  v-model="center.costCenterId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  @change="handleCostCenterChange(center)"
                >
                  <option value="">Selecione um centro de custo</option>
                  <option v-for="cc in costCenters" :key="cc.id" :value="cc.id">
                    {{ cc.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo de Centro de Custo</label>
                <select
                  v-model="center.costTypeId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um tipo de custo</option>
                  <option v-for="type in getTypesForCenter(center.costCenterId)" :key="type.id" :value="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="editingSupplier.costCenters.push({
              costCenterId: '',
              costTypeId: ''
            })"
            class="text-blue-600 hover:text-blue-800"
          >
            <i class="pi pi-plus mr-1"></i>
            Adicionar Centro de Custo
          </button>
        </div>
      </div>
    </EditModal>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteModal"
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este fornecedor?"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>