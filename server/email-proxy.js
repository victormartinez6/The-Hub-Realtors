const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rota para enviar email via SMTP
app.post('/api/email/send', async (req, res) => {
  try {
    const { smtpConfig, to, subject, text, html, cc, bcc, replyTo, from, attachments } = req.body;

    if (!smtpConfig) {
      return res.status(400).json({ success: false, message: 'Configuração SMTP não fornecida' });
    }

    if (!to || !subject) {
      return res.status(400).json({ success: false, message: 'Destinatário e assunto são obrigatórios' });
    }

    // Configurar o transporte SMTP
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.encryption === 'ssl', // true para 465, false para outras portas
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      tls: {
        // Não verificar certificado para desenvolvimento local
        rejectUnauthorized: false
      }
    });

    // Preparar o email
    const mailOptions = {
      from: from || smtpConfig.username,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      replyTo
    };

    // Adicionar anexos se houver
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: 'base64',
        contentType: attachment.type,
        contentDisposition: attachment.disposition
      }));
    }

    // Enviar o email
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email enviado com sucesso',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao enviar email: ${error.message}`
    });
  }
});

// Rota para testar a conexão SMTP
app.post('/api/email/test-connection', async (req, res) => {
  try {
    const { smtpConfig } = req.body;

    if (!smtpConfig) {
      return res.status(400).json({ success: false, message: 'Configuração SMTP não fornecida' });
    }

    // Configurar o transporte SMTP
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.encryption === 'ssl',
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexão
    await transporter.verify();

    res.json({
      success: true,
      message: 'Conexão SMTP estabelecida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao testar conexão SMTP:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao testar conexão SMTP: ${error.message}`
    });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy de email rodando na porta ${PORT}`);
});
