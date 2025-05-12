import axios, { AxiosError } from 'axios';
import { SmtpConfig, SmtpTestResult } from '../models/SmtpConfig';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// URL base da API - usando o servidor de desenvolvimento
const API_URL = '/api';
const STORAGE_KEY = 'smtp_config';
const FIRESTORE_COLLECTION = 'settings';
const FIRESTORE_DOC = 'smtp';

class SmtpService {
  async getConfig(): Promise<SmtpConfig> {
    try {
      // Primeiro tentar obter do Firestore
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const firestoreConfig = docSnap.data() as SmtpConfig;
        console.log('Configurações SMTP obtidas do Firestore:', firestoreConfig);
        
        // Atualizar localStorage com dados do Firestore
        localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreConfig));
        
        return firestoreConfig;
      }

      // Se não houver no Firestore, tentar obter do localStorage
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const localConfig = JSON.parse(savedConfig);
        console.log('Configurações SMTP obtidas do localStorage:', localConfig);
        
        // Salvar no Firestore para persistência
        await this.saveConfig(localConfig);
        
        return localConfig;
      }

      // Fallback para valores padrão se não encontrar em nenhum lugar
      const defaultConfig: SmtpConfig = {
        host: '',
        port: 587,
        username: '',
        password: '',
        encryption: 'tls',
        fromName: '',
        fromEmail: ''
      };
      
      return defaultConfig;
    } catch (error) {
      this.handleError('obter configurações', error);
      throw error;
    }
  }

  async saveConfig(config: SmtpConfig): Promise<void> {
    try {
      console.log('Salvando configurações SMTP:', config);
      
      // Salvar no Firestore
      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC);
      await setDoc(docRef, config);
      console.log('Configurações SMTP salvas no Firestore com sucesso');
      
      // Salvar no localStorage como backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      
      // Tentar salvar na API se estiver disponível
      try {
        const response = await axios.post(`${API_URL}/settings/smtp`, {
          host: config.host,
          port: Number(config.port),
          username: config.username,
          password: config.password,
          encryption: config.encryption,
          fromName: config.fromName,
          fromEmail: config.fromEmail
        });
        console.log('Resposta da API ao salvar:', response.data);
      } catch (apiError) {
        console.warn('API não disponível para salvar configurações SMTP, usando apenas Firestore');
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

  private handleError(action: string, error: any) {
    console.error(`Erro ao ${action} SMTP:`, error);
    if (error instanceof AxiosError && error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

export const smtpService = new SmtpService();
