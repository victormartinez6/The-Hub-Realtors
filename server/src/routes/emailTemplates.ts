import express from 'express';
import { 
  getEmailTemplates, 
  getEmailTemplate, 
  createEmailTemplate, 
  updateEmailTemplate, 
  deleteEmailTemplate 
} from '../services/emailTemplate.service';

const router = express.Router();

// Listar todos os templates
router.get('/', async (req, res) => {
  try {
    const templates = await getEmailTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    res.status(500).json({ error: 'Erro ao listar templates' });
  }
});

// Obter um template específico
router.get('/:id', async (req, res) => {
  try {
    const template = await getEmailTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }
    res.json(template);
  } catch (error) {
    console.error('Erro ao obter template:', error);
    res.status(500).json({ error: 'Erro ao obter template' });
  }
});

// Criar novo template
router.post('/', async (req, res) => {
  try {
    const template = await createEmailTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Erro ao criar template:', error);
    res.status(500).json({ error: 'Erro ao criar template' });
  }
});

// Atualizar template
router.put('/:id', async (req, res) => {
  try {
    const template = await updateEmailTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }
    res.json(template);
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    res.status(500).json({ error: 'Erro ao atualizar template' });
  }
});

// Excluir template
router.delete('/:id', async (req, res) => {
  try {
    await deleteEmailTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    res.status(500).json({ error: 'Erro ao excluir template' });
  }
});

export default router;
