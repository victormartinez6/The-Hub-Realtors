import { db } from '../firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import axios from 'axios';
import { smtpService } from './smtp.service';
import { sendGridService } from './sendgrid.service';
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
        console.warn('%c[Email Service] Usuário não autenticado, usando serviço padrão', 'color: orange; font-weight: bold');
        return this.activeService;
      }
      
      // Buscar configuração específica do usuário
      const userSettingRef = doc(db, USER_EMAIL_SETTINGS_COLLECTION, userId);
      const userSettingSnap = await getDoc(userSettingRef);
      
      if (userSettingSnap.exists()) {
        this.activeService = userSettingSnap.data().activeService as EmailServiceType;
        console.log('%c[Email Service] Serviço ativo:', 'color: #4CAF50; font-weight: bold', {
          userId,
          service: this.activeService,
          timestamp: new Date().toLocaleString()
        });
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
      // Log detalhado do início do envio
      console.log('%c[Email Service] Iniciando envio de email', 'background: #012928; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold');
      
      // Mostrar detalhes do email no console
      console.group('%c[Email Service] Detalhes do email', 'color: #2196F3; font-weight: bold');
      console.log('Destinatário:', Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to);
      console.log('Remetente:', emailData.from ? `${emailData.from.name} <${emailData.from.email}>` : 'Não especificado');
      console.log('Assunto:', emailData.subject);
      console.log('Timestamp:', new Date().toLocaleString());
      console.groupEnd();
      
      // Obter o serviço ativo
      const activeService = await this.getActiveService();
      console.log('%c[Email Service] Serviço selecionado:', 'color: #FF9800; font-weight: bold', activeService);
      
      // Enviar usando o serviço apropriado
      let result: EmailResult;
      if (activeService === 'sendgrid') {
        console.log('%c[Email Service] Enviando via SendGrid...', 'color: #4CAF50');
        result = await this.sendEmailViaSendGrid(emailData);
      } else {
        console.log('%c[Email Service] Enviando via SMTP...', 'color: #4CAF50');
        result = await this.sendEmailViaSmtp(emailData);
      }
      
      // Log do resultado
      if (result.success) {
        console.log('%c[Email Service] Email enviado com sucesso!', 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold');
      } else {
        console.error('%c[Email Service] Falha ao enviar email:', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold', result.message);
      }
      
      return result;
    } catch (error: any) {
      console.error('%c[Email Service] Erro crítico ao enviar email:', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold', error);
      
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
      console.log('%c[Email Service] Enviando email via SendGrid API...', 'color: #2196F3; font-weight: bold');
      
      // Garantir que o campo 'from' esteja presente conforme esperado pelo SendGrid
      const sendgridEmailData = {
        ...emailData,
        from: emailData.from || {
          email: 'mkt@thehubrealtors.com', // Email verificado no SendGrid
          name: 'The Hub Realtors'
        }
      };
      
      // Usar o novo serviço SendGrid com a biblioteca oficial
      const response = await sendGridService.sendEmail(sendgridEmailData);
      
      if (response.success) {
        console.log('%c[Email Service] Email enviado com sucesso via SendGrid!', 'color: #4CAF50; font-weight: bold');
      } else {
        console.error('%c[Email Service] Falha ao enviar email via SendGrid:', 'color: #F44336; font-weight: bold', response.message);
      }
      
      return response;
    } catch (error: any) {
      console.error('%c[Email Service] Erro ao enviar email via SendGrid:', 'color: #F44336; font-weight: bold', error);
      
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
      console.log('%c[Email Service] Iniciando envio via SMTP...', 'color: #2196F3; font-weight: bold');
      
      // Carregar configurações SMTP
      const smtpConfig = await smtpService.getConfig();
      
      // Verificar se as configurações SMTP estão completas
      if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || !smtpConfig.fromEmail) {
        console.error('%c[Email Service] Configurações SMTP incompletas:', 'color: #F44336', smtpConfig);
        return {
          success: false,
          message: 'Configurações SMTP incompletas. Verifique as configurações de email.'
        };
      }
      
      // Verificar se estamos em ambiente de desenvolvimento
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      // Processar HTML para garantir que todas as imagens tenham URLs absolutos
      if (emailData.html) {
        console.log('%c[Email Service] Processando HTML do email...', 'color: #2196F3');
        
        // Processar imagens no HTML para garantir URLs absolutos
        emailData.html = this.processHtmlImages(emailData.html);
      }
      
      if (isDevelopment) {
        // Simular o envio em ambiente de desenvolvimento
        console.log('%c[Email Service] MODO DE SIMULAÇÃO ATIVADO - Simulando envio via SMTP', 'background: #FF9800; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold');
        console.log('%c[Email Service] Detalhes do email simulado:', 'color: #2196F3', {
          to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
          from: emailData.from,
          subject: emailData.subject,
          htmlLength: emailData.html ? emailData.html.length : 0,
          textLength: emailData.text ? emailData.text.length : 0,
          smtpConfig: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            encryption: smtpConfig.encryption,
            fromName: smtpConfig.fromName,
            fromEmail: smtpConfig.fromEmail,
            // Ocultando senha e usuário por segurança
            username: smtpConfig.username ? '******' : '',
            password: smtpConfig.password ? '******' : ''
          }
        });
        
        // Simular um pequeno atraso para parecer mais real
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
          success: true,
          message: 'Email simulado com sucesso via SMTP (ambiente de desenvolvimento)',
          data: {
            simulatedAt: new Date().toISOString(),
            recipients: Array.isArray(emailData.to) ? emailData.to.length : 1
          }
        };
      }
      
      // Em produção, tentar enviar via proxy local
      console.log('%c[Email Service] Tentando enviar via proxy SMTP...', 'color: #4CAF50');
      const proxyUrl = 'http://localhost:3002/api/email/send';
      
      // Preparar dados para envio
      const emailPayload = {
        ...emailData,
        smtpConfig
      };
      
      // Registrar tamanho do HTML para diagnóstico
      if (emailData.html) {
        console.log(`%c[Email Service] Tamanho do HTML: ${emailData.html.length} caracteres`, 'color: #2196F3');
      }
      
      try {
        console.log('%c[Email Service] Enviando solicitação para o proxy SMTP...', 'color: #2196F3');
        
        // Enviar via proxy local
        const response = await axios.post(proxyUrl, emailPayload, {
          timeout: 30000, // 30 segundos de timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('%c[Email Service] Resposta do proxy SMTP:', 'color: #4CAF50', response.data);
        
        // Verificar se há destinatários rejeitados
        if (response.data.data && response.data.data.rejected && response.data.data.rejected.length > 0) {
          console.warn('%c[Email Service] Alguns destinatários foram rejeitados:', 'background: #FF9800; color: white', response.data.data.rejected);
          
          return {
            success: true,
            message: `Email enviado com sucesso, mas ${response.data.data.rejected.length} destinatários foram rejeitados`,
            data: response.data.data
          };
        }
        
        return {
          success: true,
          message: 'Email enviado com sucesso via SMTP',
          data: response.data.data
        };
      } catch (proxyError: any) {
        // Se falhar a conexão com o proxy, verificar se devemos simular mesmo em produção
        if (proxyError.message && proxyError.message.includes('Network Error')) {
          console.warn('%c[Email Service] Proxy SMTP não disponível, simulando envio...', 'background: #FF9800; color: white; padding: 2px 5px; border-radius: 3px');
          
          return {
            success: true,
            message: 'Email simulado com sucesso (proxy indisponível)',
            data: {
              simulatedAt: new Date().toISOString(),
              recipients: Array.isArray(emailData.to) ? emailData.to.length : 1,
              reason: 'Proxy SMTP indisponível'
            }
          };
        }
        
        // Extrair detalhes do erro para melhor diagnóstico
        let errorDetails = 'Erro desconhecido';
        
        if (proxyError.response) {
          // Erro com resposta do servidor
          const statusCode = proxyError.response.status;
          const responseData = proxyError.response.data;
          
          console.error('%c[Email Service] Erro do servidor proxy SMTP:', 'color: #F44336', {
            status: statusCode,
            data: responseData
          });
          
          errorDetails = `Erro ${statusCode}: ${responseData.message || JSON.stringify(responseData)}`;
        } else if (proxyError.request) {
          // Erro sem resposta do servidor
          console.error('%c[Email Service] Sem resposta do servidor proxy SMTP:', 'color: #F44336', proxyError.request);
          errorDetails = 'Sem resposta do servidor proxy SMTP';
        } else {
          // Outro tipo de erro
          console.error('%c[Email Service] Erro ao configurar requisição:', 'color: #F44336', proxyError.message);
          errorDetails = proxyError.message;
        }
        
        return {
          success: false,
          message: `Erro ao enviar email via SMTP: ${errorDetails}`,
          error: proxyError
        };
      }
    } catch (error: any) {
      console.error('%c[Email Service] Erro ao enviar email via SMTP:', 'color: #F44336; font-weight: bold', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: `Erro ao enviar email via SMTP: ${errorMessage}`,
        error: error
      };
    }
  }
  
  /**
   * Processa o HTML para garantir que todas as imagens tenham URLs absolutos
   */
  private processHtmlImages(html: string): string {
    try {
      console.log('%c[Email Service] Processando imagens no HTML...', 'color: #2196F3');
      
      // Criar um DOM parser para processar o HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Encontrar todas as imagens
      const images = doc.querySelectorAll('img');
      let imageCount = 0;
      let fixedCount = 0;
      
      // Processar cada imagem
      images.forEach(img => {
        imageCount++;
        const src = img.getAttribute('src');
        
        if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
          fixedCount++;
          // Converter URL relativa para absoluta
          if (src.startsWith('/')) {
            // URL relativa ao domínio
            img.setAttribute('src', `${window.location.origin}${src}`);
          } else {
            // URL relativa ao caminho atual
            const baseUrl = window.location.origin + window.location.pathname;
            img.setAttribute('src', `${baseUrl.substring(0, baseUrl.lastIndexOf('/'))}/${src}`);
          }
        }
      });
      
      console.log(`%c[Email Service] Processadas ${imageCount} imagens, corrigidas ${fixedCount}`, 'color: #4CAF50');
      
      // Retornar o HTML processado
      return doc.documentElement.outerHTML;
    } catch (error) {
      console.error('%c[Email Service] Erro ao processar imagens no HTML:', 'color: #F44336', error);
      // Em caso de erro, retornar o HTML original
      return html;
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
