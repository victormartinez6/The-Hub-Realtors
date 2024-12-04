<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useCustomerStore } from '../../stores/customer'
import { useCostCenterStore } from '../../stores/costCenter'
import { validateCNPJ, validateCPF } from '../../utils/validators'
import axios from 'axios'
import Dialog from 'primevue/dialog'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import { getBankList, type Bank } from '../../services/bank.service'

// Estado local
const loading = ref(false)
const showNewCustomerModal = ref(false)
const showEditModal = ref(false)
const showConfirmDelete = ref(false)
const customerToDelete = ref<string | null>(null)
const loadError = ref<string | null>(null)

// Stores
const customerStore = useCustomerStore()
const costCenterStore = useCostCenterStore()

// Estado local
const defaultCustomer = {
  name: '',
  email: '',
  document: '',
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
  costCenters: [{
    costCenterId: '',
    costTypeId: ''
  }],
  bankAccounts: [{
    bank: '',
    agency: '',
    account: '',
    type: 'checking',
    pixKey: ''
  }]
}

// Estado do novo cliente
const newCustomer = ref(JSON.parse(JSON.stringify(defaultCustomer)))

// Estado para edição
const editingCustomer = ref<any>(null)

// Computed properties
const customers = computed(() => customerStore.customers)
const isLoading = computed(() => customerStore.loading || loading.value)
const costCenters = computed(() => costCenterStore.costCenters)
const banks = ref<Bank[]>([])

// Função para obter tipos de um centro específico
const getTypesForCenter = (centerId: string) => {
  if (!centerId) return []
  return costCenterStore.getCostTypesForCenter(centerId)
}

// Função para limpar tipo quando centro é alterado
const handleCostCenterChange = (center: any) => {
  center.costTypeId = '' // Reseta o tipo quando muda o centro
}

