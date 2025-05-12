import { useAuthStore } from '../stores/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

// URL do servidor proxy local
const PROXY_URL = 'http://localhost:3001';

// Configuração padrão do remetente
const DEFAULT_FROM = {
  email: 'mkt@thehubrealtors.com',
  name: 'The Hub Realtors'
};

// Tipos para os dados do email
export interface SendGridSenderInfo {
  email: string;
  name?: string;
}

export interface SendGridAttachment {
  content: string;
  filename: string;
  type?: string;
  disposition?: string;
}

export interface SendGridEmailData {
  to: string | string[];
  from?: SendGridSenderInfo;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: SendGridAttachment[];
  categories?: string[];
}

export interface SendGridEmailResult {
  success: boolean;
  message: string;
  messageId?: string;
  response?: any;
  error?: any;
}

/**
 * Serviço para envio de emails usando a API do SendGrid
 */
export class SendGridService {
  private senderInfo: SendGridSenderInfo | null = null;

  /**
   * Carrega as informações do remetente do Firestore
   * @returns Informações do remetente
   */
  async loadSenderInfo(): Promise<SendGridSenderInfo> {
    // Se já temos as informações do remetente, retorná-las
    if (this.senderInfo) {
      return this.senderInfo;
    }

    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;

      if (!userId) {
        console.warn('[SendGrid] Usuário não autenticado, usando remetente padrão');
        return DEFAULT_FROM;
      }

      // Carregar as configurações do SendGrid do Firestore
      const settingsRef = doc(db, 'users', userId, 'settings', 'sendgrid');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        this.senderInfo = {
          email: data.senderEmail || DEFAULT_FROM.email,
          name: data.senderName || DEFAULT_FROM.name
        };
        console.log('[SendGrid] Informações do remetente carregadas do Firestore:', this.senderInfo);
        return this.senderInfo;
      } else {
        console.warn('[SendGrid] Configurações não encontradas no Firestore, usando remetente padrão');
        return DEFAULT_FROM;
      }
    } catch (error) {
      console.error('[SendGrid] Erro ao carregar informações do remetente:', error);
      return DEFAULT_FROM;
    }
  }

  /**
   * Envia um email usando a API do SendGrid através do servidor proxy local
   * @param emailData Dados do email a ser enviado
   * @returns Objeto com o resultado do envio
   */
  async sendEmail(emailData: SendGridEmailData): Promise<SendGridEmailResult> {
    console.log('%c[SendGrid] Iniciando envio de email...', 'color: #2196F3; font-weight: bold');
    
    try {
      // Verificar dados mínimos com logs detalhados
      console.log('%c[SendGrid] Validando dados do email:', 'color: #2196F3', {
        hasTo: !!emailData.to,
        toType: typeof emailData.to,
        toValue: emailData.to,
        hasSubject: !!emailData.subject,
        hasHtml: !!emailData.html,
        htmlLength: emailData.html ? emailData.html.length : 0,
        hasText: !!emailData.text,
        textLength: emailData.text ? emailData.text.length : 0,
        hasTemplateId: !!emailData.templateId
      });
      
      if (!emailData.to || !emailData.subject || (!emailData.html && !emailData.text && !emailData.templateId)) {
        console.error('%c[SendGrid] DADOS INCOMPLETOS:', 'color: #F44336; font-weight: bold', {
          missingTo: !emailData.to,
          missingSubject: !emailData.subject,
          missingContent: !emailData.html && !emailData.text && !emailData.templateId
        });
        return {
          success: false,
          message: 'Dados incompletos. Informe pelo menos destinatário, assunto e conteúdo.'
        };
      }
      
      // Obter dados do remetente
      console.log('%c[SendGrid] Carregando dados do remetente...', 'color: #2196F3');
      const from = await this.loadSenderInfo();
      
      // Preparar os dados do email
      console.log('%c[SendGrid] Preparando dados do email...', 'color: #2196F3');
      const msg: any = {
        to: emailData.to,
        from: from.name ? `${from.name} <${from.email}>` : from.email,
        subject: emailData.subject,
      };
      
      // Processar HTML para garantir que as imagens sejam exibidas corretamente
      if (emailData.html) {
        console.log('%c[SendGrid] Processando HTML para envio...', 'color: #2196F3');
        msg.html = this.processHtmlForSendGrid(emailData.html);
      }
      
      // Adicionar conteúdo de texto se fornecido
      if (emailData.text) {
        msg.text = emailData.text;
      }
      
      // Adicionar ID do template se fornecido
      if (emailData.templateId) {
        msg.templateId = emailData.templateId;
        
        // Adicionar dados dinâmicos se fornecidos
        if (emailData.dynamicTemplateData) {
          msg.dynamicTemplateData = emailData.dynamicTemplateData;
        }
      }
      
      // Adicionar campos opcionais
      if (emailData.cc) msg.cc = emailData.cc;
      if (emailData.bcc) msg.bcc = emailData.bcc;
      if (emailData.replyTo) msg.replyTo = emailData.replyTo;
      
      // Adicionar anexos se fornecidos
      if (emailData.attachments && emailData.attachments.length > 0) {
        msg.attachments = emailData.attachments;
      }
      
      // Adicionar categorias se fornecidas
      if (emailData.categories && emailData.categories.length > 0) {
        msg.categories = emailData.categories;
      }
      
      console.log('[SendGrid] Enviando email via servidor proxy...');
      console.log('[SendGrid] Detalhes do email:', {
        to: Array.isArray(msg.to) ? msg.to.join(', ') : msg.to,
        from: msg.from,
        subject: msg.subject,
        hasHtml: !!msg.html,
        hasText: !!msg.text,
        hasTemplateId: !!msg.templateId
      });
      
      try {
        // Fazer a requisição para o servidor proxy
        const response = await axios.post(`${PROXY_URL}/api/email/send`, msg);
        
        // Verificar se a requisição foi bem-sucedida
        if (response.status === 200 && response.data.success) {
          console.log('[SendGrid] Email enviado com sucesso!');
          console.log('[SendGrid] Resposta do servidor:', response.data);
          
          return {
            success: true,
            message: 'Email enviado com sucesso!',
            messageId: response.data.messageId,
            response: response.data.response
          };
        } else {
          console.error('[SendGrid] Erro na resposta do servidor:', response.data);
          
          return {
            success: false,
            message: response.data.message || 'Erro ao enviar email',
            response: response.data
          };
        }
      } catch (error) {
        console.error('[SendGrid] ERRO NO ENVIO DO EMAIL:', error);
        
        // Verificar se é um erro de resposta do Axios
        if (error.response) {
          console.error('[SendGrid] Detalhes do erro de resposta:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
          
          // Extrair mensagem de erro da resposta
          let errorMessage = 'Erro ao enviar email';
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            errorMessage = typeof error.response.data.error === 'string' 
              ? error.response.data.error 
              : JSON.stringify(error.response.data.error);
          }
          
          return {
            success: false,
            message: errorMessage,
            error: error.response.data
          };
        } 
        // Verificar se é um erro de requisição
        else if (error.request) {
          console.error('[SendGrid] Erro de requisição (sem resposta):', error.request);
          return {
            success: false,
            message: 'Não foi possível conectar ao servidor de email. Verifique se o servidor proxy está rodando.',
            error: { message: 'Erro de conexão', request: error.request }
          };
        } 
        // Outros erros
        else {
          console.error('[SendGrid] Erro geral:', error.message || error);
          return {
            success: false,
            message: `Erro ao enviar email: ${error.message || 'Erro desconhecido'}`,
            error: error
          };
        }
      }
    } catch (error) {
      console.error('[SendGrid] ERRO GERAL:', error);
      return {
        success: false,
        message: `Erro ao processar o envio de email: ${error.message || 'Erro desconhecido'}`,
        error: error
      };
    }
  }

  /**
   * Processa o HTML para garantir que seja exibido corretamente no SendGrid
   * @param html HTML original
   * @returns HTML processado
   */
  private processHtmlForSendGrid(html: string): string {
    try {
      console.log('%c[SendGrid] Processando HTML para envio...', 'color: #2196F3');
      
      // Criar um DOM parser para processar o HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Processar imagens para garantir URLs absolutos
      const images = doc.querySelectorAll('img');
      let imageCount = 0;
      let fixedCount = 0;
      
      console.log(`%c[SendGrid] Encontradas ${images.length} imagens no HTML`, 'color: #2196F3');
      
      // Definir URL base pública para substituir localhost
      // Usar o domínio de produção em vez de localhost
      const productionDomain = 'https://thehubrealtors.com';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      images.forEach(img => {
        imageCount++;
        const src = img.getAttribute('src');
        
        if (!src) {
          console.warn('%c[SendGrid] Imagem sem atributo src encontrada', 'color: #FF9800');
          return;
        }
        
        // Verificar se a imagem já tem URL absoluta
        if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
          fixedCount++;
          let newSrc = '';
          
          // Converter URL relativa para absoluta
          if (src.startsWith('/')) {
            // URL relativa ao domínio
            if (isLocalhost) {
              // Se estamos em localhost, usar o domínio de produção
              newSrc = `${productionDomain}${src}`;
              console.log(`%c[SendGrid] Imagem convertida (localhost -> produção): ${src} -> ${newSrc}`, 'color: #4CAF50');
            } else {
              // Se não estamos em localhost, usar o domínio atual
              newSrc = `${window.location.origin}${src}`;
              console.log(`%c[SendGrid] Imagem convertida: ${src} -> ${newSrc}`, 'color: #4CAF50');
            }
          } else {
            // URL relativa ao caminho atual
            if (isLocalhost) {
              // Se estamos em localhost, tentar usar uma URL pública
              // Verificar se é uma imagem de assets
              if (src.includes('assets/') || src.includes('img/')) {
                newSrc = `${productionDomain}/${src}`;
                console.log(`%c[SendGrid] Imagem de assets convertida: ${src} -> ${newSrc}`, 'color: #4CAF50');
              } else {
                // Se não for uma imagem de assets, tentar usar uma URL pública
                // Neste caso, podemos sugerir ao usuário que use imagens hospedadas em serviços públicos
                console.warn(`%c[SendGrid] Imagem com URL relativa em localhost: ${src}. Considere usar URLs públicas.`, 'color: #FF9800');
                newSrc = src; // Manter a URL original, pois não temos como convertê-la
              }
            } else {
              // Se não estamos em localhost, usar o domínio atual
              const baseUrl = window.location.origin + window.location.pathname;
              newSrc = `${baseUrl.substring(0, baseUrl.lastIndexOf('/'))}/${src}`;
              console.log(`%c[SendGrid] Imagem convertida: ${src} -> ${newSrc}`, 'color: #4CAF50');
            }
          }
          
          // Atualizar o atributo src da imagem
          img.setAttribute('src', newSrc);
        } else {
          console.log(`%c[SendGrid] Imagem já tem URL absoluta: ${src}`, 'color: #2196F3');
        }
        
        // Adicionar atributos para melhor compatibilidade com clientes de email
        img.setAttribute('border', '0');
        if (!img.getAttribute('alt')) {
          img.setAttribute('alt', 'Imagem');
        }
        
        // Garantir que a imagem tenha estilos adequados para emails
        const currentStyle = img.getAttribute('style') || '';
        if (!currentStyle.includes('max-width')) {
          img.setAttribute('style', `${currentStyle}; max-width: 100%; height: auto; display: block;`);
        }
      });
      
      console.log(`%c[SendGrid] Processadas ${imageCount} imagens, corrigidas ${fixedCount}`, 'color: #4CAF50');
      
      // Processar links para garantir URLs absolutos
      const links = doc.querySelectorAll('a');
      let linkCount = 0;
      let fixedLinkCount = 0;
      
      links.forEach(link => {
        linkCount++;
        const href = link.getAttribute('href');
        
        if (!href) {
          console.warn('%c[SendGrid] Link sem atributo href encontrado', 'color: #FF9800');
          return;
        }
        
        // Ignorar links especiais
        if (href === '#' || href.startsWith('mailto:') || href.startsWith('tel:')) {
          console.log(`%c[SendGrid] Link especial mantido: ${href}`, 'color: #2196F3');
          return;
        }
        
        // Verificar se o link já tem URL absoluta
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          fixedLinkCount++;
          let newHref = '';
          
          // Converter URL relativa para absoluta
          if (href.startsWith('/')) {
            // URL relativa ao domínio
            if (isLocalhost) {
              // Se estamos em localhost, usar o domínio de produção
              newHref = `${productionDomain}${href}`;
              console.log(`%c[SendGrid] Link convertido (localhost -> produção): ${href} -> ${newHref}`, 'color: #4CAF50');
            } else {
              // Se não estamos em localhost, usar o domínio atual
              newHref = `${window.location.origin}${href}`;
              console.log(`%c[SendGrid] Link convertido: ${href} -> ${newHref}`, 'color: #4CAF50');
            }
          } else {
            // URL relativa ao caminho atual
            if (isLocalhost) {
              // Se estamos em localhost, usar o domínio de produção
              newHref = `${productionDomain}/${href}`;
              console.log(`%c[SendGrid] Link relativo convertido: ${href} -> ${newHref}`, 'color: #4CAF50');
            } else {
              // Se não estamos em localhost, usar o domínio atual
              const baseUrl = window.location.origin + window.location.pathname;
              newHref = `${baseUrl.substring(0, baseUrl.lastIndexOf('/'))}/${href}`;
              console.log(`%c[SendGrid] Link convertido: ${href} -> ${newHref}`, 'color: #4CAF50');
            }
          }
          
          // Atualizar o atributo href do link
          link.setAttribute('href', newHref);
        } else {
          console.log(`%c[SendGrid] Link já tem URL absoluta: ${href}`, 'color: #2196F3');
        }
        
        // Adicionar target="_blank" para abrir links em nova aba
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
        }
      });
      
      console.log(`%c[SendGrid] Processados ${linkCount} links, corrigidos ${fixedLinkCount}`, 'color: #4CAF50');
      
      // Adicionar meta tags para melhor compatibilidade
      const head = doc.querySelector('head');
      if (head) {
        // Verificar se já existe meta viewport
        if (!doc.querySelector('meta[name="viewport"]')) {
          const metaViewport = doc.createElement('meta');
          metaViewport.setAttribute('name', 'viewport');
          metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
          head.appendChild(metaViewport);
        }
        
        // Verificar se já existe meta content-type
        if (!doc.querySelector('meta[http-equiv="Content-Type"]')) {
          const metaContentType = doc.createElement('meta');
          metaContentType.setAttribute('http-equiv', 'Content-Type');
          metaContentType.setAttribute('content', 'text/html; charset=UTF-8');
          head.appendChild(metaContentType);
        }
      }
      
      // Verificar se o HTML tem a estrutura básica correta
      if (!doc.querySelector('html') || !doc.querySelector('body')) {
        console.warn('%c[SendGrid] HTML não tem estrutura básica completa, encapsulando conteúdo...', 'color: #FF9800');
        
        // Se o HTML não tiver a estrutura básica, encapsulá-lo em um template completo
        return `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>The Hub Realtors</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; background-color: #f5f5f5;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <tr>
                      <td align="center" style="padding: 40px 30px;">
                        ${html}
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 20px 30px; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #666666;">&copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.</p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">Este email foi enviado por The Hub Realtors.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;
      }
      
      // Retornar o HTML processado
      const processedHtml = doc.documentElement.outerHTML;
      console.log(`%c[SendGrid] HTML processado com sucesso (${processedHtml.length} caracteres)`, 'color: #4CAF50');
      
      return processedHtml;
    } catch (error) {
      console.error('%c[SendGrid] Erro ao processar HTML:', 'color: #F44336', error);
      // Em caso de erro, retornar o HTML original
      return html;
    }
  }

  /**
   * Envia um email de teste para verificar a configuração do SendGrid
   * @param to Email do destinatário do teste
   * @returns Resultado do envio do email de teste
   */
  async sendTestEmail(to: string): Promise<SendGridEmailResult> {
    console.log('[SendGrid] Enviando email de teste para:', to);
    
    try {
      // Gerar ID único para o teste
      const testId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const timestamp = new Date().toLocaleString();
      
      // Criar dados do email de teste
      const testEmailData: SendGridEmailData = {
        to: to,
        subject: `Teste de Envio - The Hub Realtors [${testId}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #451A37; text-align: center;">Teste de Envio de Email</h2>
            <p>Este é um email de teste enviado pelo sistema The Hub Realtors usando a API do SendGrid.</p>
            <p>Se você está recebendo este email, a configuração de envio de emails está funcionando corretamente!</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <h3 style="color: #012928; margin-top: 0;">Informações do teste:</h3>
              <ul style="list-style-type: none; padding-left: 0;">
                <li><strong>Data e hora:</strong> ${timestamp}</li>
                <li><strong>Método de envio:</strong> API do SendGrid via servidor proxy</li>
                <li><strong>ID do teste:</strong> ${testId}</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
              <p>Este é um email automático de teste, por favor não responda.</p>
              <p>© ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.</p>
            </div>
          </div>
        `,
        text: `Teste de Envio de Email - The Hub Realtors [${testId}]\n\n` +
              `Este é um email de teste enviado pelo sistema The Hub Realtors usando a API do SendGrid.\n` +
              `Se você está recebendo este email, a configuração de envio de emails está funcionando corretamente!\n\n` +
              `Informações do teste:\n` +
              `- Data e hora: ${timestamp}\n` +
              `- Método de envio: API do SendGrid via servidor proxy\n` +
              `- ID do teste: ${testId}\n\n` +
              `Este é um email automático de teste, por favor não responda.\n` +
              `© ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.`
      };
      
      // Enviar o email de teste
      return await this.sendEmail(testEmailData);
    } catch (error) {
      console.error('[SendGrid] Erro ao enviar email de teste:', error);
      return {
        success: false,
        message: `Erro ao enviar email de teste: ${error.message || 'Erro desconhecido'}`,
        error: error
      };
    }
  }
}

// Exportar uma instância única do serviço
export const sendGridService = new SendGridService();
