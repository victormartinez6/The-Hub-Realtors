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

// Interface para resultado do envio
export interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

class SendGridSmtpFunctionService {
  /**
   * Envia um email usando a Cloud Function e SMTP Relay do SendGrid
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      const functions = getFunctions();
      const sendEmailFunction = httpsCallable(functions, 'sendEmailViaSendGridSmtp');
      
      // Log para depuração
      console.log('SendGridSmtpFunctionService: Enviando dados de email:', emailData);
      
      const result = await sendEmailFunction({ emailData });
      const data = result.data as any;
      
      return {
        success: data.success,
        message: data.message,
        messageId: data.messageId
      };
    } catch (error: any) {
      console.error('Erro ao enviar email via SMTP do SendGrid:', error);
      
      return {
        success: false,
        message: error.message || 'Erro ao enviar email'
      };
    }
  }

  /**
   * Envia um email de teste para verificar a configuração
   */
  async sendTestEmail(toEmail: string): Promise<EmailResult> {
    try {
      const testEmailData: EmailData = {
        to: toEmail,
        subject: 'Teste de Envio de Email via SMTP - The Hub Realtors',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #451A37; text-align: center;">Teste de Envio de Email via SMTP</h2>
            <p>Este é um email de teste enviado pelo sistema The Hub Realtors usando SMTP Relay do SendGrid.</p>
            <p>Se você está recebendo este email, a configuração de envio de emails está funcionando corretamente!</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <h3 style="color: #012928; margin-top: 0;">Informações do teste:</h3>
              <ul style="list-style-type: none; padding-left: 0;">
                <li><strong>Data e hora:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Método de envio:</strong> SMTP Relay do SendGrid via Cloud Functions</li>
              </ul>
            </div>
          </div>
        `
      };
      
      return await this.sendEmail(testEmailData);
    } catch (error: any) {
      console.error('Erro ao enviar email de teste:', error);
      
      return {
        success: false,
        message: error.message || 'Erro ao enviar email de teste'
      };
    }
  }
}

export const sendgridSmtpFunctionService = new SendGridSmtpFunctionService();
