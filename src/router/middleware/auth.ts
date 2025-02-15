import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

export interface AuthMiddlewareOptions {
  requiresAuth: boolean;
  guestOnly: boolean;
  roles?: string[];
}

export async function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  options: AuthMiddlewareOptions = {}
) {
  const {
    requiresAuth = true,
    guestOnly = false,
    roles = []
  } = options;

  const authStore = useAuthStore();
  
  // Aguardar inicialização do auth store
  if (!authStore.isInitialized) {
    await authStore.init();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  // Se a rota não requer autenticação
  if (!requiresAuth) {
    // Se o usuário está autenticado e tenta acessar login/registro
    if (isAuthenticated && ['/login', '/register'].includes(to.path)) {
      return next('/');
    }
    return next();
  }

  // Se requer autenticação mas usuário não está autenticado
  if (!isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }

  // Se é apenas para convidados e o usuário está autenticado
  if (guestOnly && isAuthenticated) {
    return next('/');
  }

  // Se há roles permitidas e o usuário não tem a role necessária
  if (roles.length > 0 && !roles.includes(userRole)) {
    // Super admin tem acesso a tudo
    if (userRole === 'super_admin') {
      return next();
    }
    
    // Outros usuários são redirecionados para o dashboard
    return next('/');
  }

  // Tudo ok, prosseguir
  return next();
}
