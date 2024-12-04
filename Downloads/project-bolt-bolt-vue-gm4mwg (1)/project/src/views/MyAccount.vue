<template>
  <div class="my-account p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Minha Conta</h1>

      <div class="bg-white rounded-lg shadow">
        <!-- Abas -->
        <div class="border-b px-6">
          <nav class="flex -mb-px">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2 -mb-px',
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i :class="['mr-2', tab.icon]"></i>
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Conteúdo -->
        <div class="p-6">
          <!-- Informações Pessoais -->
          <div v-if="currentTab === 'personal'" class="space-y-6">
            <form @submit.prevent="handlePersonalInfoSubmit" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input
                    v-model="personalInfo.name"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">E-mail</label>
                  <input
                    v-model="personalInfo.email"
                    type="email"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Telefone</label>
                  <input
                    v-model="personalInfo.phone"
                    type="tel"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Cargo</label>
                  <input
                    v-model="personalInfo.position"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  :disabled="loadingPersonal"
                >
                  <i v-if="loadingPersonal" class="pi pi-spin pi-spinner mr-2"></i>
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>

          <!-- Alterar Senha -->
          <div v-if="currentTab === 'security'" class="space-y-6">
            <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Senha Atual</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  :disabled="loadingPassword"
                >
                  <i v-if="loadingPassword" class="pi pi-spin pi-spinner mr-2"></i>
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const authStore = useAuthStore()

const currentTab = ref('personal')
const loadingPersonal = ref(false)
const loadingPassword = ref(false)

const tabs = [
  { id: 'personal', name: 'Informações Pessoais', icon: 'pi pi-user' },
  { id: 'security', name: 'Segurança', icon: 'pi pi-shield' }
]

const personalInfo = ref({
  name: '',
  email: '',
  phone: '',
  position: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  // Carregar dados do usuário
  const userData = authStore.userData
  if (userData) {
    personalInfo.value = {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      position: userData.position || ''
    }
  }
})

const handlePersonalInfoSubmit = async () => {
  try {
    loadingPersonal.value = true
    await authStore.updateUserProfile(personalInfo.value)
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Informações atualizadas com sucesso!',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível atualizar as informações.',
      life: 3000
    })
  } finally {
    loadingPersonal.value = false
  }
}

const handlePasswordSubmit = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'As senhas não coincidem.',
      life: 3000
    })
    return
  }

  try {
    loadingPassword.value = true
    await authStore.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Senha alterada com sucesso!',
      life: 3000
    })
    
    // Limpar formulário
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível alterar a senha.',
      life: 3000
    })
  } finally {
    loadingPassword.value = false
  }
}
</script>
