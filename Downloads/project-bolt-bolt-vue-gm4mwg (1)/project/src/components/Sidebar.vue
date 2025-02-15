<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import Logo from './Logo.vue'

const router = useRouter()
const authStore = useAuthStore()
const { userData } = storeToRefs(authStore)
const isOpen = ref(false)
const isCollapsed = ref(false)

const menuItems = computed(() => {
  const items = [
    { 
      path: '/', 
      name: 'Painel', 
      icon: 'pi pi-home', 
      description: 'Painel principal com visão geral do sistema' 
    },
    { 
      path: '/accounts', 
      name: 'Contas a Pagar e Receber', 
      icon: 'pi pi-money-bill', 
      description: 'Gerenciamento de contas e transações' 
    },
    { 
      path: '/cash-flow', 
      name: 'Fluxo de Caixa', 
      icon: 'pi pi-chart-line', 
      description: 'Relatórios e análises financeiras' 
    }
  ]

  if (userData.value?.role === 'admin') {
    items.push({ 
      path: '/users', 
      name: 'Usuários', 
      icon: 'pi pi-users', 
      description: 'Gerenciamento de usuários' 
    })
  }

  items.push({ 
    path: '/profile', 
    name: 'Perfil', 
    icon: 'pi pi-user', 
    description: 'Configurações do seu perfil de usuário' 
  })

  return items
})

