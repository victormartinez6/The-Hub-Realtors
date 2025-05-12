// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
import sgMail from '@sendgrid/mail';

// Usar a API key diretamente para o teste
sgMail.setApiKey('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');

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
