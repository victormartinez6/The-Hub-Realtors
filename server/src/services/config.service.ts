import { SmtpConfig } from '../models/SmtpConfig';
import { db } from '../firebase/config';

const SMTP_CONFIG_DOC = 'settings/smtp';

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const docRef = db.doc(SMTP_CONFIG_DOC);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data() as SmtpConfig;
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter configurações SMTP:', error);
    throw error;
  }
}

export async function saveSmtpConfig(config: SmtpConfig): Promise<void> {
  try {
    const docRef = db.doc(SMTP_CONFIG_DOC);
    await docRef.set(config);
    console.log('Configurações SMTP salvas:', config);
  } catch (error) {
    console.error('Erro ao salvar configurações SMTP:', error);
    throw error;
  }
}
