<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUser } from '../../firebase/services/auth.service'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = ref({
  name: '',
  email: '',
  document: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)

async function handleRegister() {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'As senhas não conferem'
    return
  }

  try {
    loading.value = true
    error.value = ''

    await createUser(
      {
        name: form.value.name,
        email: form.value.email,
        document: form.value.document,
        role: 'user'
      },
      form.value.password
    )

    router.push('/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar Conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="name" class="sr-only">Nome</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="document" class="sr-only">CPF/CNPJ</label>
            <input
              v-model="form.document"
              id="document"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="CPF/CNPJ"
            />
          </div>
          <div class="relative">
            <label for="password" class="sr-only">Senha</label>
            <input
              v-model="form.password"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Senha"
            />
          </div>
          <div class="relative">
            <label for="confirmPassword" class="sr-only">Confirmar Senha</label>
            <input
              v-model="form.confirmPassword"
              id="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Confirmar senha"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <i :class="[showPassword ? 'pi pi-eye-slash' : 'pi pi-eye']"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span v-if="loading">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Criando conta...
            </span>
            <span v-else>Criar conta</span>
          </button>
        </div>

        <div class="text-sm text-center">
          <router-link
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            Já tem uma conta? Entre aqui
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>