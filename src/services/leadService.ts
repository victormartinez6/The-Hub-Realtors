import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, getDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { FileAttachment } from './fileService';
import { webhookService } from './webhookService';
import { userService } from './userService';
import type { Lead } from '../types/models';

const COLLECTION_NAME = 'leads';
const leadsCollection = collection(db, COLLECTION_NAME);

function convertFirestoreData(doc: any): Lead {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    countryCode: data.countryCode || '55',
    status: data.status || 'new',
    source: data.source || 'website',
    priority: data.priority || 'medium',
    notes: data.notes || '',
    familyMembers: data.familyMembers || [],
    propertyValue: data.propertyValue || 0,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    createdBy: data.createdBy || '',
    brokerId: data.brokerId || '',
    assignedRealtors: Array.isArray(data.assignedRealtors) ? data.assignedRealtors : [],
    assignedPartners: Array.isArray(data.assignedPartners) ? data.assignedPartners : [],
    kanbanColumn: data.kanbanColumn || '',
    archived: data.archived || false
  } as Lead;
}

async function getCurrentUserWithRole() {
  const user = await userService.getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user;
}

export const leadService = {
  async getLeads(): Promise<Lead[]> {
    const user = await getCurrentUserWithRole();
    console.log('LeadService - Buscando leads para usuário:', user);

    let querySnapshots: any[] = [];

    switch (user.role) {
      case 'super_admin':
        const adminQuery = query(leadsCollection);
        const adminSnapshot = await getDocs(adminQuery);
        querySnapshots.push(adminSnapshot);
        break;

      case 'broker':
        // Buscar leads onde o broker é dono
        const brokerLeadsQuery = query(
          leadsCollection,
          where('brokerId', '==', user.uid)
        );
        const brokerSnapshot = await getDocs(brokerLeadsQuery);
        querySnapshots.push(brokerSnapshot);

        // Buscar leads criados pelo broker
        const brokerCreatedQuery = query(
          leadsCollection,
          where('createdBy', '==', user.uid)
        );
        const brokerCreatedSnapshot = await getDocs(brokerCreatedQuery);
        querySnapshots.push(brokerCreatedSnapshot);
        break;

      case 'realtor':
        // Buscar leads onde o realtor é criador
        const realtorLeadsCreated = query(
          leadsCollection,
          where('createdBy', '==', user.uid)
        );
        const createdSnapshot = await getDocs(realtorLeadsCreated);
        querySnapshots.push(createdSnapshot);

        // Buscar leads onde o realtor está atribuído
        const realtorLeadsAssigned = query(
          leadsCollection,
          where('assignedRealtors', 'array-contains', user.uid)
        );
        const assignedSnapshot = await getDocs(realtorLeadsAssigned);
        querySnapshots.push(assignedSnapshot);
        break;

      case 'partner':
        // Buscar leads onde o parceiro é criador
        const partnerLeadsCreated = query(
          leadsCollection,
          where('createdBy', '==', user.uid)
        );
        const partnerCreatedSnapshot = await getDocs(partnerLeadsCreated);
        querySnapshots.push(partnerCreatedSnapshot);

        // Buscar leads onde o parceiro está atribuído
        const partnerLeadsShared = query(
          leadsCollection,
          where('assignedPartners', 'array-contains', user.uid)
        );
        const partnerSharedSnapshot = await getDocs(partnerLeadsShared);
        querySnapshots.push(partnerSharedSnapshot);
        break;

      default:
        throw new Error('Role não reconhecida');
    }

    // Combinar todos os resultados, removendo duplicatas pelo ID
    const leadsMap = new Map();
    querySnapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        leadsMap.set(doc.id, convertFirestoreData(doc));
      });
    });

    // Ordenar os leads por data de criação
    const leads = Array.from(leadsMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log('LeadService - Total de leads encontrados:', leads.length);
    return leads;
  },

  async addLead(leadData: Omit<Lead, 'id'>): Promise<Lead> {
    const user = await getCurrentUserWithRole();
    console.log('LeadService - Adicionando lead:', leadData);
    
    // Garantir que os arrays de realtors e partners sejam sempre arrays válidos
    let assignedRealtors = Array.isArray(leadData.assignedRealtors) ? [...leadData.assignedRealtors] : [];
    let assignedPartners = Array.isArray(leadData.assignedPartners) ? [...leadData.assignedPartners] : [];
    
    // Atribuição automática baseada no papel do usuário
    if (user.role === 'realtor' && !assignedRealtors.includes(user.uid)) {
      assignedRealtors.push(user.uid);
      console.log('LeadService - Realtor atribuído automaticamente:', user.uid);
    } else if (user.role === 'partner' && !assignedPartners.includes(user.uid)) {
      assignedPartners.push(user.uid);
      console.log('LeadService - Partner atribuído automaticamente:', user.uid);
    }
    
    // Se for um realtor, precisamos buscar o broker vinculado a ele
    let brokerId = '';
    if (user.role === 'realtor') {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        brokerId = userData.brokerId || '';
      }
    } else if (user.role === 'broker') {
      brokerId = user.uid;
    }

    // Criar o novo lead com os campos obrigatórios
    const newLead = {
      ...leadData,
      createdBy: user.uid,
      brokerId: brokerId || leadData.brokerId || '',
      assignedRealtors,
      assignedPartners,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false
    };

    console.log('LeadService - Dados do novo lead:', newLead);

    // Adicionar ao Firestore
    const docRef = await addDoc(leadsCollection, newLead);
    console.log('LeadService - Lead adicionado com ID:', docRef.id);
    
    // Notificar via webhook sobre o novo lead
    try {
      // Notificar sobre a criação do lead
      await webhookService.trigger('lead.created', {
        id: docRef.id,
        ...newLead
      });

      // Notificar realtors atribuídos
      if (assignedRealtors.length > 0) {
        await webhookService.trigger('lead.realtor.assigned', {
          id: docRef.id,
          realtorIds: assignedRealtors,
          leadData: newLead
        });
      }

      // Notificar parceiros atribuídos
      if (assignedPartners.length > 0) {
        await webhookService.trigger('lead.partner.assigned', {
          id: docRef.id,
          partnerIds: assignedPartners,
          leadData: newLead
        });
      }

      // Notificar o broker se o lead foi criado por um realtor
      if (user.role === 'realtor' && brokerId) {
        await webhookService.trigger('lead.broker.assigned', {
          id: docRef.id,
          brokerId,
          leadData: newLead
        });
      }
    } catch (error) {
      console.warn('Erro ao notificar webhook:', error);
      // Não vamos impedir a criação do lead se o webhook falhar
    }
    
    return convertFirestoreData({ id: docRef.id, data: () => newLead });
  },

  async updateLead(id: string, leadData: Partial<Lead>): Promise<Lead> {
    const user = await getCurrentUserWithRole();
    const leadRef = doc(leadsCollection, id);
    const leadDoc = await getDoc(leadRef);
    
    if (!leadDoc.exists()) {
      throw new Error('Lead não encontrado');
    }

    const currentLead = convertFirestoreData(leadDoc);

    // Verificar permissões
    let canEditAllFields = false;
    if (user.role === 'super_admin') {
      canEditAllFields = true;
    } else if (user.role === 'broker') {
      if (currentLead.brokerId === user.uid || currentLead.createdBy === user.uid) {
        canEditAllFields = true;
      } else {
        throw new Error('Sem permissão para editar este lead');
      }
    } else if (user.role === 'realtor') {
      if (currentLead.createdBy === user.uid || currentLead.assignedRealtors?.includes(user.uid)) {
        // Se o realtor criou o lead ou está atribuído, pode editar todos os campos
        canEditAllFields = true;
      } else {
        throw new Error('Sem permissão para editar este lead');
      }
    } else if (user.role === 'partner') {
      if (!currentLead.assignedPartners?.includes(user.uid)) {
        throw new Error('Sem permissão para editar este lead');
      }
      canEditAllFields = false;
    }

    // Garantir que os arrays de realtors e partners sejam sempre arrays válidos
    let assignedRealtors = Array.isArray(currentLead.assignedRealtors) ? [...currentLead.assignedRealtors] : [];
    let assignedPartners = Array.isArray(currentLead.assignedPartners) ? [...currentLead.assignedPartners] : [];

    if (canEditAllFields) {
      // Se tem permissão total, pode atualizar realtors e partners
      if (Array.isArray(leadData.assignedRealtors)) {
        assignedRealtors = [...leadData.assignedRealtors];
      }
      if (Array.isArray(leadData.assignedPartners)) {
        assignedPartners = [...leadData.assignedPartners];
      }

      // Se o broker removeu o realtor que criou o lead, precisamos atualizar o createdBy
      if (user.role === 'broker' && !assignedRealtors.includes(currentLead.createdBy)) {
        // Se não há realtors atribuídos, o broker se torna o criador
        if (assignedRealtors.length === 0) {
          leadData.createdBy = user.uid;
        } else {
          // Caso contrário, o primeiro realtor da lista se torna o criador
          leadData.createdBy = assignedRealtors[0];
        }
      }
    }

    // Remover campos undefined ou null antes de atualizar
    const cleanedData = Object.entries(leadData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Atualizar o lead
    const updatedData = {
      ...cleanedData,
      assignedRealtors,
      assignedPartners,
      updatedAt: new Date().toISOString()
    };

    console.log('LeadService - Atualizando lead:', id, updatedData);

    await updateDoc(leadRef, updatedData);
    const updated = { ...currentLead, ...updatedData };
    
    // Notificar via webhook sobre a atualização do lead
    try {
      // Notificar sobre a atualização geral do lead
      await webhookService.trigger('lead.updated', updated);

      // Verificar mudanças nos realtors atribuídos
      const removedRealtors = currentLead.assignedRealtors.filter(id => !assignedRealtors.includes(id));
      const addedRealtors = assignedRealtors.filter(id => !currentLead.assignedRealtors.includes(id));

      if (removedRealtors.length > 0) {
        await webhookService.trigger('lead.realtor.unassigned', {
          id,
          realtorIds: removedRealtors,
          leadData: updated
        });
      }

      if (addedRealtors.length > 0) {
        await webhookService.trigger('lead.realtor.assigned', {
          id,
          realtorIds: addedRealtors,
          leadData: updated
        });
      }

      // Verificar mudanças nos parceiros atribuídos
      const removedPartners = currentLead.assignedPartners.filter(id => !assignedPartners.includes(id));
      const addedPartners = assignedPartners.filter(id => !currentLead.assignedPartners.includes(id));

      if (removedPartners.length > 0) {
        await webhookService.trigger('lead.partner.unassigned', {
          id,
          partnerIds: removedPartners,
          leadData: updated
        });
      }

      if (addedPartners.length > 0) {
        await webhookService.trigger('lead.partner.assigned', {
          id,
          partnerIds: addedPartners,
          leadData: updated
        });
      }
    } catch (error) {
      console.warn('Erro ao notificar webhook:', error);
    }

    return updated;
  },

  async deleteLead(id: string): Promise<void> {
    const user = await getCurrentUserWithRole();
    const leadRef = doc(leadsCollection, id);
    const leadDoc = await getDoc(leadRef);
    
    if (!leadDoc.exists()) {
      throw new Error('Lead não encontrado');
    }

    const lead = convertFirestoreData(leadDoc);

    // Verificar permissões
    if (user.role !== 'super_admin') {
      if (user.role === 'realtor' && lead.createdBy !== user.uid) {
        throw new Error('Sem permissão para deletar este lead');
      }
      if (user.role === 'broker' && 
          lead.brokerId !== user.uid && 
          lead.createdBy !== user.uid) {
        throw new Error('Sem permissão para deletar este lead');
      }
      if (user.role === 'partner') {
        throw new Error('Parceiros não podem deletar leads');
      }
    }

    await deleteDoc(leadRef);
    
    // Notificar via webhook sobre a exclusão do lead
    try {
      await webhookService.trigger('lead.deleted', lead);
    } catch (error) {
      console.warn('Erro ao notificar webhook de lead excluído:', error);
    }
  },

  async shareLead(id: string, partnerIds: string[]): Promise<void> {
    const user = await getCurrentUserWithRole();
    const leadRef = doc(leadsCollection, id);
    const leadDoc = await getDoc(leadRef);
    
    if (!leadDoc.exists()) {
      throw new Error('Lead não encontrado');
    }

    const lead = convertFirestoreData(leadDoc);

    // Verificar permissões
    if (user.role !== 'super_admin') {
      if (user.role === 'realtor' && lead.createdBy !== user.uid) {
        throw new Error('Sem permissão para compartilhar este lead');
      }
      if (user.role === 'broker' && 
          lead.brokerId !== user.uid && 
          lead.createdBy !== user.uid) {
        throw new Error('Sem permissão para compartilhar este lead');
      }
      if (user.role === 'partner') {
        throw new Error('Parceiros não podem compartilhar leads');
      }
    }

    // Verificar se todos os IDs são válidos
    for (const partnerId of partnerIds) {
      const partnerUser = await userService.getCurrentUser(partnerId);
      if (!partnerUser || partnerUser.role !== 'partner') {
        throw new Error(`Usuário ${partnerId} não é um parceiro válido`);
      }
    }

    // Atualizar o array assignedPartners
    const currentPartners = lead.assignedPartners || [];
    const updatedPartners = [...new Set([...currentPartners, ...partnerIds])];

    // Atualizar o documento no Firestore
    await updateDoc(leadRef, {
      assignedPartners: updatedPartners,
      updatedAt: new Date().toISOString()
    });

    // Notificar via webhook
    try {
      await webhookService.trigger('lead.shared', {
        leadId: id,
        sharedBy: user.uid,
        sharedWith: partnerIds
      });
    } catch (error) {
      console.warn('Erro ao notificar webhook de lead compartilhado:', error);
    }
  },

  async getLeadByEmail(email: string): Promise<Lead | null> {
    try {
      const user = await getCurrentUserWithRole();
      const searchEmail = email.toLowerCase().trim();
      
      // Busca todos os leads do usuário
      const allLeadsQuery = query(
        leadsCollection,
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(allLeadsQuery);
      let foundLead: Lead | null = null;
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email?.toLowerCase().trim() === searchEmail) {
          foundLead = convertFirestoreData(doc);
        }
      });
      
      if (foundLead) {
        console.log('Lead encontrado:', foundLead);
        return foundLead;
      }
      
      console.log('Nenhum lead encontrado com este email');
      return null;
    } catch (error) {
      console.error('Error in getLeadByEmail:', error);
      throw error;
    }
  },

  async checkLeadExists(id: string): Promise<boolean> {
    try {
      console.log('Verificando existência do lead:', id);
      const docRef = doc(leadsCollection, id);
      const docSnap = await getDoc(docRef);
      const exists = docSnap.exists();
      console.log('Lead existe?', exists);
      return exists;
    } catch (error) {
      console.error('Erro ao verificar existência do lead:', error);
      return false;
    }
  },

  async getLead(id: string): Promise<Lead> {
    try {
      const docRef = doc(leadsCollection, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Lead não encontrado');
      }
      const lead = convertFirestoreData(docSnap);
      return lead;
    } catch (error) {
      console.error('Error in getLead:', error);
      throw error;
    }
  },

  async archiveLead(id: string): Promise<Lead> {
    return this.updateLead(id, { archived: true });
  },

  async unarchiveLead(id: string): Promise<Lead> {
    return this.updateLead(id, { archived: false });
  },
};
