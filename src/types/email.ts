// Definição dos tipos relacionados a email
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  components: any[];
  createdAt?: Date;
  updatedAt?: Date;
  mlsId?: string;
  userId?: string; // ID do usuário proprietário do template
  // Outros campos opcionais
  [key: string]: any;
}

export interface MarketingEmailData {
  to: string[];
  subject: string;
  templateId: string;
  fromName: string;
  fromEmail: string;
  // Dados adicionais para personalização do template
  data?: Record<string, any>;
}

export interface EmailGroup {
  id: string;
  name: string;
  description?: string;
  emails: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
