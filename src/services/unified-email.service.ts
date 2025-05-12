import { db } from '../firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import axios from 'axios';
import { smtpService } from './smtp.service';
import { sendgridSimpleService } from './sendgrid-simple.service';
import { useAuthStore } from '../stores/auth';

// Constantes
const SETTINGS_COLLECTION = 'settings';
const EMAIL_SERVICE_DOC = 'email_service';
const USER_EMAIL_SETTINGS_COLLECTION = 'user_email_settings';

// Interface para um email
export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  from?: {
    email: string;
    name?: string;
  };
  attachments?: {
    content: string; // Base64 encoded content
    filename: string;
    type: string; // MIME type
    disposition: 'attachment' | 'inline';
    contentId?: string; // For inline images
  }[];
}

// Interface para resultado do envio
export interface EmailResult {
  success: boolean;
  message: string;
  data?: any;
}

// Interface para dados de email marketing
export interface MarketingEmailData {
  subject: string;
  templateId: string;
  recipients: string[];
  from?: {
    name: string;
    email: string;
  };
}

// Tipo para o serviço de email ativo
export type EmailServiceType = 'sendgrid' | 'smtp';

class UnifiedEmailService {
  private activeService: EmailServiceType = 'sendgrid'; // Padrão para SendGrid
  
  /**
   * Obtém o serviço de email ativo para o usuário atual
   */
  async getActiveService(): Promise<EmailServiceType> {
    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        console.warn('Usuário não autenticado, usando serviço padrão');
        return this.activeService;
      }
      
      // Buscar configuração específica do usuário
      const userSettingRef = doc(db, USER_EMAIL_SETTINGS_COLLECTION, userId);
      const userSettingSnap = await getDoc(userSettingRef);
      
      if (userSettingSnap.exists()) {
        this.activeService = userSettingSnap.data().activeService as EmailServiceType;
        console.log(`Serviço de email ativo para o usuário ${userId}: ${this.activeService}`);
        return this.activeService;
      }
      
      // Se não existir configuração para o usuário, buscar a configuração global
      const docRef = doc(db, SETTINGS_COLLECTION, EMAIL_SERVICE_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.activeService = docSnap.data().activeService as EmailServiceType;
        console.log(`Serviço de email global ativo: ${this.activeService}`);
        
        // Salvar a configuração global como configuração inicial do usuário
        await this.setActiveService(this.activeService);
        
        return this.activeService;
      }
      
