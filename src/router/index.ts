import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import UserProfilePage from '../components/InstaHub/UserProfilePage.vue';

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
      path: '/instahub',
      name: 'instahub',
      component: () => import('../components/InstaHub/InstaHubFeed.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/instahub/profile/:id',
      name: 'userProfileInstaHub',
      component: UserProfilePage,
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
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/menu-permissions',
      name: 'menuPermissions',
      component: () => import('../views/MenuPermissionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/notifications',
      name: 'notificationManagement',
      component: () => import('../views/notifications/NotificationManagement.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/email-templates',
      name: 'emailTemplates',
      component: () => import('../views/EmailTemplates.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/email-test',
      name: 'emailTest',
      component: () => import('../views/EmailTestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/instahub',
      name: 'instaHubAdmin',
      component: () => import('../components/InstaHub/Admin/InstaHubAdminDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/instahub/admin',
      name: 'instaHubAdminNew',
      component: () => import('../components/InstaHub/Admin/InstaHubAdminDashboard.vue'),
      meta: { requiresAuth: true }
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
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/broker/realtors',
      name: 'brokerRealtors',
      component: () => import('../views/dashboard/BrokerRealtors.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/broker/email_sendgrid',
      name: 'emailSendgrid',
      component: () => import('../views/EmailSendGridView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/broker/email_smtp',
      name: 'emailSmtp',
      component: () => import('../views/EmailSmtpView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/realtor',
      name: 'realtorDashboard',
      component: () => import('../views/dashboard/RealtorDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/partner',
      name: 'partnerDashboard',
      component: () => import('../views/dashboard/PartnerDashboard.vue'),
      meta: { requiresAuth: true }
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
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/notifications/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/Calendar.vue'),
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
      component: () => import('../views/Profile.vue'),
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
      path: '/marketing',
      name: 'marketing',
      component: () => import('../views/Marketing.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/marketing/mail',
      name: 'mailMarketing',
      component: () => import('../views/MailMarketing.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/update-menu-config',
      name: 'updateMenuConfig',
      component: () => import('../views/UpdateMenuConfig.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard/broker/email_smtp',
      name: 'smtpSettings',
      component: () => import('../components/SmtpSettings.vue'),
      meta: { requiresAuth: true, roles: ['super_admin', 'broker'] }
    },
    {
      path: '/dashboard/broker/email_sendgrid',
      name: 'sendgridSettings',
      component: () => import('../components/SendGridSettings.vue'),
      meta: { requiresAuth: true, roles: ['super_admin', 'broker'] }
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
    },
    {
      path: '/marketing/email-templates',
      redirect: '/admin/email-templates'
    }
  ]
});

// Guarda de navegação
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Aguardar a inicialização da autenticação
  if (!authStore.initialized) {
    console.log('Aguardando inicialização da autenticação...');
    await authStore.initAuth();
  }

  const requiresAuth = to.meta.requiresAuth;

  console.log('Navegando para:', to.path, {
    requiresAuth,
    isAuthenticated: authStore.isAuthenticated
  });

  // Se a rota requer autenticação
  if (requiresAuth) {
    // Verificar se o usuário está autenticado
    if (!authStore.isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para login');
      next('/login');
      return;
    }
  } else if (authStore.isAuthenticated && to.path === '/login') {
    console.log('Usuário já autenticado, redirecionando para dashboard');
    next('/dashboard');
    return;
  }

  // Se estiver acessando a rota raiz ('/'), redirecionar para o dashboard
  if (to.path === '/') {
    next('/dashboard');
    return;
  }

  next();
});

export default router;