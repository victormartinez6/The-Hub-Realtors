import type { UserRole } from '../types/models';

export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  description?: string; // Descrição para ajudar a entender o acesso
  translationKey?: string; // Chave para tradução
  parent?: string;
}

export const navigationConfig: NavigationItem[] = [

  {
    name: 'Dashboard',
    path: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Visão geral do sistema',
    translationKey: 'dashboard'
  },
  {
    name: 'InstaHub',
    path: '/instahub',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Feed de rede social para compartilhamento de conteúdo',
    translationKey: 'feed'
  },
  {
    name: 'Admin InstaHub',
    path: '/instahub/admin',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    roles: ['super_admin', 'admin'],
    description: 'Painel de administração do InstaHub',
    translationKey: 'admin_instahub'
  },
  {
    name: 'Meus Leads',
    path: '/leads',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Broker: Todos os leads da corretora\nRealtor: Apenas seus leads\nPartner: Apenas leads vinculados',
    translationKey: 'leads'
  },
  {
    name: 'Meus Imóveis',
    path: '/properties',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Broker: Todos os imóveis da corretora\nRealtor: Apenas seus imóveis',
    translationKey: 'properties'
  },
  {
    name: 'Agenda',
    path: '/calendar',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Broker: Agenda completa da corretora\nRealtor: Apenas sua agenda',
    translationKey: 'calendar'
  },
  {
    name: 'Treinamentos',
    path: '/learning',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    roles: ['super_admin', 'broker', 'realtor'],
    translationKey: 'training'
  },
  {
    name: 'Financeiro',
    path: '/finance',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: ['super_admin', 'broker'],
    description: 'Broker: Gestão financeira da corretora',
    translationKey: 'finance'
  },
  {
    name: 'Relatórios',
    path: '/reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    roles: ['super_admin', 'broker'],
    description: 'Broker: Relatórios da corretora',
    translationKey: 'reports'
  },
  {
    name: 'Minha Equipe',
    path: '/dashboard/broker/realtors',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    roles: ['broker'],
    description: 'Gerenciamento de corretores da sua equipe',
    translationKey: 'team'
  },
  {
    name: 'Configurações',
    path: '/admin/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    roles: ['super_admin', 'admin', 'broker'],
    description: 'Configurações do sistema',
    translationKey: 'settings'
  },
  {
    name: 'Configurações de SendGrid',
    path: '/dashboard/broker/email_sendgrid',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    roles: ['super_admin', 'broker'],
    description: 'Configurações do serviço de email SendGrid',
    translationKey: 'sendgrid_settings',
    parent: 'settings'
  },
  {
    name: 'Configurações de SMTP',
    path: '/dashboard/broker/email_smtp',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    roles: ['super_admin', 'broker'],
    description: 'Configurações do serviço de email SMTP',
    translationKey: 'smtp_settings',
    parent: 'settings'
  },
  {
    name: 'Currency Exchange',
    path: '/currency-exchange',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Informações e cotações de câmbio',
    translationKey: 'currency_exchange'
  },
  {
    name: 'Webhooks',
    path: '/webhooks',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    roles: ['super_admin', 'broker', 'realtor', 'partner'],
    description: 'Gerenciamento de webhooks e integrações',
    translationKey: 'webhooks'
  },
  {
    name: 'User Management',
    path: '/admin/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: ['super_admin'],
    description: 'Gerenciamento de usuários',
    translationKey: 'admin.users'
  },
  {
    name: 'Role Permissions',
    path: '/admin/menu-permissions',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    roles: ['super_admin', 'admin', 'broker', 'realtor'],
    translationKey: 'admin.role_permissions',
    description: 'Gerenciar permissões de menu por perfil',
    parent: 'admin.users'
  },
  {
    name: 'Marketing',
    path: '/marketing',
    icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Funcionalidades de marketing',
    translationKey: 'marketing'
  },
  {
    name: 'Templates de E-mail',
    path: '/marketing/email-templates',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Gerenciamento de templates de e-mail',
    translationKey: 'email_templates',
    parent: 'marketing'
  },
  {
    name: 'Mail Marketing',
    path: '/marketing/mail',
    icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76',
    roles: ['super_admin', 'broker', 'realtor'],
    description: 'Envio de e-mails de marketing',
    translationKey: 'mail_marketing',
    parent: 'marketing'
  },
  {
    name: 'Teste de Email',
    path: '/admin/email-test',
    icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76',
    roles: ['super_admin'],
    description: 'Testar envio de emails via SendGrid',
    translationKey: 'email_test.title'
  },
  {
    name: 'Notificações',
    path: '/admin/notifications',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    roles: ['super_admin', 'admin', 'broker', 'realtor'],
    description: 'Gerenciamento de notificações do sistema',
    translationKey: 'notifications'
  }
];
