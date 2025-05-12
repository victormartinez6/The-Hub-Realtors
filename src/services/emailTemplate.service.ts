import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, getDoc, setDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../stores/auth';
import { EmailTemplate } from '../types/email';

const TEMPLATES_COLLECTION = 'emailTemplates';

// Interface EmailTemplate importada de types/email.ts

class EmailTemplateService {
  async getTemplates(): Promise<EmailTemplate[]> {
    console.log('Buscando templates no Firestore...');
    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        console.warn('Usuário não autenticado, retornando lista vazia');
        return [];
      }
      
      console.log('Buscando templates para o usuário:', userId);
      
      // Criar uma consulta que filtra por userId
      const templatesQuery = query(
        collection(db, TEMPLATES_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(templatesQuery);
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailTemplate[];
      
      console.log(`Encontrados ${templates.length} templates para o usuário`);
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
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Template não encontrado');
      }
      
      const templateData = docSnap.data();
      console.log('Template encontrado:', templateData);
      
      // Verificar se o template pertence ao usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (templateData.userId && templateData.userId !== userId) {
        throw new Error('Você não tem permissão para acessar este template');
      }
      
      return { 
        id: docSnap.id, 
        name: templateData.name || '',
        description: templateData.description || '',
        components: templateData.components || [],
        createdAt: templateData.createdAt instanceof Timestamp ? templateData.createdAt.toDate() : templateData.createdAt,
        updatedAt: templateData.updatedAt instanceof Timestamp ? templateData.updatedAt.toDate() : templateData.updatedAt,
        mlsId: templateData.mlsId || '',
        userId: templateData.userId || '',
        ...templateData
      } as EmailTemplate;
    } catch (error) {
      console.error('Erro ao obter template:', error);
      throw error;
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    console.log('Criando novo template:', template);
    try {
      // Obter o ID do usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Preparar os dados para salvar
      const templateData = {
        name: template.name,
        description: template.description || '',
        components: template.components || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        mlsId: template.mlsId || '',
        userId: userId // Adicionar o ID do usuário ao template
      };
      
      // Adicionar documento ao Firestore
      const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), templateData);
      console.log('Template criado com ID:', docRef.id);
      
      // Retornar o template completo
      return { 
        id: docRef.id, 
        ...templateData,
        components: template.components || [] 
      } as EmailTemplate;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    console.log('Atualizando template:', id, template);
    try {
      // Primeiro, obter o template atual para garantir que temos todos os dados
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Template não encontrado para atualização');
      }
      
      const currentData = docSnap.data();
      console.log('Dados atuais do template:', currentData);
      
      // Verificar se o template pertence ao usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (currentData.userId && currentData.userId !== userId) {
        throw new Error('Você não tem permissão para atualizar este template');
      }
      
      // Criar um objeto com os campos a serem atualizados, mantendo os dados existentes
      const updateData: any = {
        ...currentData,
        updatedAt: new Date()
      };
      
      // Adicionar campos apenas se estiverem definidos
      if (template.name !== undefined) updateData.name = template.name;
      if (template.description !== undefined) updateData.description = template.description || '';
      
      // Garantir que a estrutura completa dos componentes seja preservada
      if (template.components !== undefined) {
        // Converter cada componente para um objeto simples para evitar problemas de serialização
        updateData.components = template.components.map(comp => {
          // Criar uma cópia limpa do componente
          const cleanComp = { ...comp };
          
          // Remover quaisquer propriedades que possam causar problemas
          if (cleanComp._dragging !== undefined) delete cleanComp._dragging;
          if (cleanComp._sortable !== undefined) delete cleanComp._sortable;
          
          return cleanComp;
        });
        
        console.log('Componentes a serem salvos:', updateData.components);
      }
      
      // Adicionar outros campos se presentes
      if (template.mlsId !== undefined) updateData.mlsId = template.mlsId;
      
      // Usar setDoc com merge:false para garantir que todos os dados sejam substituídos
      await setDoc(docRef, updateData);
      console.log('Template atualizado com sucesso');
      
      // Obter o template atualizado
      const updatedDocSnap = await getDoc(docRef);
      
      if (!updatedDocSnap.exists()) {
        throw new Error('Não foi possível obter o template atualizado');
      }
      
      const updatedData = updatedDocSnap.data();
      
      // Retornar o template atualizado
      return { 
        id, 
        name: updatedData?.name || '',
        description: updatedData?.description || '',
        components: updatedData?.components || [],
        createdAt: updatedData?.createdAt instanceof Timestamp ? updatedData.createdAt.toDate() : updatedData?.createdAt,
        updatedAt: updatedData?.updatedAt instanceof Timestamp ? updatedData.updatedAt.toDate() : updatedData?.updatedAt,
        mlsId: updatedData?.mlsId || '',
        userId: updatedData?.userId || '',
        ...updatedData
      } as EmailTemplate;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    console.log('Deletando template:', id);
    try {
      // Verificar se o template pertence ao usuário atual
      const docRef = doc(db, TEMPLATES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Template não encontrado');
      }
      
      const templateData = docSnap.data();
      
      // Verificar se o template pertence ao usuário atual
      const authStore = useAuthStore();
      const userId = authStore.user?.uid;
      
      if (templateData.userId && templateData.userId !== userId) {
        throw new Error('Você não tem permissão para excluir este template');
      }
      
      await deleteDoc(docRef);
      console.log('Template deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }
}

export default new EmailTemplateService();
