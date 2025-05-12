// Arquivo de teste para o SendGrid
import sgMail from '@sendgrid/mail';

// Configurar a API key do SendGrid
const SENDGRID_API_KEY = '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';
sgMail.setApiKey(SENDGRID_API_KEY);

// Email de teste - use o mesmo formato que o SendGrid recomenda
const msg = {
  to: 'victormartinez6@gmail.com', // Seu email para receber o teste
  from: {
    email: 'mkt@thehubrealtors.com', // Deve ser um email verificado no SendGrid
    name: 'The Hub Realtors'
  },
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

// Função para enviar o email com mais detalhes de erro
async function sendTestEmail() {
  try {
    const response = await sgMail.send(msg);
    console.log('Email enviado com sucesso!');
    console.log('Status:', response[0].statusCode);
    console.log('Headers:', response[0].headers);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:');
    console.error(error);
    
    // Mostrar detalhes completos do erro
    if (error.response) {
      console.error('Corpo da resposta:', JSON.stringify(error.response.body, null, 2));
    }
    return false;
  }
}

// Executar o teste
sendTestEmail()
  .then(success => {
    console.log('Resultado do teste:', success ? 'SUCESSO' : 'FALHA');
  })
  .catch(err => {
    console.error('Erro não tratado:', err);
  });