      // Se não existir configuração, usar o padrão (SendGrid)
      return this.activeService;
    } catch (error) {
      console.error('Erro ao obter serviço de email ativo:', error);
      return this.activeService;
    }
  }
  
  // Evento personalizado para notificar quando o serviço ativo muda
  private emailServiceChangeEvent = new CustomEvent('email-service-change');
  
  /**
   * Define o serviço de email ativo para o usuário atual
   */
  async setActiveService(service: EmailServiceType): Promise<void> {
    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        console.warn('Usuário não autenticado, não é possível salvar configuração');
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se o serviço está mudando
      const oldService = this.activeService;
      this.activeService = service;
      
      // Salvar configuração específica do usuário
      const userSettingRef = doc(db, USER_EMAIL_SETTINGS_COLLECTION, userId);
      await setDoc(userSettingRef, { 
        activeService: service,
        updatedAt: new Date(),
        userId: userId
      });
      
      console.log(`Serviço de email definido para o usuário ${userId}: ${service}`);
      
      // Disparar evento para notificar outros componentes
      if (oldService !== service) {
        window.dispatchEvent(new CustomEvent('email-service-change', {
          detail: { service, userId }
        }));
      }
    } catch (error) {
      console.error('Erro ao definir serviço de email ativo:', error);
      throw error;
    }
  }
  
  /**
   * Envia um email usando o serviço ativo (SendGrid ou SMTP)
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Verificar qual serviço de email está ativo
      const activeService = await this.getActiveService();
      console.log(`Enviando email usando serviço: ${activeService}`);
      
      // Enviar usando o serviço apropriado
      if (activeService === 'smtp') {
        return this.sendEmailViaSmtp(emailData);
      } else {
        return this.sendEmailViaSendGrid(emailData);
      }
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      return {
        success: false,
        message: `Erro ao enviar email: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Envia um email usando o serviço SendGrid
   */
  private async sendEmailViaSendGrid(emailData: EmailData): Promise<EmailResult> {
    try {
      // Garantir que o campo 'from' esteja presente conforme esperado pelo SendGrid
      const sendgridEmailData = {
        ...emailData,
        from: emailData.from || {
          email: 'contato@thehub.com.br',
          name: 'The Hub Realtors'
        }
      };
      
      // Usar o serviço simplificado que já funciona
      return await sendgridSimpleService.sendEmail(sendgridEmailData);
    } catch (error: any) {
      console.error('Erro ao enviar email via SendGrid:', error);
      
      return {
        success: false,
        message: `Erro ao enviar email via SendGrid: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Envia um email usando o serviço SMTP
   */
  private async sendEmailViaSmtp(emailData: EmailData): Promise<EmailResult> {
    try {
      // Carregar configurações SMTP
      const smtpConfig = await smtpService.getConfig();
      
      // Preparar dados para o proxy local
      const proxyUrl = 'http://localhost:3002/api/email/send';
      
      // Enviar via proxy local
      const response = await axios.post(proxyUrl, {
        ...emailData,
        smtpConfig
      });
      
      return {
        success: true,
        message: 'Email enviado com sucesso via SMTP',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erro ao enviar email via SMTP:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: `Erro ao enviar email via SMTP: ${errorMessage}`
      };
    }
  }
  
  /**
   * Envia um email de teste para verificar a configuração
   */
  async sendTestEmail(toEmail: string): Promise<EmailResult> {
    return this.sendEmail({
      to: toEmail,
      subject: 'Teste de Email - The Hub Realtors',
      text: 'Este é um email de teste enviado pelo sistema The Hub Realtors.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #451A37;">Teste de Email - The Hub Realtors</h2>
          <p>Este é um email de teste enviado pelo sistema The Hub Realtors.</p>
          <p>Se você está recebendo este email, significa que a configuração do serviço de email está funcionando corretamente.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    });
  }
  
  /**
   * Envia emails de marketing em massa usando um template
   */
  async sendMarketingEmails(marketingData: MarketingEmailData): Promise<EmailResult> {
    try {
      // Verificar se há destinatários
      if (!marketingData.recipients || marketingData.recipients.length === 0) {
        return {
          success: false,
          message: 'Nenhum destinatário especificado'
        };
      }
      
      // Obter o template do Firestore
      const templateRef = doc(db, 'email_templates', marketingData.templateId);
      const templateSnap = await getDoc(templateRef);
      
      if (!templateSnap.exists()) {
        return {
          success: false,
          message: 'Template não encontrado'
        };
      }
      
      const template = templateSnap.data();
      
      // Enviar emails em lotes para evitar sobrecarga
      const batchSize = 50; // Ajuste conforme necessário
      const totalRecipients = marketingData.recipients.length;
      let successCount = 0;
      
      for (let i = 0; i < totalRecipients; i += batchSize) {
        const batch = marketingData.recipients.slice(i, i + batchSize);
        
        // Enviar para cada lote como BCC para preservar privacidade
        const result = await this.sendEmail({
          to: 'marketing@thehub.com.br', // Email principal (não será visto pelos destinatários)
          bcc: batch,
          subject: marketingData.subject,
          html: template.content,
          from: marketingData.from || {
            email: 'marketing@thehub.com.br',
            name: 'The Hub Realtors - Marketing'
          }
        });
        
        if (result.success) {
          successCount += batch.length;
        } else {
          console.error(`Erro ao enviar lote ${i / batchSize + 1}:`, result.message);
        }
      }
      
      return {
        success: successCount > 0,
        message: `Enviado com sucesso para ${successCount} de ${totalRecipients} destinatários`,
        data: { totalSent: successCount, totalRecipients }
      };
    } catch (error: any) {
      console.error('Erro ao enviar emails de marketing:', error);
      
      return {
        success: false,
        message: `Erro ao enviar emails de marketing: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
}

export const unifiedEmailService = new UnifiedEmailService();
