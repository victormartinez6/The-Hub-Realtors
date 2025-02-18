import axios, { AxiosError } from 'axios';
import { SmtpConfig, SmtpTestResult } from '../models/SmtpConfig';

// URL base da API - usando o servidor de desenvolvimento
const API_URL = '/api';
const STORAGE_KEY = 'smtp_config';

class SmtpService {
  async getConfig(): Promise<SmtpConfig> {
    try {
      // Tentar obter do localStorage primeiro
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        console.log('Configurações SMTP obtidas do localStorage:', JSON.parse(savedConfig));
        return JSON.parse(savedConfig);
      }

      // Se não houver no localStorage, obter da API
      const response = await axios.get(`${API_URL}/settings/smtp`);
      console.log('Configurações SMTP obtidas da API:', response.data);
      
      if (response.data) {
        // Salvar no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      this.handleError('obter configurações', error);
      throw error;
    }
  }

  async saveConfig(config: SmtpConfig): Promise<void> {
    try {
      console.log('Enviando configurações SMTP:', config);
      const response = await axios.post(`${API_URL}/settings/smtp`, {
        host: config.host,
        port: Number(config.port),
        username: config.username,
        password: config.password,
        encryption: config.encryption,
        fromName: config.fromName,
        fromEmail: config.fromEmail
      });
      console.log('Resposta ao salvar:', response.data);

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      this.handleError('salvar configurações', error);
      throw error;
    }
  }

  async testConnection(config: SmtpConfig): Promise<SmtpTestResult> {
    try {
      console.log('Testando conexão SMTP:', config);
      const response = await axios.post(`${API_URL}/settings/smtp/test`, {
        host: config.host,
        port: Number(config.port),
        username: config.username,
        password: config.password,
        encryption: config.encryption,
        fromName: config.fromName,
        fromEmail: config.fromEmail
      });
      console.log('Resposta do teste:', response.data);
      return response.data;
    } catch (error) {
      this.handleError('testar conexão', error);
      throw error;
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
