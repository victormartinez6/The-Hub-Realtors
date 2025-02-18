import express from 'express';
import { SmtpConfig } from '../models/SmtpConfig';
import { sendTestEmail } from '../services/smtp.service';
import { saveSmtpConfig, getSmtpConfig } from '../services/config.service';

const router = express.Router();

// Obter configurações SMTP
router.get('/smtp', async (req, res) => {
  try {
    const config = await getSmtpConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao obter configurações SMTP:', error);
    res.status(500).json({ error: 'Erro ao obter configurações SMTP' });
  }
});

// Salvar configurações SMTP
router.post('/smtp', async (req, res) => {
  try {
    const config: SmtpConfig = req.body;
    await saveSmtpConfig(config);
    res.json({ message: 'Configurações salvas com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar configurações SMTP:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações SMTP' });
  }
});

// Testar conexão SMTP
router.post('/smtp/test', async (req, res) => {
  try {
    const config: SmtpConfig = req.body;
    const result = await sendTestEmail(config);
    res.json(result);
  } catch (error) {
    console.error('Erro ao testar conexão SMTP:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao testar conexão SMTP' 
    });
  }
});

export default router;
