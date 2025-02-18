import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/admin/users',
      name: 'userManagement',
      component: () => import('../views/admin/UserManagement.vue'),
      meta: { requiresAuth: true, roles: ['super_admin'] }
    },
    {
      path: '/admin/email-templates',
      name: 'emailTemplates',
      component: () => import('../views/EmailTemplates.vue'),
      meta: { requiresAuth: true, roles: ['super_admin'] }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/broker',
      name: 'brokerDashboard',
      component: () => import('../views/dashboard/BrokerDashboard.vue'),
      meta: { requiresAuth: true, roles: ['broker'] }
    },
    {
      path: '/dashboard/broker/realtors',
      name: 'brokerRealtors',
      component: () => import('../views/dashboard/BrokerRealtors.vue'),
      meta: { requiresAuth: true, roles: ['broker'] }
    },
    {
      path: '/dashboard/realtor',
      name: 'realtorDashboard',
      component: () => import('../views/dashboard/RealtorDashboard.vue'),
      meta: { requiresAuth: true, roles: ['realtor'] }
    },
    {
      path: '/dashboard/partner',
      name: 'partnerDashboard',
      component: () => import('../views/dashboard/PartnerDashboard.vue'),
      meta: { requiresAuth: true, roles: ['partner'] }
    },
    {
      path: '/leads',
      name: 'leads',
      component: () => import('../views/Leads.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/properties',
      name: 'properties',
      component: () => import('../views/Properties.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/Calendar.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/learning',
      name: 'learning',
      component: () => import('../views/Learning.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/finance',
      name: 'finance',
      component: () => import('../views/Finance.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/Reports.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import(/* webpackChunkName: "profile" */ '@/views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/currency-exchange',
      name: 'currencyExchange',
      component: () => import('../views/CurrencyExchange.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/webhooks',
      name: 'webhooks',
      component: () => import('../views/Webhooks.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('../views/ForgotPassword.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: () => import('../views/ResetPassword.vue'),
      meta: { requiresAuth: false },
      props: (route) => ({ code: route.query.oobCode })
    },
    {
      path: '/team',
      redirect: '/dashboard/broker/realtors'
    },
    {
      path: '/agenda',
      redirect: '/calendar'
    }
  ]
});

// Guarda de navegação
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Aguardar a inicialização da autenticação
  if (!authStore.initialized) {
    console.log('Aguardando inicialização da autenticação...');
    await authStore.initAuth();
  }

  const requiresAuth = to.meta.requiresAuth;
  const allowedRoles = to.meta.roles as string[] || [];

  console.log('Navegando para:', to.path, {
    requiresAuth,
    allowedRoles,
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.userRole
  });

  // Se a rota requer autenticação
  if (requiresAuth) {
    // Verificar se o usuário está autenticado
    if (!authStore.isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para login');
      next('/login');
      return;
    }

    // Verificar se o usuário tem o papel necessário
    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.userData?.role)) {
      console.log('Usuário não tem permissão, redirecionando para dashboard apropriado');
      // Redirecionar para o dashboard apropriado baseado no papel
      if (authStore.userData?.role === 'super_admin') {
        next('/admin/users');
      } else if (authStore.userData?.role === 'broker') {
        next('/dashboard/broker');
      } else if (authStore.userData?.role === 'realtor') {
        next('/dashboard/realtor');
      } else if (authStore.userData?.role === 'partner') {
        next('/dashboard/partner');
      } else {
        next('/dashboard');
      }
      return;
    }
  } else if (authStore.isAuthenticated && to.path === '/login') {
    console.log('Usuário já autenticado, redirecionando para dashboard apropriado');
    // Se o usuário já está autenticado e tenta acessar o login, redirecionar para o dashboard apropriado
    if (authStore.userData?.role === 'super_admin') {
      next('/admin/users');
    } else if (authStore.userData?.role === 'broker') {
      next('/dashboard/broker');
    } else if (authStore.userData?.role === 'realtor') {
      next('/dashboard/realtor');
    } else if (authStore.userData?.role === 'partner') {
      next('/dashboard/partner');
    } else {
      next('/dashboard');
    }
    return;
  }

  // Se estiver acessando a rota raiz ('/'), redirecionar para o dashboard apropriado
  if (to.path === '/') {
    if (authStore.userData?.role === 'super_admin') {
      next('/admin/users');
    } else if (authStore.userData?.role === 'broker') {
      next('/dashboard/broker');
    } else if (authStore.userData?.role === 'realtor') {
      next('/dashboard/realtor');
    } else if (authStore.userData?.role === 'partner') {
      next('/dashboard/partner');
    } else {
      next('/dashboard');
    }
    return;
  }

  next();
});

export default router;