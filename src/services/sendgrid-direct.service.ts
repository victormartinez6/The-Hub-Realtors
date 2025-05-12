import axios from 'axios';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

// Interface para resultado do envio
export interface EmailResult {
  success: boolean;
  message: string;
  data?: any;
}

class SendGridDirectService {
  private apiUrl = 'https://api.sendgrid.com/v3/mail/send';
  private apiKey = '';

  /**
   * Carrega a API key do SendGrid do Firestore
   */
  async loadApiKey(): Promise<string | null> {
    try {
      const docRef = doc(db, 'settings', 'sendgrid');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.apiKey = data.apiKey;
        return this.apiKey;
      } else {
        console.warn('API key do SendGrid não encontrada');
        return null;
      }
    } catch (error) {
      console.error('Erro ao carregar API key do SendGrid:', error);
      return null;
    }
  }

  /**
   * Envia um email usando o servidor proxy local
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Preparar dados do email para o servidor proxy
      const emailPayload = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        text: emailData.text || '',
        html: emailData.html || ''
      };
      
      // Adicionar campos opcionais se fornecidos
      if (emailData.cc) emailPayload.cc = emailData.cc;
      if (emailData.bcc) emailPayload.bcc = emailData.bcc;
      if (emailData.replyTo) emailPayload.replyTo = emailData.replyTo;
      
      // Log para depuração
      console.log('SendGridDirectService: Tentando enviar email via proxy:', {
        to: emailPayload.to,
        from: emailPayload.from,
        subject: emailPayload.subject
      });
      
      // Tentar usar o servidor proxy local primeiro
      try {
        const response = await axios.post('http://localhost:3001/api/email/send', emailPayload);
        console.log('Resposta do servidor proxy:', response.data);
        return response.data;
      } catch (proxyError) {
        console.error('Erro ao enviar via proxy, tentando API direta:', proxyError);
        
        // Se o proxy falhar, tentar enviar diretamente via API do SendGrid
        // Preparar o corpo da requisição para o SendGrid
        const data = {
          personalizations: [
            {
              to: Array.isArray(emailData.to) 
                ? emailData.to.map(email => typeof email === 'string' ? { email } : email) 
                : [{ email: emailData.to }],
              subject: emailData.subject
            }
          ],
          from: emailData.from,
          content: []
        };

        // Adicionar texto se fornecido
        if (emailData.text) {
          data.content.push({
            type: 'text/plain',
            value: emailData.text
          });
        }

        // Adicionar HTML se fornecido
        if (emailData.html) {
          data.content.push({
            type: 'text/html',
            value: emailData.html
          });
        }
        
        // Tentar enviar diretamente via API
        console.log('Tentando enviar diretamente via API do SendGrid');
        const directResponse = await axios.post(this.apiUrl, data, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        return {
          success: true,
          message: 'Email enviado com sucesso (via API direta)',
          data: directResponse.data
        };
      }
    } catch (error: any) {
      console.error('Erro ao enviar email (todos os métodos falharam):', error);
      
      // Extrair mensagem de erro da resposta da API do SendGrid, se disponível
      let errorMessage = 'Erro ao enviar email';
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = `Erro ao enviar email: ${error.response.data.errors.map(e => e.message).join(', ')}`;
        } else {
          errorMessage = `Erro ao enviar email: ${JSON.stringify(error.response.data)}`;
        }
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
   * Define a API key diretamente (para testes)
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
}

export const sendgridDirectService = new SendGridDirectService();

// Definir a API key para testes
sendgridDirectService.setApiKey('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');
