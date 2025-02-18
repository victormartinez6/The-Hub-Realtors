import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';

const TEMPLATES_COLLECTION = 'emailTemplates';

interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  components: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

class EmailTemplateService {
  async getTemplates(): Promise<EmailTemplate[]> {
    console.log('Buscando templates no Firestore...');
    try {
      const querySnapshot = await getDocs(collection(db, TEMPLATES_COLLECTION));
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailTemplate[];
      console.log('Templates encontrados:', templates);
      return templates;
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      throw error;
    }
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    console.log('Buscando template com ID:', id);
    try {
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      const docSnap = await getDocs(collection(db, TEMPLATES_COLLECTION));
      const template = docSnap.docs.find(doc => doc.id === id);
      if (!template) {
        throw new Error('Template não encontrado');
      }
      console.log('Template encontrado:', template.data());
      return { id: template.id, ...template.data() } as EmailTemplate;
    } catch (error) {
      console.error('Erro ao obter template:', error);
      throw error;
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    console.log('Criando novo template:', template);
    try {
      const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
        name: template.name,
        description: template.description || '',
        components: template.components || [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Template criado com ID:', docRef.id);
      return { id: docRef.id, ...template };
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  async updateTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    console.log('Atualizando template:', template.id, template);
    try {
      const docRef = doc(db, TEMPLATES_COLLECTION, template.id);
      await updateDoc(docRef, {
        name: template.name,
        description: template.description || '',
        components: template.components,
        updatedAt: new Date()
      });
      console.log('Template atualizado com sucesso');
      return template;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    console.log('Deletando template:', id);
    try {
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      await deleteDoc(docRef);
      console.log('Template deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }
}

export default new EmailTemplateService();
