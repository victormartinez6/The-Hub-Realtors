import { EmailData, EmailResult } from './email-function.service';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

// URL base do servidor proxy
const API_BASE_URL = 'http://localhost:3001/api/email';

// Configuração padrão do remetente
const DEFAULT_FROM = {
  email: 'mkt@thehubrealtors.com', // Email verificado no SendGrid
  name: 'The Hub Realtors'
};

// Interface para a mensagem de email
interface EmailMessage {
  to: string | string[];
  from: {
    email: string;
    name: string;
  };
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

// Interface para a mensagem de email com template
interface TemplateEmailMessage {
  to: string | string[];
  from: {
    email: string;
    name: string;
  };
  subject: string;
  templateId: string;
  dynamicData: Record<string, any>;
}

class SendGridService {
  /**
   * Obtém o nome do remetente com base no usuário atual
   */
  private getSenderName(): string {
    const authStore = useAuthStore();
    
    // Ordem de prioridade: senderName > displayName > name > padrão
    if (authStore.userData?.senderName) {
      return authStore.userData.senderName;
    } else if (authStore.userData?.displayName) {
      return authStore.userData.displayName;
    } else if (authStore.userData?.name) {
      return authStore.userData.name;
    }
    
    return DEFAULT_FROM.name;
  }

  /**
   * Envia um email usando a API do SendGrid
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Obter o nome do remetente personalizado
      const senderName = this.getSenderName();
      
      // Preparar o objeto de mensagem para o SendGrid
      const msg: EmailMessage = {
        to: emailData.to,
        from: {
          email: DEFAULT_FROM.email,
          name: senderName
        },
        subject: emailData.subject,
        text: emailData.text || '',
        html: emailData.html || '',
      };

      // Adicionar campos opcionais se fornecidos
      if (emailData.cc) msg.cc = emailData.cc;
      if (emailData.bcc) msg.bcc = emailData.bcc;
      if (emailData.replyTo) msg.replyTo = emailData.replyTo;

      // Enviar o email através do proxy
      console.log('SendGridService: Enviando email via SendGrid:', msg);
      const response = await axios.post(`${API_BASE_URL}/send`, msg);
      
      // Processar a resposta
      const data = response.data;
      
      return {
        success: data.success,
        message: data.message,
        messageId: data.messageId
      };
    } catch (error: any) {
      console.error('Erro ao enviar email via SendGrid:', error);
      
      // Extrair mensagem de erro mais detalhada se disponível
      let errorMessage = 'Erro ao enviar email';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Envia um email usando um template do SendGrid
   */
  async sendTemplateEmail(
    to: string | string[],
    templateId: string,
    dynamicData: Record<string, any>,
    subject = 'The Hub Realtors' // Valor padrão para o assunto
  ): Promise<EmailResult> {
    try {
      // Obter o nome do remetente personalizado
      const senderName = this.getSenderName();
      
      // Preparar o objeto de mensagem para o SendGrid com template
      const msg: TemplateEmailMessage = {
        to,
        from: {
          email: DEFAULT_FROM.email,
          name: senderName
        },
        subject, // Assunto é obrigatório, mesmo com template
        templateId,
        dynamicData,
      };

      // Enviar o email através do proxy
      console.log('SendGridService: Enviando email com template via SendGrid:', 
        { to, templateId, dynamicData });
      
      const response = await axios.post(`${API_BASE_URL}/send-template`, msg);
      
      // Processar a resposta
      const data = response.data;
      
      return {
        success: data.success,
        message: data.message,
        messageId: data.messageId
      };
    } catch (error: any) {
      console.error('Erro ao enviar email com template via SendGrid:', error);
      
      // Extrair mensagem de erro mais detalhada se disponível
      let errorMessage = 'Erro ao enviar email com template';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Verifica se a API do SendGrid está configurada corretamente
   */
  async testConnection(): Promise<EmailResult> {
    try {
      // Testar a conexão através do proxy
      const response = await axios.post(`${API_BASE_URL}/test-connection`);
      
      // Processar a resposta
      const data = response.data;
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (error: any) {
      console.error('Erro ao testar conexão com SendGrid:', error);
      
      let errorMessage = 'Erro ao testar conexão com SendGrid';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

export const sendGridService = new SendGridService();
