import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { menuPermissionsService } from '../../services/menuPermissions.service';

export interface AuthMiddlewareOptions {
  requiresAuth: boolean;
  guestOnly: boolean;
}

export async function authMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
  options: AuthMiddlewareOptions = { requiresAuth: true, guestOnly: false }
) {
  const {
    requiresAuth = true,
    guestOnly = false
  } = options;

  const authStore = useAuthStore();
  
  // Aguardar inicialização do auth store
  if (!authStore.initialized) {
    await authStore.initAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole || '';

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

  // Carregar as configurações de menu se ainda não foram carregadas
  if (!menuPermissionsService.isMenuConfigLoaded.value) {
    await menuPermissionsService.loadMenuConfig();
  }

  // Verificar se o usuário tem permissão para acessar a rota
  if (!menuPermissionsService.hasRoutePermission(to.path, userRole)) {
    console.log(`Acesso negado à rota ${to.path} para o usuário com papel ${userRole}`);
    
    // Redirecionar para o dashboard apropriado baseado no papel
    if (userRole === 'broker') {
      return next('/dashboard/broker');
    } else if (userRole === 'realtor') {
      return next('/dashboard/realtor');
    } else if (userRole === 'partner') {
      return next('/dashboard/partner');
    } else {
      return next('/dashboard');
    }
  }

  // Tudo ok, prosseguir
  return next();
}
