import axios from 'axios';
import { logger } from '../utils/logger';
import { useAuthStore } from '../stores/auth';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// URL base da API
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Largura fixa para todos os templates de email marketing
const EMAIL_WIDTH = 600;

// Coleção do Firestore para configurações do sistema
const SYSTEM_SETTINGS_COLLECTION = 'system_settings';
const API_KEYS_DOC = 'api_keys';

class OpenAIService {
  /**
   * Verifica a configuração do OpenAI e retorna o status
   * Util para diagnóstico e debug
   */
  /**
   * Configura a chave da API do OpenAI no Firestore
   * @param apiKey Chave da API do OpenAI
   * @returns Resultado da operação
   */
  async configureOpenAIKey(apiKey: string): Promise<{success: boolean, message: string}> {
    try {
      if (!apiKey || apiKey.trim() === '') {
        return {
          success: false,
          message: 'Chave da API inválida. Forneça uma chave válida.'
        };
      }
      
      logger.debug('OpenAIService: Configurando chave da API do OpenAI no Firestore');
      
      // Criar ou atualizar o documento no Firestore
      const apiKeysDocRef = doc(db, SYSTEM_SETTINGS_COLLECTION, API_KEYS_DOC);
      
      // Verificar se o documento já existe
      const apiKeysDoc = await getDoc(apiKeysDocRef);
      
      if (apiKeysDoc.exists()) {
        // Atualizar o documento existente
        await updateDoc(apiKeysDocRef, {
          openai: apiKey,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Criar um novo documento
        await setDoc(apiKeysDocRef, {
          openai: apiKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      logger.debug('OpenAIService: Chave da API do OpenAI configurada com sucesso');
      
      return {
        success: true,
        message: 'Chave da API do OpenAI configurada com sucesso'
      };
    } catch (error) {
      logger.error('OpenAIService: Erro ao configurar chave da API do OpenAI:', error);
      
      return {
        success: false,
        message: `Erro ao configurar chave da API do OpenAI: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Verifica a configuração do OpenAI e retorna o status
   * Util para diagnóstico e debug
   */
  async checkOpenAIConfig(): Promise<{success: boolean, message: string, details: any}> {
    try {
      // Verificar variáveis de ambiente
      const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      
      // Verificar configuração no Firestore
      const apiKeysDocRef = doc(db, SYSTEM_SETTINGS_COLLECTION, API_KEYS_DOC);
      const apiKeysDoc = await getDoc(apiKeysDocRef);
      
      const result: any = {
        envApiKeyExists: !!envApiKey,
        firestoreDocExists: apiKeysDoc.exists(),
        firestoreData: null,
        openaiKeyInFirestore: false
      };
      
      if (apiKeysDoc.exists()) {
        const data = apiKeysDoc.data();
        // Ocultar a chave real por segurança, mas mostrar se existe
        result.firestoreData = Object.keys(data).reduce((acc, key) => {
          acc[key] = typeof data[key] === 'string' ? `${data[key].substring(0, 5)}...` : data[key];
          return acc;
        }, {});
        result.openaiKeyInFirestore = !!data.openai;
      }
      
      const success = result.envApiKeyExists || result.openaiKeyInFirestore;
      
      return {
        success,
        message: success ? 'Configuração do OpenAI encontrada' : 'Configuração do OpenAI não encontrada',
        details: result
      };
    } catch (error) {
      logger.error('OpenAIService: Erro ao verificar configuração do OpenAI:', error);
      return {
        success: false,
        message: `Erro ao verificar configuração do OpenAI: ${error.message || 'Erro desconhecido'}`,
        details: { error: error.toString() }
      };
    }
  }
  
  /**
   * Busca a chave da API do OpenAI
   * Tenta buscar da variável de ambiente primeiro, depois do Firestore
   * @returns A chave da API ou null se não encontrada
   */
  private async getOpenAIApiKey(): Promise<string | null> {
    try {
      // Primeiro, tentar obter da variável de ambiente
      const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      if (envApiKey) {
        logger.debug('OpenAIService: Usando API key do OpenAI das variáveis de ambiente');
        return envApiKey;
      }
      
      // Se não encontrou nas variáveis de ambiente, buscar do Firestore
      logger.debug('OpenAIService: Buscando API key do OpenAI do Firestore');
      const apiKeysDocRef = doc(db, SYSTEM_SETTINGS_COLLECTION, API_KEYS_DOC);
      const apiKeysDoc = await getDoc(apiKeysDocRef);
      
      logger.debug(`OpenAIService: Documento do Firestore existe? ${apiKeysDoc.exists()}`);
      
      if (apiKeysDoc.exists()) {
        const data = apiKeysDoc.data();
        logger.debug(`OpenAIService: Dados do documento: ${JSON.stringify(Object.keys(data))}`);
        
        if (data.openai) {
          logger.debug('OpenAIService: API key do OpenAI encontrada no Firestore');
          return data.openai;
        } else {
          logger.warn('OpenAIService: Campo "openai" não encontrado no documento do Firestore');
        }
      } else {
        logger.warn(`OpenAIService: Documento "${API_KEYS_DOC}" não encontrado na coleção "${SYSTEM_SETTINGS_COLLECTION}"`);
      }
      
      // Se chegou aqui, não encontrou a chave
      logger.warn('OpenAIService: API key do OpenAI não encontrada');
      return null;
    } catch (error) {
      logger.error('OpenAIService: Erro ao buscar API key do OpenAI:', error);
      return null;
    }
  }
  
  /**
   * Gera um template de email marketing personalizado usando a API do ChatGPT
   * @param postData Dados do post para gerar o template
   * @returns Template HTML gerado
   */
  async generateEmailTemplate(postData: any): Promise<string> {
    try {
      // Buscar a API key do OpenAI
      const apiKey = await this.getOpenAIApiKey();
      
      // Verificar se temos uma API key
      if (!apiKey) {
        throw new Error('API key do OpenAI não configurada. Entre em contato com o administrador do sistema.');
      }

      logger.debug('OpenAIService: Gerando template de email com ChatGPT');
      
      // Extrair informações relevantes do post
      const property = postData.propertyInfo || {};
      const author = postData.author || {};
      
      // Obter configurações de marketing do usuário
      const authStore = useAuthStore();
      const userData = authStore.userData || {} as any;
      const marketingConfig = userData.marketingConfig || {
        headerWidth: EMAIL_WIDTH, // Usar a largura fixa definida
        logoUrl: '',
        headerImageUrl: '',
        primaryColor: '#451A37',
        secondaryColor: '#01FBA1'
      };
      
      // Nome do remetente
      const senderName = userData.name || author.name || 'The Hub Realtors';
      
      // Criar um prompt descritivo para o ChatGPT
      const prompt = `
Crie um corpo de email marketing CRIATIVO e VISUALMENTE IMPRESSIONANTE para um imóvel de luxo com as seguintes características:

TÍTULO: ${postData.title || 'Imóvel Exclusivo'}
DESCRIÇÃO: ${postData.description || ''}
PREÇO: ${property.price ? `$ ${Number(property.price).toLocaleString('pt-BR')}` : 'Não informado'}
TIPO: ${property.type || 'Não informado'}
ÁREA: ${property.area ? `${property.area}m²` : 'Não informada'}
QUARTOS: ${property.rooms || 'Não informado'}
BANHEIROS: ${property.bathrooms || 'Não informado'}
VAGAS: ${property.garage || 'Não informado'}
LOCALIZAÇÃO: ${property.address || 'Não informada'}
STATUS: ${property.status || 'Não informado'}
MLS ID: ${property.mlsId || 'Não informado'}

IMPORTANTE:
- Seja EXTREMAMENTE CRIATIVO! Queremos um design que impressione o cliente.
- Use layouts modernos, elementos visuais atraentes e tipografia impactante.
- Crie APENAS o corpo do email (o cabeçalho e rodapé já estão prontos).
- O email terá largura fixa de ${EMAIL_WIDTH}px.
- Inclua o texto do "Caption" do post: "${postData.title || ''}"
- As imagens do imóvel serão inseridas onde você indicar com <!-- IMAGENS_AQUI -->
- No call-to-action, use o email do perfil do usuário: ${userData.email || author.email || ''}
- Use cores que combinam com a identidade visual: ${marketingConfig.primaryColor} (cor primária) e ${marketingConfig.secondaryColor} (cor secundária)
- Sinta-se livre para usar gradientes, bordas, sombras e outros elementos CSS para criar um design luxuoso.
- Crie seções visualmente distintas para destacar os diferentes aspectos do imóvel.
- Use ícones ou emojis para tornar o conteúdo mais visual e atraente.
- Adicione frases de impacto que destaquem o estilo de vida que o imóvel proporciona.

SUGESTÕES DE ESTRUTURA (mas sinta-se livre para inovar):
1. Um título impactante com tipografia elegante e destaque visual
2. Uma introdução envolvente que crie desejo pelo imóvel
3. Destaque criativo para as características principais do imóvel
4. Uma seção "Estilo de Vida" que mostre os benefícios de morar neste imóvel
5. Espaço para as imagens do imóvel (marque com <!-- IMAGENS_AQUI -->)
6. Um call-to-action convincente e visualmente destacado
7. Fale curiosidades sobre a cidade do endereco ${property.address || 'Não informada'}

Use HTML e CSS inline para criar um design verdadeiramente impressionante. NÃO inclua tags <html>, <head>, <body> ou qualquer cabeçalho ou rodapé. Forneça APENAS o corpo do email.

IMPORTANTE: Use todo seu potencial criativo! Queremos um design que realmente impressione!
`;

      // Fazer a requisição para a API do ChatGPT
      logger.debug('OpenAIService: Enviando requisição para a API do OpenAI');
      const response = await axios.post(
        API_URL,
        {
          model: 'gpt-4o', // Modelo mais avançado disponível
          messages: [
            { role: 'system', content: 'Você é um designer de marketing digital de elite especializado em imóveis de luxo. Você cria emails visualmente deslumbrantes com HTML/CSS que impressionam clientes e geram conversões excepcionais. Seu design é moderno, elegante e sofisticado, com grande atenção aos detalhes visuais e tipografia. Você sabe como criar desejo e exclusividade através do design.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9, // Aumentar a criatividade
          max_tokens: 4000  // Dobrar o limite para permitir designs mais elaborados
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      logger.debug('OpenAIService: Resposta recebida da API do OpenAI');

      // Extrair o conteúdo HTML da resposta
      let htmlContent = response.data.choices[0].message.content;
      
      // Remover marcadores de código como ```html e ``` que podem estar no conteúdo
      htmlContent = htmlContent.replace(/```html|```/g, '');
      
      // Remover espaços em branco extras no início e fim
      htmlContent = htmlContent.trim();
      
      logger.debug('OpenAIService: Template gerado com sucesso');
      return htmlContent;
    } catch (error: any) {
      logger.error('OpenAIService: Erro ao gerar template de email:', error);
      
      // Extrair mensagem de erro mais detalhada se disponível
      let errorMessage = 'Erro ao gerar template de email';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
}

export const openAIService = new OpenAIService();