const settingsItems = [
  { 
    path: '/settings/banks', 
    name: 'Bancos', 
    icon: 'pi pi-building', 
    description: 'Configurações de bancos' 
  },
  { 
    path: '/settings/suppliers', 
    name: 'Fornecedores', 
    icon: 'pi pi-briefcase', 
    description: 'Gerenciamento de fornecedores' 
  },
  { 
    path: '/settings/customers', 
    name: 'Meus Clientes', 
    icon: 'pi pi-users', 
    description: 'Gerenciamento de clientes' 
  },
  { 
    path: '/settings/cost-center', 
    name: 'Centro de Custos', 
    icon: 'pi pi-chart-pie', 
    description: 'Gerenciamento de centro de custos' 
  },
  { 
    path: '/settings/payment-status', 
    name: 'Status de Pagamento', 
    icon: 'pi pi-tag', 
    description: 'Gerenciamento de status de pagamento' 
  }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="relative">
    <!-- Mobile Menu Button -->
    <button 
      @click="isOpen = !isOpen"
      class="lg:hidden fixed top-4 right-4 z-20 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
      aria-label="Menu"
      v-tooltip="isOpen ? 'Fechar menu' : 'Abrir menu'"
    >
      <i :class="[isOpen ? 'pi pi-times' : 'pi pi-bars', 'text-xl text-gray-700']"></i>
    </button>

    <!-- Sidebar -->
    <aside 
      :class="[
        'bg-white border-r border-gray-100 flex flex-col transition-all duration-300',
        'fixed lg:static inset-y-0 left-0 z-10',
        isCollapsed ? 'w-16' : 'w-[85vw] sm:w-72 lg:w-72',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo e Botão de Colapso -->
      <div class="border-b">
        <div class="p-4">
          <Logo :collapsed="isCollapsed" />
        </div>
        <!-- Collapse Button -->
        <button
          @click="isCollapsed = !isCollapsed"
          class="hidden lg:flex items-center justify-center absolute -right-3 w-6 h-6 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          style="top: 64px;"
          :aria-label="isCollapsed ? 'Expandir menu' : 'Recolher menu'"
          v-tooltip="isCollapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <i :class="[isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left', 'text-gray-600 text-sm']"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <!-- Menu Principal -->
        <ul class="space-y-1 px-3">
          <li v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              class="flex items-center rounded-lg text-gray-600 transition-all"
              :class="[
                { 
                  'bg-blue-50 text-blue-600 hover:bg-blue-100': userData?.role === 'admin',
                  'bg-green-50 text-green-600 hover:bg-green-100': userData?.role === 'manager',
                  'bg-yellow-50 text-yellow-600 hover:bg-yellow-100': userData?.role === 'user'
                }[$route.path === item.path ? userData?.role : ''],
                {
                  'hover:bg-blue-50 hover:text-blue-600': userData?.role === 'admin',
                  'hover:bg-green-50 hover:text-green-600': userData?.role === 'manager',
                  'hover:bg-yellow-50 hover:text-yellow-600': userData?.role === 'user'
                },
                isCollapsed ? 'justify-center w-10 h-10 mx-auto menu-item-collapsed' : 'px-3 py-2'
              ]"
              @click="isOpen = false"
              v-tooltip="isCollapsed ? item.description : ''"
            >
              <i :class="[item.icon, 'text-xl', isCollapsed ? '' : 'mr-3 w-5']"></i>
              <span v-if="!isCollapsed" class="whitespace-nowrap">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>

        <!-- Configurações -->
        <div class="mt-6">
          <h2 v-if="!isCollapsed" class="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Configurações
          </h2>
          <ul class="space-y-1 px-3">
            <li v-for="item in settingsItems" :key="item.path">
              <router-link
                :to="item.path"
                class="flex items-center rounded-lg text-gray-600 transition-all"
                :class="[
                  { 
                    'bg-blue-50 text-blue-600 hover:bg-blue-100': userData?.role === 'admin',
                    'bg-green-50 text-green-600 hover:bg-green-100': userData?.role === 'manager',
                    'bg-yellow-50 text-yellow-600 hover:bg-yellow-100': userData?.role === 'user'
                  }[$route.path === item.path ? userData?.role : ''],
                  {
                    'hover:bg-blue-50 hover:text-blue-600': userData?.role === 'admin',
                    'hover:bg-green-50 hover:text-green-600': userData?.role === 'manager',
                    'hover:bg-yellow-50 hover:text-yellow-600': userData?.role === 'user'
                  },
                  isCollapsed ? 'justify-center w-10 h-10 mx-auto menu-item-collapsed' : 'px-3 py-2'
                ]"
                @click="isOpen = false"
                v-tooltip="isCollapsed ? item.description : ''"
              >
                <i :class="[item.icon, 'text-xl', isCollapsed ? '' : 'mr-3 w-5']"></i>
                <span v-if="!isCollapsed" class="whitespace-nowrap">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- User Info & Logout -->
      <div class="border-t mt-auto">
        <div class="p-3">
          <div 
            :class="[
              'flex items-center rounded-lg transition-all',
              isCollapsed ? 'justify-center' : 'px-2 py-1'
            ]"
            v-tooltip="isCollapsed ? `${userData?.name}\n${userData?.role === 'admin' ? 'Administrador' : userData?.role === 'manager' ? 'Gerente' : 'Usuário'}` : ''"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="{
                'bg-blue-100 text-blue-600': userData?.role === 'admin',
                'bg-green-100 text-green-600': userData?.role === 'manager',
                'bg-yellow-100 text-yellow-600': userData?.role === 'user'
              }"
              v-if="userData?.name"
            >
              {{ userData.name.charAt(0).toUpperCase() }}
            </div>
            <div v-if="!isCollapsed" class="ml-3 min-w-0">
              <div class="flex items-center">
                <p class="font-medium text-gray-900 text-sm truncate">{{ userData?.name }}</p>
                <router-link 
                  to="/my-account"
                  class="ml-2 text-gray-500 hover:text-gray-700"
                  v-tooltip="'Minha Conta'"
                >
                  <i class="pi pi-cog text-sm"></i>
                </router-link>
              </div>
              <span 
                class="inline-block px-2 py-0.5 text-xs rounded-full mt-0.5"
                :class="{
                  'bg-blue-100 text-blue-800': userData?.role === 'admin',
                  'bg-green-100 text-green-800': userData?.role === 'manager',
                  'bg-yellow-100 text-yellow-800': userData?.role === 'user'
                }"
              >
                {{ userData?.role === 'admin' ? 'Administrador' : 
                   userData?.role === 'manager' ? 'Gerente' : 'Usuário' }}
              </span>
            </div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          :class="[
            isCollapsed ? 'justify-center h-10 w-10 mx-auto mb-3 menu-item-collapsed' : 'px-3 py-2 mx-3 mb-2 rounded-lg'
          ]"
          v-tooltip="isCollapsed ? 'Sair do sistema' : ''"
        >
          <i class="pi pi-sign-out text-xl" :class="[isCollapsed ? '' : 'mr-3 w-5']"></i>
          <span v-if="!isCollapsed">Sair</span>
        </button>
      </div>
    </aside>

    <!-- Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<style scoped>
.router-link-active {
  font-weight: 500;
}

:deep(.p-tooltip) {
  @apply bg-gray-800 text-white text-sm py-2 px-3 rounded shadow-lg;
  max-width: 200px;
  z-index: 1000;
}

:deep(.p-tooltip .p-tooltip-arrow) {
  @apply border-gray-800;
}

.menu-item-collapsed {
  @apply relative;
}

.menu-item-collapsed::before {
  content: '';
  @apply absolute -left-0.5 top-1/2 h-5 w-1 rounded-r transform -translate-y-1/2 opacity-0 transition-opacity duration-200;
}

.menu-item-collapsed:hover::before {
  @apply opacity-100;
}

/* Ajuste para o botão de colapso */
button:focus {
  @apply outline-none ring-2 ring-opacity-50;
}
</style>