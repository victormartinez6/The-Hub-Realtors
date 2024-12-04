import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { watch } from 'vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import CashFlow from '../views/CashFlow.vue'
import CostCenter from '../views/settings/CostCenter.vue'
import UserManagement from '../views/UserManagement.vue'
import Profile from '../views/Profile.vue'
import AccountsManagement from '../views/AccountsManagement.vue'
import BankManagement from '../views/settings/BankManagement.vue'
import SupplierManagement from '../views/settings/SupplierManagement.vue'
import CustomerManagement from '../views/settings/CustomerManagement.vue'
import PaymentStatusManagement from '../views/settings/PaymentStatusManagement.vue'
import MyAccount from '../views/MyAccount.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountsManagement,
      meta: { 
        requiresAuth: true,
        title: 'Contas a Pagar e Receber'
      }
    },
    {
      path: '/cash-flow',
      name: 'cash-flow',
      component: CashFlow,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UserManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/banks',
      name: 'banks',
      component: BankManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/suppliers',
      name: 'suppliers',
      component: SupplierManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/customers',
      name: 'customers',
      component: CustomerManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/cost-center',
      name: 'cost-center',
      component: CostCenter,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/payment-status',
      name: 'payment-status',
      component: PaymentStatusManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-account',
      name: 'my-account',
      component: MyAccount,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // Aguarda o carregamento inicial do estado de autenticação
  if (authStore.loading) {
    console.log('Waiting for auth state to load...')
    await new Promise<void>((resolve) => {
      const unwatch = watch(
        () => authStore.loading,
        (loading) => {
          if (!loading) {
            unwatch()
            resolve()
          }
        },
        { immediate: true }
      )
    })
  }

  console.log('Route navigation:', {
    to: to.path,
    requiresAuth,
    requiresGuest,
    requiresAdmin,
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.userData?.role
  })

  try {
    // Se a rota requer autenticação e o usuário não está autenticado
    if (requiresAuth && !authStore.isAuthenticated) {
      console.log('Authentication required, redirecting to login')
      next('/login')
      return
    }

    // Se a rota é para visitantes e o usuário está autenticado
    if (requiresGuest && authStore.isAuthenticated) {
      console.log('Guest route with authenticated user, redirecting to dashboard')
      next('/')
      return
    }

    // Se a rota requer admin e o usuário não é admin
    if (requiresAdmin && authStore.userData?.role !== 'admin') {
      console.log('Admin access required, redirecting to dashboard')
      next('/')
      return
    }

    // Atualiza o título da página
    if (to.meta.title) {
      document.title = `${to.meta.title} - Financial App`
    }

    next()
  } catch (error) {
    console.error('Navigation error:', error)
    next('/login')
  }
})

export default router