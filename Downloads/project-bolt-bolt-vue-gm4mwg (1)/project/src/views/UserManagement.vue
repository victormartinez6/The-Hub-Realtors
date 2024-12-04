<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useProfileStore } from '../stores/profile'
import { useDocumentMask } from '../utils/masks'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

const userStore = useUserStore()
const profileStore = useProfileStore()
const showNewUserForm = ref(false)
const showConfirmBlock = ref(false)
const userToBlock = ref<any>(null)
const { document, maskedDocument } = useDocumentMask()

const newUser = ref({
  name: '',
  email: '',
  password: '',
  profileId: '',
  role: 'user'
})

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    profileStore.fetchProfiles()
  ])
})

const availableProfiles = computed(() => {
  return profileStore.profiles.filter(profile => profile.active)
})

async function addUser() {
  try {
    const selectedProfile = profileStore.profiles.find(p => p.id === newUser.value.profileId)
    if (!selectedProfile) return

    const success = await userStore.addUser({
      name: newUser.value.name,
      email: newUser.value.email,
      document: document.value,
      role: selectedProfile.role || 'user',
      profileId: newUser.value.profileId
    }, newUser.value.password)

    if (success) {
      showNewUserForm.value = false
      newUser.value = { 
        name: '', 
        email: '', 
        password: '', 
        profileId: '',
        role: 'user' 
      }
      document.value = ''
    }
  } catch (e) {
    console.error('Error adding user:', e)
  }
}

function confirmBlock(user: any) {
  userToBlock.value = user
  showConfirmBlock.value = true
}

async function handleBlock() {
  if (!userToBlock.value) return

  try {
    await userStore.deleteUser(userToBlock.value.id)
    showConfirmBlock.value = false
    userToBlock.value = null
  } catch (e) {
    console.error('Error blocking user:', e)
  }
}

const getUserProfile = (profileId: string) => {
  const profile = profileStore.profiles.find(p => p.id === profileId)
  return profile?.name || 'N/A'
}

const getProfileColor = (profileId: string) => {
  const profile = profileStore.profiles.find(p => p.id === profileId)
  return profile?.color || 'gray'
}

const getProfileBadgeClasses = (profileId: string) => {
  const color = getProfileColor(profileId)
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800'
  }
  return `${colors[color as keyof typeof colors]} px-2 inline-flex text-xs leading-5 font-semibold rounded-full`
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestão de Usuários</h1>
      <button
        @click="showNewUserForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Adicionar Usuário
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.loading || profileStore.loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="userStore.error || profileStore.error" class="text-center py-8 text-red-600">
      {{ userStore.error || profileStore.error }}
    </div>
    
    <!-- Users Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in userStore.users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ user.document }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getProfileBadgeClasses(user.profileId)">
                {{ getUserProfile(user.profileId) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ user.active ? 'Ativo' : 'Bloqueado' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button 
                v-if="user.active"
                @click="confirmBlock(user)"
                class="text-red-600 hover:text-red-900"
              >
                Bloquear
              </button>
            </td>
          </tr>
          <tr v-if="userStore.users.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              Nenhum usuário encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Novo Usuário -->
    <div v-if="showNewUserForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Adicionar Novo Usuário</h2>
        <form @submit.prevent="addUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              v-model="newUser.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
            <input
              v-model="maskedDocument"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Senha</label>
            <input
              v-model="newUser.password"
              type="password"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Perfil</label>
            <select
              v-model="newUser.profileId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Selecione um perfil</option>
              <option 
                v-for="profile in availableProfiles" 
                :key="profile.id" 
                :value="profile.id"
              >
                {{ profile.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showNewUserForm = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="userStore.loading"
            >
              <i v-if="userStore.loading" class="pi pi-spin pi-spinner mr-2"></i>
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Block Dialog -->
    <ConfirmDialog
      :show="showConfirmBlock"
      title="Confirmar Bloqueio"
      message="Tem certeza que deseja bloquear este usuário?"
      @confirm="handleBlock"
      @cancel="showConfirmBlock = false"
    />
  </div>
</template>