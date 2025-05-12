import { FileAttachment } from '../services/fileService';

export type UserRole = 'super_admin' | 'admin' | 'broker' | 'realtor' | 'partner' | 'user' | 'system' | 'all';

export interface MarketingConfig {
  headerWidth: number;
  logoUrl: string;
  headerImageUrl: string; // URL da imagem de header padrão
  primaryColor: string;
  secondaryColor: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;  // Nome completo do usuário
  name?: string;        // Nome curto/apelido (opcional)
  senderName?: string; // Nome a ser usado como remetente de emails
  brokerId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  phoneNumber?: string;
  phone?: string;      // Número de telefone com DDI
  countryCode?: string; // Código do país (US, BR, etc)
  photoURL?: string;   // URL da foto do perfil
  profilePicture?: string;
  // Campos de endereço
  streetAddress?: string;
  unit?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Configurações de marketing
  marketingConfig?: MarketingConfig;
  role: UserRole;
  // Novos campos para redes sociais
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // UID do usuário que criou
  brokerId: string; // UID do broker responsável
  partnersAccess: string[]; // Array de UIDs dos parceiros com acesso
  archived: boolean;
  propertyInterest?: {
    type: 'buy' | 'rent';
    budget: number;
    location: string[];
    propertyType: string[];
  };
  lastContact?: string;
  nextFollowUp?: string;
  attachments?: FileAttachment[]; 
}

export interface Broker {
  uid: string;
  userId: string; // referência ao documento do usuário
  companyName: string;
  realtors: string[]; // array de UIDs dos realtors
  createdAt: string;
  updatedAt: string;
  active: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  licenseNumber?: string;
}

export interface Realtor {
  uid: string;
  userId: string; // referência ao documento do usuário
  brokerId: string; // referência ao broker
  specialties: string[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
  licenseNumber?: string;
}
