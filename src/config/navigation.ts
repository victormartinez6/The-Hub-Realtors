import type { UserRole } from '../types/models';

export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  description?: string; // Descrição para ajudar a entender o acesso
}

export const navigationConfig: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Visão geral do sistema'
  },
  {
    name: 'Meus Leads',
    path: '/leads',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Broker: Todos os leads da corretora\nRealtor: Apenas seus leads\nPartner: Apenas leads vinculados'
  },
  {
    name: 'Meus Imóveis',
    path: '/properties',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Broker: Todos os imóveis da corretora\nRealtor: Apenas seus imóveis'
  },
  {
    name: 'Agenda',
    path: '/calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Broker: Agenda completa da corretora\nRealtor: Apenas sua agenda'
  },
  {
    name: 'Treinamentos',
    path: '/learning',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Broker: Gerenciamento de treinamentos\nRealtor: Acesso aos treinamentos'
  },
  {
    name: 'Financeiro',
    path: '/finance',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: ['super_admin', 'broker'],
    description: 'Broker: Gestão financeira da corretora'
  },
  {
    name: 'Relatórios',
    path: '/reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    roles: ['super_admin', 'broker'],
    description: 'Broker: Relatórios da corretora'
  },
  {
    name: 'Gerenciar Usuários',
    path: '/admin/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['super_admin'],
    description: 'Gerenciamento de usuários'
  },
  {
    name: 'Minha Equipe',
    path: '/dashboard/broker/realtors',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    roles: ['broker'],
    description: 'Gerenciamento de corretores da sua equipe'
  },
  {
    name: 'Configurações',
    path: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Configurações específicas para cada tipo de usuário'
  },
  {
    name: 'Currency Exchange',
    path: '/currency-exchange',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Informações e cotações de câmbio'
  },
  {
    name: 'Webhooks',
    path: '/webhooks',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Gerenciamento de webhooks e integrações'
  },
  {
    name: 'Templates de E-mail',
    path: '/admin/email-templates',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    roles: ['super_admin'],
    description: 'Gerenciamento de templates de e-mail'
  }
];
