// Arquivo de teste para o SendGrid
const sgMail = require('@sendgrid/mail');

// Configurar a API key do SendGrid
const SENDGRID_API_KEY = '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';
sgMail.setApiKey(SENDGRID_API_KEY);

// Email de teste
const msg = {
  to: 'test@example.com', // Substitua pelo seu email para testar
  from: 'contato@thehub.com.br', // Deve ser um email verificado no SendGrid
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

// Função para enviar o email
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
    if (error.response) {
      console.error('Corpo da resposta:', error.response.body);
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
