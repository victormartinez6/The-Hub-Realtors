import nodemailer from 'nodemailer';
import { SmtpConfig } from '../models/SmtpConfig';

export async function sendTestEmail(config: SmtpConfig) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: config.password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Enviar e-mail de teste
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: config.fromEmail,
      subject: 'Teste de Configuração SMTP',
      text: 'Se você recebeu este e-mail, a configuração SMTP está funcionando corretamente.',
      html: '<p>Se você recebeu este e-mail, a configuração SMTP está funcionando corretamente.</p>'
    });

    return {
      success: true,
      message: 'Conexão SMTP testada com sucesso! Um e-mail de teste foi enviado.'
    };
  } catch (error) {
    console.error('Erro ao testar conexão SMTP:', error);
    return {
      success: false,
      message: `Erro ao testar conexão SMTP: ${error.message}`
    };
  }
}
