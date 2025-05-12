import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import { smtpService } from './smtp.service';
import { sendgridSimpleService } from './sendgrid-simple.service';

// Constantes
const SETTINGS_COLLECTION = 'settings';
const SENDGRID_DOC = 'sendgrid';
const SMTP_DOC = 'smtp';
const EMAIL_SERVICE_DOC = 'email_service';

// Interface para configuração do SendGrid
export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

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

// Tipo para o serviço de email ativo
export type EmailServiceType = 'sendgrid' | 'smtp';

class EmailService {
  private activeService: EmailServiceType = 'sendgrid'; // Padrão para SendGrid
  
  /**
   * Obtém o serviço de email ativo (SendGrid ou SMTP)
   */
  async getActiveService(): Promise<EmailServiceType> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, EMAIL_SERVICE_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.activeService = docSnap.data().activeService as EmailServiceType;
        console.log(`Serviço de email ativo: ${this.activeService}`);
        return this.activeService;
      }
      
      // Se não existir configuração, usar o padrão (SendGrid)
      return this.activeService;
    } catch (error) {
      console.error('Erro ao obter serviço de email ativo:', error);
      return this.activeService;
    }
  }
  
  /**
   * Define o serviço de email ativo (SendGrid ou SMTP)
   */
  async setActiveService(service: EmailServiceType): Promise<void> {
    try {
      this.activeService = service;
      const docRef = doc(db, SETTINGS_COLLECTION, EMAIL_SERVICE_DOC);
      await setDoc(docRef, { activeService: service });
      console.log(`Serviço de email definido para: ${service}`);
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
      // Usar o serviço simplificado que já funciona
      return await sendgridSimpleService.sendEmail(emailData);
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
      const proxyUrl = 'http://localhost:3001/api/email/send';
      
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
}

  /**
   * Carrega a configuração do SendGrid do Firestore
   */
  async loadConfig(): Promise<SendGridConfig | null> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SENDGRID_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.config = docSnap.data() as SendGridConfig;
        console.log('Configurações do SendGrid carregadas com sucesso');
        return this.config;
      } else {
        console.warn('Configurações do SendGrid não encontradas');
        return null;
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do SendGrid:', error);
      return null;
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
    }

      // Verificar se temos um destinatário
      if (!emailData.to || (Array.isArray(emailData.to) && emailData.to.length === 0)) {
        return {
          success: false,
          message: 'Destinatário não especificado'
        };
      }

      // Verificar se temos um assunto
      if (!emailData.subject) {
        return {
          success: false,
          message: 'Assunto do email não especificado'
        };
      }

      // Verificar se temos conteúdo
      if (!emailData.text && !emailData.html) {
        return {
          success: false,
          message: 'Conteúdo do email não especificado'
        };
      }

      // Preparar os destinatários
      const toEmails = Array.isArray(emailData.to) 
        ? emailData.to.map(email => ({ email })) 
        : [{ email: emailData.to }];

      // Preparar CC se existir
      const ccEmails = emailData.cc 
        ? (Array.isArray(emailData.cc) 
            ? emailData.cc.map(email => ({ email })) 
            : [{ email: emailData.cc }]) 
        : undefined;

      // Preparar BCC se existir
      const bccEmails = emailData.bcc 
        ? (Array.isArray(emailData.bcc) 
            ? emailData.bcc.map(email => ({ email })) 
            : [{ email: emailData.bcc }]) 
        : undefined;

      // Preparar o corpo da requisição para o SendGrid
      const data = {
        personalizations: [
          {
            to: toEmails,
            cc: ccEmails,
            bcc: bccEmails,
            subject: emailData.subject
          }
        ],
        from: {
          email: this.config!.fromEmail,
          name: this.config!.fromName
        },
        reply_to: emailData.replyTo ? { email: emailData.replyTo } : undefined,
        content: [
          {
            type: 'text/plain',
            value: emailData.text || ''
          }
        ]
      };

      // Adicionar conteúdo HTML se fornecido
      if (emailData.html) {
        data.content.push({
          type: 'text/html',
          value: emailData.html
        });
      }

      // Adicionar anexos se fornecidos
      if (emailData.attachments && emailData.attachments.length > 0) {
        data['attachments'] = emailData.attachments.map(attachment => ({
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type,
          disposition: attachment.disposition,
          content_id: attachment.contentId
        }));
      }

      // Enviar o email usando a API do SendGrid
      const response = await axios.post(SENDGRID_API_URL, data, {
        headers: {
          'Authorization': `Bearer ${this.config!.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: 'Email enviado com sucesso',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      // Extrair mensagem de erro da resposta da API do SendGrid, se disponível
      let errorMessage = 'Erro ao enviar email';
      if (error.response && error.response.data) {
        errorMessage = `Erro ao enviar email: ${JSON.stringify(error.response.data)}`;
      } else if (error.message) {
        errorMessage = `Erro ao enviar email: ${error.message}`;
      }
      
      return {
        success: false,
        message: errorMessage
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
          <p>Se você está recebendo este email, significa que a configuração do SendGrid está funcionando corretamente.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    });
  }
}

export const emailService = new EmailService();
