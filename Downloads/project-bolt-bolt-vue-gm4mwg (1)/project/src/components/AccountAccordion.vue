<!-- Accounts List with Accordion -->
<div v-if="!accounts.length" class="text-center py-8">
  <p class="text-gray-600">Nenhuma conta encontrada</p>
</div>
<div v-else class="accordion mt-6" id="accountsAccordion">
  <div v-for="(account, index) in accounts" :key="account.id" class="accordion-item border mb-3 rounded-lg shadow-sm">
    <h2 class="accordion-header">
      <button 
        class="accordion-button rounded-lg"
        :class="{ 'collapsed': !isExpanded(index) }"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="'#collapse' + index"
        :aria-expanded="isExpanded(index)"
        :aria-controls="'collapse' + index"
      >
        <div class="grid grid-cols-6 w-full gap-4 items-center">
          <div class="col-span-2">
            <div class="font-medium">{{ getEntityName(account) }}</div>
            <span 
              class="text-xs px-2 py-1 rounded-full mt-1 inline-block"
              :class="account.type === 'payable' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
            >
              {{ account.type === 'payable' ? 'A Pagar' : 'A Receber' }}
            </span>
          </div>
          <div class="text-right">
            <span :class="account.type === 'payable' ? 'text-red-600' : 'text-green-600'">
              {{ formatCurrency(account.amount) }}
            </span>
          </div>
          <div>{{ formatDate(account.dueDate) }}</div>
          <div>
            <span :class="getStatusColor(account.statusId)" class="px-2 py-1 rounded-full text-xs">
              {{ getStatusText(account.statusId) }}
            </span>
          </div>
          <div class="text-right">
            {{ account.scheduledFor ? formatDate(account.scheduledFor) : '-' }}
          </div>
        </div>
      </button>
    </h2>
    <div 
      :id="'collapse' + index"
      class="accordion-collapse collapse"
      :aria-labelledby="'heading' + index"
      data-bs-parent="#accountsAccordion"
    >
      <div class="accordion-body bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Detalhes -->
          <div>
            <h4 class="font-semibold mb-4">Detalhes da Conta</h4>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-gray-600">Descrição:</dt>
                <dd class="font-medium">{{ account.description }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Vencimento:</dt>
                <dd class="font-medium">{{ formatDate(account.dueDate) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Agendado para:</dt>
                <dd class="font-medium">{{ account.scheduledFor ? formatDate(account.scheduledFor) : '-' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Status:</dt>
                <dd>
                  <span :class="getStatusColor(account.statusId)" class="px-2 py-1 rounded-full text-xs">
                    {{ getStatusText(account.statusId) }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <!-- Ações -->
          <div>
            <h4 class="font-semibold mb-4">Ações</h4>
            <div class="space-y-2">
              <button
                @click="openScheduleModal(account)"
                class="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                <i class="pi pi-calendar-plus mr-2"></i>
                Programar
              </button>
              <button
                @click="editAccount(account)"
                class="w-full flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
              >
                <i class="pi pi-pencil mr-2"></i>
                Editar
              </button>
              <button
                @click="confirmDelete(account)"
                class="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                <i class="pi pi-trash mr-2"></i>
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.accordion-button {
  @apply p-4 bg-white hover:bg-gray-50 transition-colors duration-200;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 0;
  border-radius: 0;
  overflow-anchor: none;
}

.accordion-button:not(.collapsed) {
  @apply bg-gray-50;
  box-shadow: none;
}

.accordion-button:focus {
  @apply ring-2 ring-offset-2 ring-blue-500;
  box-shadow: none;
  border-color: transparent;
  outline: 0;
}

.accordion-button::after {
  @apply ml-auto;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: auto;
  content: "";
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%234B5563'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-size: 1.25rem;
  transition: transform .2s ease-in-out;
}

.accordion-button:not(.collapsed)::after {
  transform: rotate(-180deg);
}

.accordion-item {
  @apply rounded-lg overflow-hidden;
  background-color: #fff;
}

.accordion-body {
  @apply p-6;
}

.accordion-collapse {
  transition: all 0.3s ease-in-out;
}

.collapse:not(.show) {
  display: none;
}

.collapse.show {
  display: block;
}

.collapsing {
  height: 0;
  overflow: hidden;
  transition: height 0.35s ease;
}
</style>
