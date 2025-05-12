// Proxy server para o SendGrid
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const port = 3001;

// Configurar CORS para permitir requisições do frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL do seu frontend Vue
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para processar JSON
app.use(bodyParser.json());

// Configurar API key do SendGrid
// Tentar ler do arquivo .env
let SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';

// Se não conseguir ler do arquivo .env, usar a API key diretamente
if (!SENDGRID_API_KEY || !SENDGRID_API_KEY.startsWith('SG.')) {
  console.log('API key não encontrada no arquivo .env ou formato inválido. Usando API key hardcoded para teste.');
  SENDGRID_API_KEY = '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';
}

console.log('API Key (primeiros 10 caracteres):', SENDGRID_API_KEY.substring(0, 10) + '...');

// Verificar se a API key está no formato correto
if (!SENDGRID_API_KEY.startsWith('SG.')) {
  console.error('ERRO: API key não começa com "SG.". Verifique o arquivo .env');
} else {
  console.log('API key está no formato correto');
}

sgMail.setApiKey(SENDGRID_API_KEY);

// Rota para testar a conexão
app.post('/api/email/test-connection', async (req, res) => {
  try {
    console.log('Recebida requisição para testar conexão');
    
    // Verificar se a API key está configurada
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY.length === 0) {
      console.error('API key não configurada');
      return res.status(400).json({
        success: false,
        message: 'API key do SendGrid não configurada'
      });
    }

    console.log('Enviando requisição de teste para o SendGrid...');
    
    // Enviar um email de teste para verificar a conexão
    const testMsg = {
      to: 'teste@example.com', // Email de teste (não será realmente enviado)
      from: {
        email: 'mkt@thehubrealtors.com',
        name: 'The Hub Realtors'
      },
      subject: 'Teste de conexão SendGrid',
      text: 'Este é um teste de conexão com o SendGrid',
      mailSettings: {
        sandboxMode: {
          enable: true // Ativa o modo sandbox para não enviar realmente o email
        }
      }
    };

    try {
      await sgMail.send(testMsg);
      console.log('Teste de conexão bem-sucedido');
      
      res.json({
        success: true,
        message: 'Conexão com SendGrid testada com sucesso'
      });
    } catch (sendError) {
      console.error('Erro ao enviar email de teste:', sendError.toString());
      if (sendError.response) {
        console.error('Resposta do SendGrid:', JSON.stringify(sendError.response.body));
      }
      throw sendError;
    }
  } catch (error) {
    console.error('Erro ao testar conexão com SendGrid:', error);
    
    let errorMessage = 'Erro ao testar conexão com SendGrid';
    
    if (error.response && error.response.body && error.response.body.errors) {
      errorMessage = error.response.body.errors.map(err => err.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Rota para enviar email
app.post('/api/email/send', async (req, res) => {
  try {
    console.log('Recebida requisição para enviar email');
    const { to, from, subject, text, html, cc, bcc, replyTo } = req.body;
    
    // Validar campos obrigatórios
    if (!to || !from || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: to, from, subject'
      });
    }
    
    // Preparar o objeto de mensagem para o SendGrid
    const msg = {
      to,
      from,
      subject,
      text: text || '',
      html: html || '',
    };

    // Adicionar campos opcionais se fornecidos
    if (cc) msg.cc = cc;
    if (bcc) msg.bcc = bcc;
    if (replyTo) msg.replyTo = replyTo;
    
    // Enviar o email
    console.log('SendGrid Proxy: Enviando email via SendGrid:', msg);
    const response = await sgMail.send(msg);
    
    // Verificar se a resposta é válida
    if (response && response[0] && response[0].statusCode) {
      const statusCode = response[0].statusCode;
      
      // Códigos 2xx indicam sucesso
      if (statusCode >= 200 && statusCode < 300) {
        return res.json({
          success: true,
          message: `Email enviado com sucesso. Status: ${statusCode}`,
          messageId: response[0].headers['x-message-id'] || undefined
        });
      } else {
        return res.status(statusCode).json({
          success: false,
          message: `Falha ao enviar email. Status: ${statusCode}`
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Email enviado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao enviar email via SendGrid:', error);
    
    // Extrair mensagem de erro mais detalhada se disponível
    let errorMessage = 'Erro ao enviar email';
    
    if (error.response && error.response.body && error.response.body.errors) {
      errorMessage = error.response.body.errors.map(err => err.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Rota para enviar email com template
app.post('/api/email/send-template', async (req, res) => {
  try {
    console.log('Recebida requisição para enviar email com template');
    const { to, from, templateId, dynamicData, subject } = req.body;
    
    // Validar campos obrigatórios
    if (!to || !from || !templateId) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: to, from, templateId'
      });
    }
    
    // Preparar o objeto de mensagem para o SendGrid com template
    const msg = {
      to,
      from,
      subject: subject || 'The Hub Realtors',
      templateId,
      dynamicTemplateData: dynamicData || {},
    };
    
    // Enviar o email
    console.log('SendGrid Proxy: Enviando email com template via SendGrid:', { to, templateId, dynamicData });
    const response = await sgMail.send(msg);
    
    // Verificar se a resposta é válida
    if (response && response[0] && response[0].statusCode) {
      const statusCode = response[0].statusCode;
      
      // Códigos 2xx indicam sucesso
      if (statusCode >= 200 && statusCode < 300) {
        return res.json({
          success: true,
          message: `Email com template enviado com sucesso. Status: ${statusCode}`,
          messageId: response[0].headers['x-message-id'] || undefined
        });
      } else {
        return res.status(statusCode).json({
          success: false,
          message: `Falha ao enviar email com template. Status: ${statusCode}`
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Email com template enviado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao enviar email com template via SendGrid:', error);
    
    // Extrair mensagem de erro mais detalhada se disponível
    let errorMessage = 'Erro ao enviar email com template';
    
    if (error.response && error.response.body && error.response.body.errors) {
      errorMessage = error.response.body.errors.map(err => err.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor proxy do SendGrid rodando em http://localhost:${port}`);
});
