import { getFunctions, httpsCallable } from 'firebase/functions';

// Interface para dados do email
export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: any[];
}

// Interface para configurações SMTP
export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "tls" | "none" | "ssl";
  fromName: string;
  fromEmail: string;
}

// Interface para resultado do envio
export interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

class EmailFunctionService {
  /**
   * Envia um email usando a Cloud Function
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      const functions = getFunctions();
      const sendEmailFunction = httpsCallable(functions, 'sendEmail');
      
      // Log para depuração
      console.log('EmailFunctionService: Enviando dados de email:', emailData);
      
      const result = await sendEmailFunction({ emailData });
      const data = result.data as any;
      
      return {
        success: data.success,
        message: data.message,
        messageId: data.messageId
      };
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      return {
        success: false,
        message: error.message || 'Erro ao enviar email'
      };
    }
  }

  /**
   * Testa a conexão SMTP usando a Cloud Function
   */
  async testSmtpConnection(smtpConfig: SmtpConfig): Promise<EmailResult> {
    try {
      const functions = getFunctions();
      const testConnectionFunction = httpsCallable(functions, 'testSmtpConnection');
      
      // Log para depuração
      console.log('EmailFunctionService: Enviando configurações SMTP para teste:', smtpConfig);
      
      // Garantir que todos os campos necessários estão presentes
      if (!smtpConfig || !smtpConfig.host || !smtpConfig.port || 
          !smtpConfig.username || !smtpConfig.password) {
        return {
          success: false,
          message: 'Configurações SMTP incompletas. Verifique todos os campos obrigatórios.'
        };
      }
      
      // Criar um objeto simples (não reativo) com as configurações
      const plainConfig = {
        host: smtpConfig.host,
        port: Number(smtpConfig.port),
        username: smtpConfig.username,
        password: smtpConfig.password,
        encryption: smtpConfig.encryption,
        fromName: smtpConfig.fromName,
        fromEmail: smtpConfig.fromEmail
      };
      
      console.log('EmailFunctionService: Enviando objeto simplificado:', plainConfig);
      
      // Enviar as configurações SMTP como um objeto simples
      const result = await testConnectionFunction(plainConfig);
      
      // Verificar se o resultado é válido
      if (result && result.data) {
        const data = result.data as any;
        console.log('EmailFunctionService: Resultado recebido da Cloud Function:', data);
        
        return {
          success: data.success === true,
          message: data.message || 'Teste concluído com sucesso'
        };
      } else {
        console.error('EmailFunctionService: Resultado inválido da Cloud Function:', result);
        return {
          success: false,
          message: 'Resultado inválido da Cloud Function'
        };
      }
    } catch (error: any) {
      console.error('Erro ao testar conexão SMTP:', error);
      
      return {
        success: false,
        message: error.message || 'Erro ao testar conexão'
      };
    }
  }
}

export const emailFunctionService = new EmailFunctionService();
