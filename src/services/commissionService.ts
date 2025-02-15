import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { userService } from './userService';

export interface Commission {
  id: string;
  propertyId: string;
  propertyTitle: string;
  salePrice: number;
  amount: number;
  percentage: number;
  brokerId: string;
  brokerName: string;
  realtorId?: string;
  realtorName?: string;
  partnerId?: string;
  partnerName?: string;
  status: 'pending' | 'paid';
  date: Date;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'commissions';
const commissionsCollection = collection(db, COLLECTION_NAME);

async function getCurrentUserWithRole() {
  const user = await userService.getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user;
}

export const commissionService = {
  async getCommissions(): Promise<Commission[]> {
    const user = await getCurrentUserWithRole();
    let q;

    switch (user.role) {
      case 'super_admin':
        q = query(commissionsCollection, orderBy('date', 'desc'));
        break;
      case 'broker':
        q = query(
          commissionsCollection,
          where('brokerId', '==', user.uid),
          orderBy('date', 'desc')
        );
        break;
      case 'realtor':
        q = query(
          commissionsCollection,
          where('realtorId', '==', user.uid),
          orderBy('date', 'desc')
        );
        break;
      case 'partner':
        q = query(
          commissionsCollection,
          where('partnerId', '==', user.uid),
          orderBy('date', 'desc')
        );
        break;
      default:
        throw new Error('Role não reconhecida');
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidAt: doc.data().paidAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Commission[];
  },

  async addCommission(commissionData: Omit<Commission, 'id'>): Promise<Commission> {
    const user = await getCurrentUserWithRole();
    
    if (!['super_admin', 'broker'].includes(user.role)) {
      throw new Error('Usuário não tem permissão para criar comissões');
    }

    const now = new Date();
    const newCommissionData = {
      ...commissionData,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(commissionsCollection, newCommissionData);
    return {
      id: docRef.id,
      ...newCommissionData
    } as Commission;
  },

  async updateCommission(id: string, commissionData: Partial<Commission>): Promise<Commission> {
    const user = await getCurrentUserWithRole();
    const commissionRef = doc(commissionsCollection, id);
    const commissionDoc = await getDoc(commissionRef);

    if (!commissionDoc.exists()) {
      throw new Error('Comissão não encontrada');
    }

    const commission = commissionDoc.data() as Commission;

    // Verificar permissões
    if (user.role !== 'super_admin' && user.uid !== commission.brokerId) {
      throw new Error('Usuário não tem permissão para atualizar esta comissão');
    }

    const updateData = {
      ...commissionData,
      updatedAt: new Date()
    };

    await updateDoc(commissionRef, updateData);

    return {
      id,
      ...commission,
      ...updateData
    } as Commission;
  },

  async deleteCommission(id: string): Promise<void> {
    const user = await getCurrentUserWithRole();
    const commissionRef = doc(commissionsCollection, id);
    const commissionDoc = await getDoc(commissionRef);

    if (!commissionDoc.exists()) {
      throw new Error('Comissão não encontrada');
    }

    const commission = commissionDoc.data() as Commission;

    // Verificar permissões
    if (user.role !== 'super_admin' && user.uid !== commission.brokerId) {
      throw new Error('Usuário não tem permissão para excluir esta comissão');
    }

    await deleteDoc(commissionRef);
  },

  async getCommission(id: string): Promise<Commission> {
    const commissionRef = doc(commissionsCollection, id);
    const commissionDoc = await getDoc(commissionRef);

    if (!commissionDoc.exists()) {
      throw new Error('Comissão não encontrada');
    }

    return {
      id: commissionDoc.id,
      ...commissionDoc.data(),
      date: commissionDoc.data().date?.toDate(),
      dueDate: commissionDoc.data().dueDate?.toDate(),
      paidAt: commissionDoc.data().paidAt?.toDate(),
      createdAt: commissionDoc.data().createdAt?.toDate(),
      updatedAt: commissionDoc.data().updatedAt?.toDate()
    } as Commission;
  },

  async checkCommissionExists(id: string): Promise<boolean> {
    const commissionRef = doc(commissionsCollection, id);
    const commissionDoc = await getDoc(commissionRef);
    return commissionDoc.exists();
  },

  async markAsPaid(id: string, paymentData: {
    paidAt: Date,
    paymentMethod: string,
    paymentReference?: string
  }): Promise<Commission> {
    const user = await getCurrentUserWithRole();
    const commissionRef = doc(commissionsCollection, id);
    const commissionDoc = await getDoc(commissionRef);

    if (!commissionDoc.exists()) {
      throw new Error('Comissão não encontrada');
    }

    const commission = commissionDoc.data() as Commission;

    // Verificar permissões
    if (user.role !== 'super_admin' && user.uid !== commission.brokerId) {
      throw new Error('Usuário não tem permissão para marcar esta comissão como paga');
    }

    const updateData = {
      status: 'paid',
      paidAt: paymentData.paidAt,
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.paymentReference,
      updatedAt: new Date()
    };

    await updateDoc(commissionRef, updateData);

    return {
      id,
      ...commission,
      ...updateData
    } as Commission;
  }
};