// Funções de formatação
const formatDocument = (doc: string): string => {
  if (!doc) return ''
  const clean = doc.replace(/[^\d]/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return doc
}

const formatPhone = (phone: string): string => {
  if (!phone) return ''
  const clean = phone.replace(/[^\d]/g, '')
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// Função para buscar dados do CNPJ
const fetchCNPJData = async (document: string) => {
  try {
    const cleanDoc = document.replace(/[^\d]/g, '')
    if (cleanDoc.length !== 14) return

    loading.value = true
    const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cleanDoc}`)
    const data = response.data

    // Preenche os dados do cliente
    newCustomer.value.name = data.razao_social
    newCustomer.value.email = ''  // API não fornece email
    newCustomer.value.phone = ''  // API não fornece telefone
    
    // Preenche o endereço
    if (data.estabelecimento) {
      const end = data.estabelecimento
      newCustomer.value.address = {
        cep: end.cep || '',
        street: end.logradouro || '',
        number: end.numero || '',
        complement: end.complemento || '',
        neighborhood: end.bairro || '',
        city: end.cidade?.nome || '',
        state: end.estado?.sigla || ''
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do CNPJ:', error)
    alert('Erro ao buscar dados do CNPJ. Por favor, preencha manualmente.')
  } finally {
    loading.value = false
  }
}

// Watch para buscar CNPJ quando documento é alterado
watch(() => newCustomer.value.document, async (newDoc) => {
  const cleanDoc = newDoc.replace(/[^\d]/g, '')
  if (cleanDoc.length === 14) {
    await fetchCNPJData(cleanDoc)
  }
})

// Carregamento inicial
const loadInitialData = async () => {
  try {
    loadError.value = null
    loading.value = true
    
    await Promise.all([
      customerStore.fetchCustomers(),
      costCenterStore.fetchCostCenters(), // Isso já busca os tipos de cada centro
      loadBanks()
    ])
  } catch (error: any) {
    console.error('[CustomerManagement] Error loading initial data:', error)
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
const openNewCustomerModal = () => {
  console.log('Opening new customer modal')
  newCustomer.value = JSON.parse(JSON.stringify(defaultCustomer))
  showNewCustomerModal.value = true
}

const closeNewCustomerModal = () => {
  newCustomer.value = JSON.parse(JSON.stringify(defaultCustomer))
  showNewCustomerModal.value = false
}

const addCustomer = async () => {
  try {
    loading.value = true
    console.log('[CustomerManagement] Adding customer:', newCustomer.value)
    
    if (!newCustomer.value.name || !newCustomer.value.document) {
      throw new Error('Nome e documento são obrigatórios')
    }
    
    if (!newCustomer.value.costCenters?.[0]?.costCenterId || !newCustomer.value.costCenters?.[0]?.costTypeId) {
      throw new Error('Centro de custo e tipo são obrigatórios')
    }
    
    const success = await customerStore.addCustomer({
      name: newCustomer.value.name,
      document: newCustomer.value.document.replace(/[^\d]/g, ''),
      email: newCustomer.value.email || '',
      phone: newCustomer.value.phone || '',
      address: {
        cep: newCustomer.value.address.cep || '',
        street: newCustomer.value.address.street || '',
        number: newCustomer.value.address.number || '',
        complement: newCustomer.value.address.complement || '',
        neighborhood: newCustomer.value.address.neighborhood || '',
        city: newCustomer.value.address.city || '',
        state: newCustomer.value.address.state || ''
      },
      costCenters: newCustomer.value.costCenters,
      bankAccounts: newCustomer.value.bankAccounts || []
    })
    
    if (!success) {
      throw new Error('Erro ao adicionar cliente')
    }
    
    console.log('[CustomerManagement] Customer added successfully')
    await customerStore.fetchCustomers()
    alert('Cliente adicionado com sucesso!')
    closeNewCustomerModal()
  } catch (error: any) {
    console.error('[CustomerManagement] Error adding customer:', error)
    alert(error.message || 'Erro ao adicionar cliente')
  } finally {
    loading.value = false
  }
}

const startEdit = (customer: any) => {
  editingCustomer.value = JSON.parse(JSON.stringify(customer)) // Deep clone para evitar mutação direta
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!editingCustomer.value?.id) return
  
  try {
    loading.value = true
    console.log('[CustomerManagement] Saving customer edit:', editingCustomer.value)
    
    const success = await customerStore.updateCustomer(
      editingCustomer.value.id,
      editingCustomer.value
    )
    
    if (!success) {
      throw new Error('Erro ao atualizar cliente')
    }
    
    console.log('[CustomerManagement] Customer updated successfully')
    await customerStore.fetchCustomers()
    alert('Cliente atualizado com sucesso!')
    showEditModal.value = false
    editingCustomer.value = null
  } catch (error: any) {
    console.error('[CustomerManagement] Error updating customer:', error)
    alert(error.message || 'Erro ao atualizar cliente')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id: string) => {
  customerToDelete.value = id
  showConfirmDelete.value = true
}

const handleDelete = async () => {
  if (!customerToDelete.value) return
  
  try {
    loading.value = true
    console.log('[CustomerManagement] Deleting customer:', customerToDelete.value)
    
    const success = await customerStore.deleteCustomer(customerToDelete.value)
    
    if (!success) {
      throw new Error('Erro ao excluir cliente')
    }
    
    console.log('[CustomerManagement] Customer deleted successfully')
    await customerStore.fetchCustomers()
    alert('Cliente excluído com sucesso!')
  } catch (error: any) {
    console.error('[CustomerManagement] Error deleting customer:', error)
    alert(error.message || 'Erro ao excluir cliente')
  } finally {
    loading.value = false
    showConfirmDelete.value = false
    customerToDelete.value = null
  }
}

// Inicialização
onMounted(() => {
  loadInitialData()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gerenciamento de Clientes</h1>
      <button
        @click="openNewCustomerModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
      >
        <i class="pi pi-plus mr-2"></i>
        Novo Cliente
      </button>
    </div>

    <!-- Loading Error -->
    <div v-if="loadError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
      {{ loadError }}
      <button
        @click="loadInitialData"
        class="ml-2 text-red-600 hover:text-red-800 underline"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
    </div>

    <!-- Customer List -->
    <div v-else class="bg-white shadow rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in customers" :key="customer.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDocument(customer.document) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatPhone(customer.phone) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button
                @click="startEdit(customer)"
                class="text-blue-600 hover:text-blue-900"
              >
                <i class="pi pi-pencil"></i>
              </button>
              <button
                @click="confirmDelete(customer.id)"
                class="text-red-600 hover:text-red-900"
              >
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm Delete Dialog -->
    <Dialog
      v-model:visible="showConfirmDelete"
      modal
      header="Confirmar Exclusão"
      :style="{ width: '30vw' }"
      :closable="true"
    >
      <p class="mb-4">Tem certeza que deseja excluir este cliente?</p>
      <div class="flex justify-end space-x-3">
        <button
          @click="showConfirmDelete = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          @click="handleDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          :disabled="loading"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
          {{ loading ? 'Excluindo...' : 'Excluir' }}
        </button>
      </div>
    </Dialog>

    <!-- Modal de Novo Cliente -->
    <Dialog
      v-model:visible="showNewCustomerModal"
      modal
      header="Novo Cliente"
      :style="{ width: '80vw' }"
      :closable="true"
      @hide="closeNewCustomerModal"
    >
      <form @submit.prevent="addCustomer" class="space-y-6">
        <!-- Informações Básicas -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Documento (CPF/CNPJ)</label>
            <input
              v-model="newCustomer.document"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="newCustomer.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="newCustomer.email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              v-model="newCustomer.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Endereço -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-4">Endereço</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">CEP</label>
              <input
                v-model="newCustomer.address.cep"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rua</label>
              <input
                v-model="newCustomer.address.street"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Número</label>
              <input
                v-model="newCustomer.address.number"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Complemento</label>
              <input
                v-model="newCustomer.address.complement"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Bairro</label>
              <input
                v-model="newCustomer.address.neighborhood"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Cidade</label>
              <input
                v-model="newCustomer.address.city"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <input
                v-model="newCustomer.address.state"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Contas Bancárias -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Contas Bancárias</h3>
            <button
              type="button"
              class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              @click="newCustomer.bankAccounts.push({
                bank: '',
                agency: '',
                account: '',
                type: 'checking',
                pixKey: ''
              })"
            >
              Adicionar Conta
            </button>
          </div>
          
          <div v-for="(account, index) in newCustomer.bankAccounts" :key="index" class="mb-4 p-4 border rounded-lg">
            <div class="flex justify-end mb-2">
              <button
                type="button"
                @click="newCustomer.bankAccounts.splice(index, 1)"
                class="text-red-600 hover:text-red-900"
                v-if="newCustomer.bankAccounts.length > 1"
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
                <label class="block text-sm font-medium text-gray-700">Agência</label>
                <input
                  v-model="account.agency"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Conta</label>
                <input
                  v-model="account.account"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  v-model="account.type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="checking">Corrente</option>
                  <option value="savings">Poupança</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Chave PIX</label>
                <input
                  v-model="account.pixKey"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Centros de Custo -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Centros de Custo</h3>
            <button
              type="button"
              class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              @click="newCustomer.costCenters.push({ costCenterId: '', costTypeId: '' })"
            >
              Adicionar Centro de Custo
            </button>
          </div>
          
          <div v-for="(center, index) in newCustomer.costCenters" :key="index" class="mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                <select
                  v-model="center.costCenterId"
                  @change="handleCostCenterChange(center)"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione um centro de custo</option>
                  <option v-for="cc in costCenters" :key="cc.id" :value="cc.id">
                    {{ cc.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo de Custo</label>
                <select
                  v-model="center.costTypeId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  :disabled="!center.costCenterId"
                >
                  <option value="">Selecione um tipo de custo</option>
                  <option 
                    v-for="type in getTypesForCenter(center.costCenterId)" 
                    :key="type.id" 
                    :value="type.id"
                  >
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <button 
              type="button" 
              class="mt-2 text-sm text-red-600 hover:text-red-800"
              @click="newCustomer.costCenters.splice(index, 1)"
              v-if="newCustomer.costCenters.length > 1"
            >
              Remover
            </button>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-end space-x-3 border-t pt-4">
          <button
            type="button"
            @click="closeNewCustomerModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            :disabled="loading"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </Dialog>

    <!-- Modal de Edição -->
    <Dialog
      v-model:visible="showEditModal"
      modal
      header="Editar Cliente"
      :style="{ width: '80vw' }"
      :closable="true"
    >
      <form @submit.prevent="saveEdit" class="space-y-6" v-if="editingCustomer">
        <!-- Informações Básicas -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="editingCustomer.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Documento (CPF/CNPJ)</label>
            <input
              v-model="editingCustomer.document"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="editingCustomer.email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              v-model="editingCustomer.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Endereço -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-4">Endereço</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">CEP</label>
              <input
                v-model="editingCustomer.address.cep"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Rua</label>
              <input
                v-model="editingCustomer.address.street"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Número</label>
              <input
                v-model="editingCustomer.address.number"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Complemento</label>
              <input
                v-model="editingCustomer.address.complement"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Bairro</label>
              <input
                v-model="editingCustomer.address.neighborhood"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Cidade</label>
              <input
                v-model="editingCustomer.address.city"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <input
                v-model="editingCustomer.address.state"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Contas Bancárias -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Contas Bancárias</h3>
            <button
              type="button"
              class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              @click="editingCustomer.bankAccounts.push({
                bank: '',
                agency: '',
                account: '',
                type: 'checking',
                pixKey: ''
              })"
            >
              Adicionar Conta
            </button>
          </div>
          
          <div v-for="(account, index) in editingCustomer.bankAccounts" :key="index" class="mb-4 p-4 border rounded-lg">
            <div class="flex justify-end mb-2">
              <button
                type="button"
                @click="editingCustomer.bankAccounts.splice(index, 1)"
                class="text-red-600 hover:text-red-900"
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
                <label class="block text-sm font-medium text-gray-700">Agência</label>
                <input
                  v-model="account.agency"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Conta</label>
                <input
                  v-model="account.account"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  v-model="account.type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="checking">Corrente</option>
                  <option value="savings">Poupança</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Chave PIX</label>
                <input
                  v-model="account.pixKey"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Centros de Custo -->
        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">Centros de Custo</h3>
            <button
              type="button"
              class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              @click="editingCustomer.costCenters.push({ costCenterId: '', costTypeId: '' })"
            >
              Adicionar Centro de Custo
            </button>
          </div>
          
          <div v-for="(center, index) in editingCustomer.costCenters" :key="index" class="mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                <select
                  v-model="center.costCenterId"
                  @change="handleCostCenterChange(center)"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione um centro de custo</option>
                  <option v-for="cc in costCenters" :key="cc.id" :value="cc.id">
                    {{ cc.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tipo de Custo</label>
                <select
                  v-model="center.costTypeId"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  :disabled="!center.costCenterId"
                >
                  <option value="">Selecione um tipo de custo</option>
                  <option 
                    v-for="type in getTypesForCenter(center.costCenterId)" 
                    :key="type.id" 
                    :value="type.id"
                  >
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>
            
            <button 
              type="button" 
              class="mt-2 text-sm text-red-600 hover:text-red-800"
              @click="editingCustomer.costCenters.splice(index, 1)"
              v-if="editingCustomer.costCenters.length > 1"
            >
              Remover
            </button>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-end space-x-3 border-t pt-4">
          <button
            type="button"
            @click="showEditModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            :disabled="loading"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>