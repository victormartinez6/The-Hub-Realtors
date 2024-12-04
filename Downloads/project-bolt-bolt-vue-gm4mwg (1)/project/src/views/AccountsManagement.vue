<template>
  <div class="accounts-management">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Contas a Pagar e Receber</h1>
        <button 
          v-if="isAuthenticated" 
          @click="openAddModal"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Nova Conta
        </button>
      </div>

      <!-- Auth Check -->
      <div v-if="!isAuthenticated" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Você precisa estar logado para ver as contas.</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-8">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        <p class="mt-2 text-gray-600">Carregando...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{{ error }}</p>
        <button 
          @click="accountStore.fetchAccounts()"
          class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Tentar Novamente
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- A Pagar Card -->
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mr-4">
                  <i class="pi pi-money-bill text-red-600 text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">A Pagar</h3>
                  <p class="text-sm text-gray-500">Total de contas a pagar</p>
                </div>
              </div>
              <button 
                class="text-red-600 hover:text-red-800"
                v-tooltip="'Ver detalhes'"
              >
                <i class="pi pi-ellipsis-h"></i>
              </button>
            </div>
            <div class="flex items-baseline">
              <p class="text-2xl font-bold text-red-600">
                {{ formatCurrency(totalPayable) }}
              </p>
            </div>
          </div>

          <!-- A Receber Card -->
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                  <i class="pi pi-dollar text-green-600 text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">A Receber</h3>
                  <p class="text-sm text-gray-500">Total de contas a receber</p>
                </div>
              </div>
              <button 
                class="text-green-600 hover:text-green-800"
                v-tooltip="'Ver detalhes'"
              >
                <i class="pi pi-ellipsis-h"></i>
              </button>
            </div>
            <div class="flex items-baseline">
              <p class="text-2xl font-bold text-green-600">
                {{ formatCurrency(totalReceivable) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Filtros e Tabela -->
        <div class="bg-white rounded-lg shadow">
          <AccountFilters v-model="filters" />
          
          <div v-if="!filteredAndSortedAccounts.length" class="text-center py-8">
            <p class="text-gray-600">Nenhuma conta encontrada</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th 
                    @click="toggleSort('entityName')" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center">
                      Fornecedor/Cliente
                      <span v-if="sortConfig.key === 'entityName'" class="ml-1">
                        <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
                      </span>
                    </div>
                  </th>
                  <th 
                    @click="toggleSort('type')" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center">
                      Tipo
                      <span v-if="sortConfig.key === 'type'" class="ml-1">
                        <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
                      </span>
                    </div>
                  </th>
                  <th 
                    @click="toggleSort('amount')" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center">
                      Valor
                      <span v-if="sortConfig.key === 'amount'" class="ml-1">
                        <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
                      </span>
                    </div>
                  </th>
                  <th 
                    @click="toggleSort('dueDate')" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center">
                      Vencimento
                      <span v-if="sortConfig.key === 'dueDate'" class="ml-1">
                        <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
                      </span>
                    </div>
                  </th>
                  <th 
                    @click="toggleSort('scheduledFor')" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center">
                      Agendado Para
                      <span v-if="sortConfig.key === 'scheduledFor'" class="ml-1">
                        <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
                      </span>
                    </div>
                  </th>
                  <th 
                    @click="toggleSort('statusId')" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div class="flex items-center">
                      Status
                      <span v-if="sortConfig.key === 'statusId'" class="ml-1">
                        <i :class="sortConfig.direction === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down'"></i>
                      </span>
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(account, index) in filteredAndSortedAccounts" :key="account.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ getEntityName(account) }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="account.type === 'payable' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    >
                      {{ account.type === 'payable' ? 'A Pagar' : 'A Receber' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatCurrency(account.amount) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(account.dueDate) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ account.scheduledFor ? formatDate(account.scheduledFor) : '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusColor(account.statusId)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatusText(account.statusId) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      @click="openScheduleModal(account)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Programar Conta"
                    >
                      <i class="pi pi-calendar-plus"></i>
                    </button>
                    <button
                      @click="editAccount(account)"
                      class="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button
                      @click="confirmDelete(account)"
                      class="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- Add Account Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Nova Conta</h3>
          <button @click="closeAddModal" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">Fechar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <select 
                v-model="newAccount.type"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="payable">A Pagar</option>
                <option value="receivable">A Receber</option>
              </select>
            </div>

            <div v-if="newAccount.type === 'payable'" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Fornecedor</label>
              <select 
                v-model="newAccount.supplierId"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um fornecedor</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <div v-if="newAccount.type === 'receivable'" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Cliente</label>
              <select 
                v-model="newAccount.customerId"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <input 
                type="text"
                v-model="newAccount.description"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Valor</label>
              <input 
                type="number"
                step="0.01"
                v-model="newAccount.amount"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Data de Vencimento</label>
              <input 
                type="date"
                v-model="newAccount.dueDate"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Agendado Para</label>
              <input 
                type="date"
                v-model="newAccount.scheduledFor"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div v-if="(newAccount.type === 'payable' && newAccount.supplierId) || (newAccount.type === 'receivable' && newAccount.customerId)" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
              <div v-if="availableCostCenters.length === 1" class="mt-1 block w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                {{ availableCostCenters[0].name }}
              </div>
              <select 
                v-else
                v-model="newAccount.costCenterId"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um centro de custo</option>
                <option v-for="costCenter in availableCostCenters" :key="costCenter.id" :value="costCenter.id">
                  {{ costCenter.name }}
                </option>
              </select>
            </div>

            <div v-if="newAccount.costCenterId" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Tipo de Custo</label>
              <div class="mt-1 block w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                {{ costTypes.find(ct => ct.id === availableCostCenters.find(cc => cc.id === newAccount.costCenterId)?.costTypeId)?.name || 'Carregando...' }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select 
                v-model="newAccount.statusId"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="scheduled">Agendado</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeAddModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading"
            >
              <span v-if="loading">Salvando...</span>
              <span v-else>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <h3 class="text-lg font-semibold mb-4">Editar Conta</h3>
        
        <!-- Informações atuais -->
        <div v-if="editingAccount.dueDate || editingAccount.scheduledFor" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium mb-2">Informações Atuais:</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div v-if="editingAccount.dueDate">
              <span class="font-medium">Vencimento:</span>
              <p class="text-gray-600">{{ formatDate(editingAccount.dueDate) }}</p>
            </div>
            <div v-if="editingAccount.scheduledFor">
              <span class="font-medium">Programado Para:</span>
              <p class="text-gray-600">{{ formatDate(editingAccount.scheduledFor) }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleEdit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <select 
                v-model="editingAccount.type"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="payable">A Pagar</option>
                <option value="receivable">A Receber</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <input 
                v-model="editingAccount.description"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Valor</label>
              <input 
                v-model.number="editingAccount.amount"
                type="number"
                step="0.01"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Vencimento</label>
              <input 
                v-model="editingAccount.dueDate"
                type="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Programado Para</label>
              <input 
                v-model="editingAccount.scheduledFor"
                type="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <!-- Campos específicos baseados no tipo -->
            <div v-if="editingAccount.type === 'payable'" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Fornecedor</label>
              <select 
                v-model="selectedSupplier"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um fornecedor</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier">
                  {{ supplier.name }}
                </option>
              </select>

              <!-- Centro de Custo do Fornecedor -->
              <div v-if="selectedSupplier && selectedSupplier.costCenters?.length > 0" class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                </div>
                <div class="space-y-4">
                  <div v-for="(center, index) in selectedSupplier.costCenters" :key="index" class="p-4 bg-gray-50 rounded-lg">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                        <select
                          v-model="editingAccount.costCenterId"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Selecione um centro de custo</option>
                          <option :value="center.costCenterId">
                            {{ costCenters.find(c => c.id === center.costCenterId)?.name || 'Não definido' }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Tipo de Custo</label>
                        <select
                          v-model="editingAccount.costTypeId"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Selecione um tipo de custo</option>
                          <option :value="center.costTypeId">
                            {{ costCenterStore.getCostTypesForCenter(center.costCenterId).find(t => t.id === center.costTypeId)?.name || 'Não definido' }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="editingAccount.type === 'receivable'" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Cliente</label>
              <select 
                v-model="selectedCustomer"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer">
                  {{ customer.name }}
                </option>
              </select>

              <!-- Centro de Custo do Cliente -->
              <div v-if="selectedCustomer && selectedCustomer.costCenters?.length > 0" class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                </div>
                <div class="space-y-4">
                  <div v-for="(center, index) in selectedCustomer.costCenters" :key="index" class="p-4 bg-gray-50 rounded-lg">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Centro de Custo</label>
                        <select
                          v-model="editingAccount.costCenterId"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Selecione um centro de custo</option>
                          <option :value="center.costCenterId">
                            {{ costCenters.find(c => c.id === center.costCenterId)?.name || 'Não definido' }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Tipo de Custo</label>
                        <select
                          v-model="editingAccount.costTypeId"
                          required
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Selecione um tipo de custo</option>
                          <option :value="center.costTypeId">
                            {{ costCenterStore.getCostTypesForCenter(center.costCenterId).find(t => t.id === center.costTypeId)?.name || 'Não definido' }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select 
                v-model="editingAccount.statusId"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="scheduled">Programado</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button 
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-xl max-w-sm mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Excluir Conta</h3>
          <button @click="showDeleteModal = false" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">Fechar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-gray-600 mb-4">
          Tem certeza que deseja excluir esta conta?
        </p>
        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="showDeleteModal = false"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleDelete"
            class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div v-if="showScheduleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Programar Conta</h3>
          <button @click="showScheduleModal = false" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">Fechar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="font-medium">Fornecedor/Cliente:</span>
              <p class="text-gray-600">{{ getEntityName(accountToSchedule) }}</p>
            </div>
            <div>
              <span class="font-medium">Valor:</span>
              <p class="text-gray-600">{{ formatCurrency(accountToSchedule?.amount || 0) }}</p>
            </div>
            <div>
              <span class="font-medium">Vencimento:</span>
              <p class="text-gray-600">{{ formatDate(accountToSchedule?.dueDate || '') }}</p>
            </div>
            <div>
              <span class="font-medium">Status Atual:</span>
              <p>
                <span :class="getStatusColor(accountToSchedule?.statusId || '')" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(accountToSchedule?.statusId || '') }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSchedule" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Data de Agendamento</label>
            <input 
              v-model="scheduledDate"
              type="date"
              required
              :min="new Date().toISOString().split('T')[0]"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="showScheduleModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              :disabled="loading"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading"
            >
              <span v-if="loading">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                Agendando...
              </span>
              <span v-else>Agendar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAccountStore } from '../stores/account'
import { useAuthStore } from '../stores/auth'
import { useSupplierStore } from '../stores/supplier'
import { useCustomerStore } from '../stores/customer'
import { useCostCenterStore } from '../stores/costCenter'
import { Account } from '../firebase/services/accounts.service'
import { storeToRefs } from 'pinia'
import AccountFilters from '@/components/AccountFilters.vue'

const accountStore = useAccountStore()
const authStore = useAuthStore()
const supplierStore = useSupplierStore()
const customerStore = useCustomerStore()
const costCenterStore = useCostCenterStore()

// Refs do estado
const { isAuthenticated } = storeToRefs(authStore)
const { accounts, loading, error } = storeToRefs(accountStore)
const { suppliers } = storeToRefs(supplierStore)
const { customers } = storeToRefs(customerStore)
const { costCenters } = storeToRefs(costCenterStore)

// Estados dos modais e dados
const showScheduleModal = ref(false)
const showAddModal = ref(false)  
const accountToSchedule = ref<Account | null>(null)
const scheduledDate = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const accountToDelete = ref<Account | null>(null)
const editingAccount = ref<Account | null>(null)

// Estados do formulário
const newAccount = ref({
  type: 'payable',
  description: '',
  amount: 0,
  dueDate: new Date().toISOString().split('T')[0],
  scheduledFor: '',
  costTypeId: '',
  costCenterId: '',
  statusId: 'pending',
  supplierId: '', 
  customerId: '' 
})

const selectedSupplier = ref(null)
const selectedCustomer = ref(null)
const availableCostCenters = ref([])
const availableCostTypes = ref([])

// Estados de filtro e ordenação
const filters = ref({
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
})

const sortConfig = ref({
  key: '' as keyof Account | 'entityName' | '',
  direction: 'asc' as 'asc' | 'desc'
})

const columns = [
  { key: 'entityName', label: 'Fornecedor/Cliente', sortable: true },
  { key: 'type', label: 'Tipo', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true },
  { key: 'dueDate', label: 'Vencimento', sortable: true },
  { key: 'scheduledFor', label: 'Agendado Para', sortable: true },
  { key: 'statusId', label: 'Status', sortable: true }
]

const totalPayable = computed(() => 
  accounts.value
    .filter(acc => acc.type === 'payable')
    .reduce((sum, acc) => sum + acc.amount, 0)
)

const totalReceivable = computed(() => 
  accounts.value
    .filter(acc => acc.type === 'receivable')
    .reduce((sum, acc) => sum + acc.amount, 0)
)

const balance = computed(() => totalReceivable.value - totalPayable.value)

const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    const matchEntityName = !filters.value.entityName || 
      getEntityName(account).toLowerCase().includes(filters.value.entityName.toLowerCase())
    
    const matchType = !filters.value.type || 
      account.type === filters.value.type
    
    const matchStatus = !filters.value.statusId || 
      account.statusId === filters.value.statusId
    
    const matchAmount = (!filters.value.amount.min || account.amount >= filters.value.amount.min) && 
      (!filters.value.amount.max || account.amount <= filters.value.amount.max)
    
    const matchDueDate = (!filters.value.dueDate.start || account.dueDate >= filters.value.dueDate.start) && 
      (!filters.value.dueDate.end || account.dueDate <= filters.value.dueDate.end)
    
    const matchScheduledFor = (!filters.value.scheduledFor.start || !account.scheduledFor || account.scheduledFor >= filters.value.scheduledFor.start) && 
      (!filters.value.scheduledFor.end || !account.scheduledFor || account.scheduledFor <= filters.value.scheduledFor.end)
    
    return matchEntityName && matchType && matchStatus && matchAmount && matchDueDate && matchScheduledFor
  })
})

const filteredAndSortedAccounts = computed(() => {
  let sorted = [...filteredAccounts.value]
  
  if (sortConfig.value.key) {
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.value.key]
      let bValue = b[sortConfig.value.key]
      
      if (sortConfig.value.key === 'entityName') {
        aValue = getEntityName(a)
        bValue = getEntityName(b)
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortConfig.value.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.value.direction === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return sorted
})

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  try {
    const [year, month, day] = date.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return date
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendente'
    case 'paid':
      return 'Pago'
    case 'overdue':
      return 'Atrasado'
    case 'scheduled':
      return 'Programado'
    default:
      return status
  }
}

const handleSubmit = async () => {
  try {
    if (newAccount.value.type === 'payable') {
      if (!newAccount.value.supplierId) {
        throw new Error('Fornecedor é obrigatório para contas a pagar')
      }
    }

    if (newAccount.value.type === 'receivable') {
      if (!newAccount.value.customerId) {
        throw new Error('Cliente é obrigatório para contas a receber')
      }
    }

    // Validar se o centro de custo e tipo de custo foram selecionados
    if (!newAccount.value.costCenterId) {
      throw new Error('Centro de custo é obrigatório')
    }

    // Criar a conta
    loading.value = true
    await accountStore.addAccount({
      ...newAccount.value,
      dueDate: new Date(newAccount.value.dueDate).toISOString(),
      scheduledFor: newAccount.value.scheduledFor ? new Date(newAccount.value.scheduledFor).toISOString() : '',
      statusId: newAccount.value.scheduledFor ? 'scheduled' : (newAccount.value.statusId || 'pending'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Limpar o formulário e fechar o modal
    closeAddModal()
    loading.value = false
  } catch (error) {
    console.error('Erro ao criar conta:', error)
    loading.value = false
    // Mostrar mensagem de erro
    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Erro ao criar conta')
    }
  }
}

const openScheduleModal = (account: Account) => {
  console.log('Abrindo modal de agendamento para conta:', account)
  accountToSchedule.value = account
  scheduledDate.value = account.scheduledFor || new Date().toISOString().split('T')[0]
  showScheduleModal.value = true
}

const handleSchedule = async () => {
  if (!accountToSchedule.value || !scheduledDate.value) {
    alert('Por favor, selecione uma data de agendamento')
    return
  }

  try {
    loading.value = true
    
    // Converte a data para o formato ISO
    const scheduledDateISO = new Date(scheduledDate.value).toISOString()
    
    // Atualiza a data de agendamento e o status da conta
    await accountStore.editAccount(accountToSchedule.value.id, {
      scheduledFor: scheduledDateISO,
      statusId: 'scheduled' // Altera o status para PROGRAMADO
    })

    // Fecha o modal e limpa os dados
    showScheduleModal.value = false
    accountToSchedule.value = null
    scheduledDate.value = ''

    // Atualiza a lista de contas
    await accountStore.fetchAccounts(true)

    // Notifica o usuário
    alert('Conta programada com sucesso')
  } catch (error) {
    console.error('Erro ao programar conta:', error)
    alert('Erro ao programar conta')
  } finally {
    loading.value = false
  }
}

const editAccount = (account: Account) => {
  editingAccount.value = {
    id: account.id,
    type: account.type,
    description: account.description,
    amount: account.amount,
    dueDate: account.dueDate ? new Date(account.dueDate).toISOString().split('T')[0] : '',
    scheduledFor: account.scheduledFor ? new Date(account.scheduledFor).toISOString().split('T')[0] : '',
    supplierId: account.supplierId || '',
    customerId: account.customerId || '',
    costCenterId: account.costCenterId || '',
    costTypeId: account.costTypeId || '',
    statusId: account.statusId || ''
  }

  // Atualizar seleção de fornecedor/cliente
  if (account.type === 'payable' && account.supplierId) {
    selectedSupplier.value = suppliers.value.find(s => s.id === account.supplierId) || null
  } else if (account.type === 'receivable' && account.customerId) {
    selectedCustomer.value = customers.value.find(c => c.id === account.customerId) || null
  }

  showEditModal.value = true
}

const handleEdit = async () => {
  if (!editingAccount.value) return

  try {
    loading.value = true
    console.log('Salvando edição:', editingAccount.value)
    
    const accountData = {
      ...editingAccount.value,
      costCenterId: editingAccount.value.costCenterId,
      costTypeId: editingAccount.value.costTypeId
    }
    
    await accountStore.editAccount(accountData.id, accountData)
    showEditModal.value = false
    editingAccount.value = null
    await accountStore.fetchAccounts(true)

    alert('Conta atualizada com sucesso')
  } catch (error) {
    console.error('Erro ao editar conta:', error)
    alert('Erro ao atualizar conta')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (account: Account) => {
  accountToDelete.value = account
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!accountToDelete.value) return

  try {
    loading.value = true
    await accountStore.removeAccount(accountToDelete.value.id)
    showDeleteModal.value = false
    accountToDelete.value = null
    await accountStore.fetchAccounts(true)
  } catch (error) {
    console.error('Erro ao excluir conta:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  showAddModal.value = true  
  newAccount.value = {
    type: 'payable',
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    scheduledFor: '', // Limpar o campo scheduledFor
    costTypeId: '',
    costCenterId: '',
    statusId: 'pending',
    supplierId: '', 
    customerId: '' 
  }
  availableCostCenters.value = []
  availableCostTypes.value = []
}

const closeAddModal = () => {
  showAddModal.value = false
  newAccount.value = {
    type: 'payable',
    description: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    scheduledFor: '', // Limpar o campo scheduledFor
    costTypeId: '',
    costCenterId: '',
    statusId: 'pending',
    supplierId: '', 
    customerId: '' 
  }
  availableCostCenters.value = []
  availableCostTypes.value = []
}

const getEntityName = (account: Account): string => {
  if (account.type === 'payable') {
    const supplier = suppliers.value.find(s => s.id === account.supplierId)
    return supplier ? supplier.name : 'Fornecedor não encontrado'
  } else {
    const customer = customers.value.find(c => c.id === account.customerId)
    return customer ? customer.name : 'Cliente não encontrado'
  }
}

const toggleSort = (key: typeof sortConfig.value.key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

watch(() => newAccount.value.supplierId, async (newSupplierId) => {
  if (newSupplierId && newAccount.value.type === 'payable') {
    try {
      // Limpar seleções anteriores
      newAccount.value.costCenterId = ''
      newAccount.value.costTypeId = ''
      availableCostCenters.value = []
      availableCostTypes.value = []
      
      // Encontrar o fornecedor selecionado
      const selectedSupplier = suppliers.value.find(s => s.id === newSupplierId)
      if (selectedSupplier?.costCenters?.length > 0) {
        // Buscar os detalhes dos centros de custo
        const supplierCostCenters = await Promise.all(
          selectedSupplier.costCenters.map(async (cc) => {
            const center = costCenters.value.find(c => c.id === cc.costCenterId)
            if (center) {
              return {
                ...center,
                costTypeId: cc.costTypeId
              }
            }
            return null
          })
        )

        // Filtrar centros nulos e atualizar a lista
        availableCostCenters.value = supplierCostCenters.filter(cc => cc !== null)

        // Se houver apenas um centro de custo, seleciona automaticamente
        if (availableCostCenters.value.length === 1) {
          const costCenter = availableCostCenters.value[0]
          newAccount.value.costCenterId = costCenter.id || ''
          newAccount.value.costTypeId = costCenter.costTypeId
        }
      }
    } catch (error) {
      console.error('Erro ao buscar centros de custo do fornecedor:', error)
    }
  } else {
    newAccount.value.costCenterId = ''
    newAccount.value.costTypeId = ''
    availableCostCenters.value = []
    availableCostTypes.value = []
  }
})

watch(() => newAccount.value.customerId, async (newCustomerId) => {
  if (newCustomerId && newAccount.value.type === 'receivable') {
    try {
      // Limpar seleções anteriores
      newAccount.value.costCenterId = ''
      newAccount.value.costTypeId = ''
      availableCostCenters.value = []
      availableCostTypes.value = []
      
      // Encontrar o cliente selecionado
      const selectedCustomer = customers.value.find(c => c.id === newCustomerId)
      if (selectedCustomer?.costCenters?.length > 0) {
        // Buscar os detalhes dos centros de custo
        const customerCostCenters = await Promise.all(
          selectedCustomer.costCenters.map(async (cc) => {
            const center = costCenters.value.find(c => c.id === cc.costCenterId)
            if (center) {
              return {
                ...center,
                costTypeId: cc.costTypeId
              }
            }
            return null
          })
        )

        // Filtrar centros nulos e atualizar a lista
        availableCostCenters.value = customerCostCenters.filter(cc => cc !== null)

        // Se houver apenas um centro de custo, seleciona automaticamente
        if (availableCostCenters.value.length === 1) {
          const costCenter = availableCostCenters.value[0]
          newAccount.value.costCenterId = costCenter.id || ''
          newAccount.value.costTypeId = costCenter.costTypeId
        }
      }
    } catch (error) {
      console.error('Erro ao buscar centros de custo do cliente:', error)
    }
  } else {
    newAccount.value.costCenterId = ''
    newAccount.value.costTypeId = ''
    availableCostCenters.value = []
    availableCostTypes.value = []
  }
})

// Watcher para atualizar tipo de custo quando o centro de custo é selecionado manualmente
watch(() => newAccount.value.costCenterId, async (newCostCenterId) => {
  if (newCostCenterId) {
    try {
      // Encontrar o centro de custo selecionado
      const selectedCenter = availableCostCenters.value.find(cc => cc.id === newCostCenterId)
      if (selectedCenter) {
        // Já temos o tipo de custo associado ao centro de custo
        newAccount.value.costTypeId = selectedCenter.costTypeId
      }
    } catch (error) {
      console.error('Erro ao atualizar tipo de custo:', error)
    }
  } else {
    newAccount.value.costTypeId = ''
  }
})

watch(() => newAccount.value.type, () => {
  newAccount.value.supplierId = ''
  newAccount.value.customerId = ''
  newAccount.value.costCenterId = ''
  newAccount.value.costTypeId = ''
  availableCostCenters.value = []
  availableCostTypes.value = []
})

onMounted(async () => {
  console.log('[AccountsManagement] Component mounted')
  console.log('[AccountsManagement] Auth state:', { isAuthenticated: isAuthenticated.value })
  
  if (isAuthenticated.value) {
    try {
      console.log('[AccountsManagement] Starting data fetch...')
      await Promise.all([
        accountStore.fetchAccounts(),
        costCenterStore.fetchCostCenters(),
        supplierStore.fetchSuppliers(),
        customerStore.fetchCustomers()
      ])
      console.log('[AccountsManagement] Data fetch complete')
    } catch (e) {
      console.error('[AccountsManagement] Error loading data:', e)
    }
  }
})

const costTypes = ref<CostType[]>([])

// Buscar tipos de custo quando o centro de custo mudar
watch(() => newAccount.value.costCenterId, async (newCostCenterId) => {
  if (newCostCenterId) {
    try {
      costTypes.value = await costCenterStore.fetchCostTypesByCostCenter(newCostCenterId)
    } catch (error) {
      console.error('Erro ao buscar tipos de custo:', error)
      costTypes.value = []
    }
  } else {
    costTypes.value = []
  }
})

// Atualizar centro de custo e tipo de custo quando houver apenas uma opção
watch(availableCostCenters, (centers) => {
  if (centers.length === 1) {
    newAccount.value.costCenterId = centers[0].id
    newAccount.value.costTypeId = centers[0].costTypeId
  }
}, { immediate: true })
</script>

<style scoped>
.accounts-management {
  @apply h-full;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>