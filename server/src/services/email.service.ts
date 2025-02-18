import nodemailer from 'nodemailer';
import { ISmtpConfig } from '../models/SmtpConfig';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: ISmtpConfig | null = null;

  async initialize(config: ISmtpConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: config.password
      }
    });
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'Serviço de email não configurado'
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao testar conexão: ${error.message}`
      };
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter || !this.config) {
      throw new Error('Serviço de email não configurado');
    }

    const mailOptions = {
      from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
      to,
      subject,
      html
    };

    return this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
