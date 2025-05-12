// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
import sgMail from '@sendgrid/mail';

// Configurar a API key do SendGrid
// A chave deve ser configurada como variável de ambiente ou em um arquivo .env
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SUA_API_KEY_AQUI';
sgMail.setApiKey(SENDGRID_API_KEY);

const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'contato@thehub.com.br', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  });
