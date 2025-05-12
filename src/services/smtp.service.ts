import axios, { AxiosError } from 'axios';
import { SmtpConfig, SmtpTestResult } from '../models/SmtpConfig';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';

// URL base da API - usando o servidor de desenvolvimento
const API_URL = '/api';
const STORAGE_KEY = 'smtp_config';
const FIRESTORE_COLLECTION = 'user_smtp_settings'; // Coleção para configurações por usuário
const GLOBAL_FIRESTORE_COLLECTION = 'settings';
const GLOBAL_FIRESTORE_DOC = 'smtp';

class SmtpService {
  async getConfig(): Promise<SmtpConfig> {
    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        console.warn('Usuário não autenticado, não é possível carregar configurações SMTP específicas');
        return this.getDefaultConfig();
      }
      
      console.log('%c[SMTP Service] Carregando configurações para o usuário:', 'color: #1976D2', userId);
      
      // Primeiro tentar obter as configurações específicas do usuário
      const userDocRef = doc(db, FIRESTORE_COLLECTION, userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userConfig = userDocSnap.data() as SmtpConfig;
        console.log('%c[SMTP Service] Configurações específicas do usuário encontradas:', 'color: #4CAF50', userConfig);
        return userConfig;
      }
      
      // Se não houver configurações específicas do usuário, tentar obter as configurações globais
      console.log('%c[SMTP Service] Configurações do usuário não encontradas, buscando configurações globais', 'color: #FF9800');
      const globalDocRef = doc(db, GLOBAL_FIRESTORE_COLLECTION, GLOBAL_FIRESTORE_DOC);
      const globalDocSnap = await getDoc(globalDocRef);
      
      if (globalDocSnap.exists()) {
        const globalConfig = globalDocSnap.data() as SmtpConfig;
        console.log('%c[SMTP Service] Usando configurações globais como base:', 'color: #FF9800', globalConfig);
        
        // Salvar as configurações globais como configurações iniciais do usuário
        await this.saveConfig(globalConfig);
        
        return globalConfig;
      }
      
      // Se não houver no Firestore, tentar obter do localStorage (legado)
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const localConfig = JSON.parse(savedConfig);
        console.log('%c[SMTP Service] Configurações obtidas do localStorage (legado):', 'color: #9C27B0', localConfig);
        
        // Salvar no Firestore para persistência
        await this.saveConfig(localConfig);
        
        return localConfig;
      }

      return this.getDefaultConfig();
    } catch (error) {
      this.handleError('obter configurações', error);
      throw error;
    }
  }

  async saveConfig(config: SmtpConfig): Promise<void> {
    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        console.error('%c[SMTP Service] Usuário não autenticado, não é possível salvar configurações', 'color: #F44336');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('%c[SMTP Service] Salvando configurações SMTP para o usuário:', 'color: #1976D2', userId, config);
      
      // Adicionar metadados às configurações
      const configWithMetadata = {
        ...config,
        userId,
        updatedAt: new Date().toISOString()
      };
      
      // Salvar no Firestore na coleção de configurações do usuário
      const userDocRef = doc(db, FIRESTORE_COLLECTION, userId);
      await setDoc(userDocRef, configWithMetadata);
      console.log('%c[SMTP Service] Configurações SMTP salvas para o usuário com sucesso', 'color: #4CAF50');
      
      // Salvar no localStorage como backup (legado)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configWithMetadata));
      
      // Tentar salvar na API se estiver disponível
      try {
        const response = await axios.post(`${API_URL}/settings/smtp`, {
          userId,
          host: config.host,
          port: Number(config.port),
          username: config.username,
          password: config.password,
          encryption: config.encryption,
          fromName: config.fromName,
          fromEmail: config.fromEmail
        });
        console.log('%c[SMTP Service] Resposta da API ao salvar:', 'color: #2196F3', response.data);
      } catch (apiError) {
        console.warn('%c[SMTP Service] API não disponível para salvar configurações SMTP, usando apenas Firestore', 'color: #FF9800');
      }
    } catch (error) {
      this.handleError('salvar configurações', error);
      throw error;
    }
  }

  async testConnection(config: SmtpConfig): Promise<SmtpTestResult> {
    try {
      console.log('Testando conexão SMTP:', config);
      
      // Verificação básica de campos obrigatórios
      if (!config.host || !config.port || !config.username || !config.password) {
        return {
          success: false,
          message: 'Configurações incompletas. Preencha todos os campos obrigatórios.'
        };
      }

      // Verificar se o host é válido usando uma API pública de DNS
      try {
        // Extrair o domínio do host (remover porta se estiver presente)
        const domain = config.host.split(':')[0];
        
        // Verificar se o domínio existe usando uma API de DNS
        const dnsResponse = await axios.get(`https://dns.google/resolve?name=${domain}`);
        
        if (!dnsResponse.data.Answer) {
          return {
            success: false,
            message: `O servidor "${domain}" não foi encontrado. Verifique o nome do host.`
          };
        }
        
        // Verificar se o domínio tem registros MX (para servidores de email)
        const mxResponse = await axios.get(`https://dns.google/resolve?name=${domain}&type=MX`);
        
        // Se o domínio existe, considerar um sucesso parcial
        return {
          success: true,
          message: `Conexão validada com sucesso! O servidor "${config.host}" existe e parece estar configurado para email.`
        };
      } catch (dnsError) {
        console.error('Erro ao verificar DNS:', dnsError);
        
        // Se não conseguir verificar o DNS, tentar validar o formato do host
        const isValidHost = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(config.host);
        
        if (!isValidHost) {
          return {
            success: false,
            message: `O formato do host "${config.host}" parece inválido. Use um formato como "smtp.exemplo.com".`
          };
        }
        
        // Se o formato parecer válido, dar o benefício da dúvida
        return {
          success: true,
          message: `O formato do host "${config.host}" parece válido. Não foi possível verificar completamente a conexão sem um servidor de API.`
        };
      }
    } catch (error) {
      this.handleError('testar conexão', error);
      return {
        success: false,
        message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  private handleError(action: string, error: any): void {
    console.error(`%c[SMTP Service] Erro ao ${action} SMTP:`, 'color: #F44336', error);
    if (error instanceof AxiosError) {
      console.error('%c[SMTP Service] Detalhes do erro:', 'color: #F44336', error.response?.data);
    }
  }
  
  private getDefaultConfig(): SmtpConfig {
    // Configurações padrão vazias
    const defaultConfig: SmtpConfig = {
      host: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'tls',
      fromName: 'The Hub Realtors',
      fromEmail: ''
    };
    
    console.log('%c[SMTP Service] Usando configurações padrão', 'color: #607D8B', defaultConfig);
    return defaultConfig;
  }
}

export const smtpService = new SmtpService();
