interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  content: string;
}

// Armazenamento temporário em memória
let templates: EmailTemplate[] = [];

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return templates;
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const template = templates.find(t => t.id === id);
  return template || null;
}

export async function createEmailTemplate(data: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
  const template: EmailTemplate = {
    ...data,
    id: Date.now().toString() // Gerar ID único temporário
  };
  templates.push(template);
  return template;
}

export async function updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;

  templates[index] = {
    ...templates[index],
    ...data,
    id // Manter o ID original
  };

  return templates[index];
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  templates = templates.filter(t => t.id !== id);
}
