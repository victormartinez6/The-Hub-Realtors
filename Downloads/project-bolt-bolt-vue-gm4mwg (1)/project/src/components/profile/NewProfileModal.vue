<script setup lang="ts">
import { ref } from 'vue'
import { useProfileStore } from '../../stores/profile'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const profileStore = useProfileStore()

const newProfile = ref({
  name: '',
  description: '',
  color: 'blue',
  icon: 'pi-user',
  permissions: {
    dashboard: true,
    accounts: false,
    cashFlow: false,
    users: false,
    profile: true,
    banks: false,
    suppliers: false,
    customers: false,
    costCenter: false
  }
})

const colors = [
  { id: 'blue', name: 'Azul' },
  { id: 'green', name: 'Verde' },
  { id: 'purple', name: 'Roxo' },
  { id: 'red', name: 'Vermelho' },
  { id: 'yellow', name: 'Amarelo' }
]

const icons = [
  { id: 'pi-user', name: 'Usuário' },
  { id: 'pi-users', name: 'Grupo' },
  { id: 'pi-cog', name: 'Configuração' },
  { id: 'pi-shield', name: 'Escudo' },
  { id: 'pi-star', name: 'Estrela' }
]

const menuItems = {
  dashboard: 'Painel',
  accounts: 'Contas',
  cashFlow: 'Fluxo de Caixa',
  users: 'Usuários',
  profile: 'Perfil',
  banks: 'Bancos',
  suppliers: 'Fornecedores',
  customers: 'Clientes',
  costCenter: 'Centro de Custos'
}

async function handleSubmit() {
  const success = await profileStore.addProfile(newProfile.value)
  if (success) {
    emit('close')
    newProfile.value = {
      name: '',
      description: '',
      color: 'blue',
      icon: 'pi-user',
      permissions: {
        dashboard: true,
        accounts: false,
        cashFlow: false,
        users: false,
        profile: true,
        banks: false,
        suppliers: false,
        customers: false,
        costCenter: false
      }
    }
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Novo Perfil</h2>
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome</label>
          <input
            v-model="newProfile.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="newProfile.description"
            rows="2"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Cor</label>
            <select
              v-model="newProfile.color"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option v-for="color in colors" :key="color.id" :value="color.id">
                {{ color.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Ícone</label>
            <select
              v-model="newProfile.icon"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option v-for="icon in icons" :key="icon.id" :value="icon.id">
                {{ icon.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
          <div class="space-y-2">
            <div 
              v-for="(value, key) in newProfile.permissions" 
              :key="key"
              class="flex items-center"
            >
              <input
                :id="key"
                v-model="newProfile.permissions[key]"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label :for="key" class="ml-2 block text-sm text-gray-900">
                {{ menuItems[key as keyof typeof menuItems] }}
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="profileStore.loading"
          >
            <i v-if="profileStore.loading" class="pi pi-spin pi-spinner mr-2"></i>
            Adicionar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>