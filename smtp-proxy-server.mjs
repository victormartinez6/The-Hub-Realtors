// SMTP Proxy Server
// Este servidor atua como intermediário entre o frontend e o servidor SMTP
// Recebe solicitações na porta 3002 e envia emails usando as configurações fornecidas

import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.SMTP_PROXY_PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rota para enviar emails
app.post('/api/email/send', async (req, res) => {
  try {
    console.log('\n=== NOVA SOLICITAÇÃO DE ENVIO DE EMAIL ===');
    console.log(`Data/Hora: ${new Date().toLocaleString()}`);
    
    const { to, subject, html, text, from, smtpConfig } = req.body;
    
    if (!to || !subject || (!html && !text) || !smtpConfig) {
      console.error('ERRO: Dados incompletos na solicitação');
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Forneça destinatário, assunto, conteúdo e configurações SMTP.'
      });
    }
    
    // Validar endereço de email do remetente
    if (!smtpConfig.fromEmail || !smtpConfig.fromEmail.includes('@')) {
      console.error(`ERRO: Endereço de email do remetente inválido: ${smtpConfig.fromEmail}`);
      return res.status(400).json({
        success: false,
        message: `Endereço de email do remetente inválido: ${smtpConfig.fromEmail}`
      });
    }
    
    // Validar endereços de email dos destinatários
    const recipients = Array.isArray(to) ? to : [to];
    const invalidRecipients = recipients.filter(email => !email.includes('@'));
    if (invalidRecipients.length > 0) {
      console.error(`ERRO: Endereços de email de destinatários inválidos: ${invalidRecipients.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: `Endereços de email de destinatários inválidos: ${invalidRecipients.join(', ')}`
      });
    }
    
    console.log('\n=== CONFIGURAÇÕES SMTP ===');
    console.log(`Host: ${smtpConfig.host}`);
    console.log(`Porta: ${smtpConfig.port}`);
    console.log(`Criptografia: ${smtpConfig.encryption}`);
    console.log(`Usuário: ${smtpConfig.username ? '******' : 'não fornecido'}`);
    console.log(`Senha: ${smtpConfig.password ? '******' : 'não fornecido'}`);
    console.log(`Nome do Remetente: ${smtpConfig.fromName}`);
    console.log(`Email do Remetente: ${smtpConfig.fromEmail}`);
    
    // Verificar configurações SMTP comuns
    if (smtpConfig.host === 'smtp.gmail.com' && smtpConfig.port === 587 && smtpConfig.encryption !== 'tls') {
      console.warn('AVISO: Gmail geralmente requer criptografia TLS na porta 587');
    }
    
    if (smtpConfig.host === 'smtp.office365.com' && smtpConfig.port === 587 && smtpConfig.encryption !== 'tls') {
      console.warn('AVISO: Outlook/Office365 geralmente requer criptografia TLS na porta 587');
    }
    
    // Criar transportador SMTP com debug ativado
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: smtpConfig.encryption === 'ssl', // true para 465, false para outras portas
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password
      },
      tls: {
        // Não verificar certificado em desenvolvimento
        rejectUnauthorized: false
      },
      debug: true, // Mostrar logs de debug
      logger: true // Registrar logs de debug no console
    });
    
    // Verificar conexão antes de enviar
    console.log('\n=== VERIFICANDO CONEXÃO SMTP ===');
    try {
      await transporter.verify();
      console.log('Conexão SMTP verificada com sucesso!');
    } catch (verifyError) {
      console.error('ERRO ao verificar conexão SMTP:', verifyError);
      return res.status(500).json({
        success: false,
        message: `Erro na conexão SMTP: ${verifyError.message}`,
        error: verifyError.toString()
      });
    }
    
    // Preparar email
    const fromAddress = from || {
      name: smtpConfig.fromName,
      address: smtpConfig.fromEmail
    };
    
    const mailOptions = {
      from: fromAddress,
      to: Array.isArray(to) ? to.join(',') : to,
      subject: subject,
      text: text,
      html: html,
      headers: {
        'X-Mailer': 'The Hub Realtors SMTP Proxy',
        'X-Priority': '3', // Normal priority
      }
    };
    
    console.log('\n=== DETALHES DO EMAIL ===');
    console.log(`De: ${typeof fromAddress === 'object' ? `${fromAddress.name} <${fromAddress.address}>` : fromAddress}`);
    console.log(`Para: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo HTML: ${html ? (html.length > 100 ? html.substring(0, 100) + '...' : html) : 'Não fornecido'}`);
    console.log(`Conteúdo Texto: ${text ? (text.length > 100 ? text.substring(0, 100) + '...' : text) : 'Não fornecido'}`);
    
    console.log('\n=== ENVIANDO EMAIL ===');
    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n=== RESULTADO DO ENVIO ===');
    console.log(`ID da Mensagem: ${info.messageId}`);
    console.log(`Resposta: ${info.response}`);
    console.log(`Aceito: ${info.accepted.join(', ')}`);
    if (info.rejected && info.rejected.length > 0) {
      console.warn(`Rejeitado: ${info.rejected.join(', ')}`);
    }
    if (info.pending && info.pending.length > 0) {
      console.warn(`Pendente: ${info.pending.join(', ')}`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Email enviado com sucesso',
      data: {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected || [],
        pending: info.pending || []
      }
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    return res.status(500).json({
      success: false,
      message: `Erro ao enviar email: ${error.message}`,
      error: error.toString()
    });
  }
});

// Rota para testar a conexão SMTP
app.post('/api/email/test-connection', async (req, res) => {
  try {
    console.log('Recebida solicitação para testar conexão SMTP');
    
    const { smtpConfig } = req.body;
    
    if (!smtpConfig) {
      return res.status(400).json({
        success: false,
        message: 'Configurações SMTP não fornecidas.'
      });
    }
    
    console.log('Testando conexão com configurações SMTP:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.encryption === 'ssl',
      auth: {
        user: smtpConfig.username ? '******' : 'não fornecido',
        pass: smtpConfig.password ? '******' : 'não fornecido'
      }
    });
    
    // Criar transportador SMTP
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.encryption === 'ssl', // true para 465, false para outras portas
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password
      },
      tls: {
        // Não verificar certificado em desenvolvimento
        rejectUnauthorized: false
      }
    });
    
    // Verificar conexão
    await transporter.verify();
    
    console.log('Conexão SMTP testada com sucesso!');
    
    return res.status(200).json({
      success: true,
      message: 'Conexão SMTP testada com sucesso!',
      data: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        encryption: smtpConfig.encryption,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao testar conexão SMTP:', error);
    
    return res.status(500).json({
      success: false,
      message: `Erro ao testar conexão SMTP: ${error.message}`,
      error: error.toString()
    });
  }
});

// Rota de verificação de saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'smtp-proxy',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor SMTP Proxy rodando na porta ${PORT}`);
  console.log(`Endpoint para envio de emails: http://localhost:${PORT}/api/email/send`);
});
