// Serviço simplificado para envio de emails usando o servidor proxy local
// Baseado no arquivo sendgrid-test.mjs

import axios from 'axios';

// Interface para dados do email
export interface EmailData {
  to: string | string[];
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  text?: string;
  html?: string;
}

// Interface para resultado do envio
export interface EmailResult {
  success: boolean;
  message: string;
  data?: any;
}

class SendGridSimpleService {
  private apiKey = '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';

  /**
   * Envia um email usando diretamente a API do SendGrid
   * Usa o mesmo código do arquivo sendgrid-test.mjs
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      console.log('Enviando email com dados:', emailData);
      
      // Preparar o corpo da requisição para o SendGrid
      const msg = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        text: emailData.text || '',
        html: emailData.html || ''
      };
      
      // Usar o servidor proxy local para evitar problemas de CORS
      const proxyUrl = 'http://localhost:3001/api/email/send';
      console.log('Enviando via servidor proxy local:', proxyUrl);
      
      // Preparar os dados para o servidor proxy local
      const proxyData = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        text: emailData.text || '',
        html: emailData.html || ''
      };
      
      // Enviar via axios para melhor tratamento de erros
      const response = await axios.post(proxyUrl, proxyData);
      console.log('Resposta do servidor proxy:', response.data);
      
      // Axios retorna status 2xx como sucesso, sem precisar verificar .ok
      console.log('Email enviado com sucesso!');
      return {
        success: true,
        message: 'Email enviado com sucesso!',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      let errorMessage = 'Erro desconhecido';
      
      if (error.response && error.response.data) {
        // Erro do axios com resposta do servidor
        console.error('Detalhes do erro:', error.response.data);
        errorMessage = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        // Erro com mensagem
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: `Erro ao enviar email: ${errorMessage}`,
        data: error.response?.data
      };
    }
  }

  /**
   * Envia um email de teste
   */
  async sendTestEmail(toEmail: string): Promise<EmailResult> {
    return this.sendEmail({
      to: toEmail,
      from: {
        email: 'contato@thehub.com.br',
        name: 'The Hub Realtors'
      },
      subject: 'Teste de Email - The Hub Realtors',
      text: 'Este é um email de teste enviado pelo The Hub Realtors.',
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

export const sendgridSimpleService = new SendGridSimpleService();
