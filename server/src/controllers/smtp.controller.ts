import { Request, Response } from 'express';
import { SmtpConfig } from '../models/SmtpConfig';
import { emailService } from '../services/email.service';

export const smtpController = {
  async getConfig(req: Request, res: Response) {
    try {
      const config = await SmtpConfig.findOne();
      if (!config) {
        return res.status(404).json({ message: 'Configurações SMTP não encontradas' });
      }
      
      // Não retorna a senha por segurança
      const { password, ...safeConfig } = config.toObject();
      return res.json(safeConfig);
    } catch (error) {
      console.error('Erro ao buscar configurações SMTP:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async saveConfig(req: Request, res: Response) {
    try {
      const { host, port, username, password, encryption, fromName, fromEmail } = req.body;

      // Validações básicas
      if (!host || !port || !username || !fromName || !fromEmail) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      }

      // Busca configuração existente ou cria nova
      let config = await SmtpConfig.findOne();
      if (config) {
        config.host = host;
        config.port = port;
        config.username = username;
        if (password) config.password = password; // Só atualiza senha se fornecida
        config.encryption = encryption;
        config.fromName = fromName;
        config.fromEmail = fromEmail;
      } else {
        config = new SmtpConfig({
          host,
          port,
          username,
          password,
          encryption,
          fromName,
          fromEmail
        });
      }

      await config.save();
      
      // Inicializa o serviço de email com as novas configurações
      await emailService.initialize(config);

      return res.json({ message: 'Configurações salvas com sucesso' });
    } catch (error) {
      console.error('Erro ao salvar configurações SMTP:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async testConnection(req: Request, res: Response) {
    try {
      const config = req.body;
      
      // Inicializa temporariamente com as configurações de teste
      await emailService.initialize(config);
      
      const result = await emailService.testConnection();
      return res.json(result);
    } catch (error) {
      console.error('Erro ao testar conexão SMTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao testar conexão'
      });
    }
  }
};
