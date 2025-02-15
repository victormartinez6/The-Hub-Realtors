export type UserRole = 'super_admin' | 'broker' | 'realtor' | 'partner';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;  // Nome completo do usuário
  name: string;        // Nome curto/apelido (opcional)
  brokerId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  phoneNumber?: string;
  photoURL?: string;   // URL da foto do perfil
  profilePicture?: string;
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
