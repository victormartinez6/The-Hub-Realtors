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
import { FileAttachment } from './fileService';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'casa' | 'apartamento' | 'terreno' | 'comercial';
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  features: string[];
  images: FileAttachment[];
  status: 'active' | 'sold' | 'reserved';
  brokerId: string;
  realtorId?: string;
  createdAt: Date;
  updatedAt: Date;
  soldAt?: Date;
  soldPrice?: number;
  soldBy?: string;
  views: number;
  favorited: number;
  shared: number;
}

const COLLECTION_NAME = 'properties';
const propertiesCollection = collection(db, COLLECTION_NAME);

async function getCurrentUserWithRole() {
  const user = await userService.getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user;
}

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    const user = await getCurrentUserWithRole();
    let q;

    switch (user.role) {
      case 'super_admin':
        q = query(propertiesCollection, orderBy('createdAt', 'desc'));
        break;
      case 'broker':
        q = query(
          propertiesCollection,
          where('brokerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        break;
      case 'realtor':
        q = query(
          propertiesCollection,
          where('realtorId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        break;
      default:
        q = query(
          propertiesCollection,
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      soldAt: doc.data().soldAt?.toDate()
    })) as Property[];
  },

  async addProperty(propertyData: Omit<Property, 'id'>): Promise<Property> {
    const user = await getCurrentUserWithRole();
    
    if (!['super_admin', 'broker', 'realtor'].includes(user.role)) {
      throw new Error('Usuário não tem permissão para criar propriedades');
    }

    const now = new Date();
    const newPropertyData = {
      ...propertyData,
      createdAt: now,
      updatedAt: now,
      views: 0,
      favorited: 0,
      shared: 0,
      brokerId: user.role === 'broker' ? user.uid : propertyData.brokerId,
      realtorId: user.role === 'realtor' ? user.uid : propertyData.realtorId
    };

    const docRef = await addDoc(propertiesCollection, newPropertyData);
    return {
      id: docRef.id,
      ...newPropertyData
    } as Property;
  },

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    const user = await getCurrentUserWithRole();
    const propertyRef = doc(propertiesCollection, id);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Propriedade não encontrada');
    }

    const property = propertyDoc.data() as Property;

    // Verificar permissões
    if (user.role !== 'super_admin' && 
        user.uid !== property.brokerId && 
        user.uid !== property.realtorId) {
      throw new Error('Usuário não tem permissão para atualizar esta propriedade');
    }

    const updateData = {
      ...propertyData,
      updatedAt: new Date()
    };

    await updateDoc(propertyRef, updateData);

    return {
      id,
      ...property,
      ...updateData
    } as Property;
  },

  async deleteProperty(id: string): Promise<void> {
    const user = await getCurrentUserWithRole();
    const propertyRef = doc(propertiesCollection, id);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Propriedade não encontrada');
    }

    const property = propertyDoc.data() as Property;

    // Verificar permissões
    if (user.role !== 'super_admin' && user.uid !== property.brokerId) {
      throw new Error('Usuário não tem permissão para excluir esta propriedade');
    }

    await deleteDoc(propertyRef);
  },

  async getProperty(id: string): Promise<Property> {
    const propertyRef = doc(propertiesCollection, id);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Propriedade não encontrada');
    }

    return {
      id: propertyDoc.id,
      ...propertyDoc.data(),
      createdAt: propertyDoc.data().createdAt?.toDate(),
      updatedAt: propertyDoc.data().updatedAt?.toDate(),
      soldAt: propertyDoc.data().soldAt?.toDate()
    } as Property;
  },

  async checkPropertyExists(id: string): Promise<boolean> {
    const propertyRef = doc(propertiesCollection, id);
    const propertyDoc = await getDoc(propertyRef);
    return propertyDoc.exists();
  },

  async markAsSold(id: string, soldData: { 
    soldPrice: number,
    soldBy: string 
  }): Promise<Property> {
    const user = await getCurrentUserWithRole();
    const propertyRef = doc(propertiesCollection, id);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Propriedade não encontrada');
    }

    const property = propertyDoc.data() as Property;

    // Verificar permissões
    if (user.role !== 'super_admin' && 
        user.uid !== property.brokerId && 
        user.uid !== property.realtorId) {
      throw new Error('Usuário não tem permissão para marcar esta propriedade como vendida');
    }

    const updateData = {
      status: 'sold',
      soldAt: new Date(),
      soldPrice: soldData.soldPrice,
      soldBy: soldData.soldBy,
      updatedAt: new Date()
    };

    await updateDoc(propertyRef, updateData);

    return {
      id,
      ...property,
      ...updateData
    } as Property;
  },

  async incrementViews(id: string): Promise<void> {
    const propertyRef = doc(propertiesCollection, id);
    const propertyDoc = await getDoc(propertyRef);

    if (!propertyDoc.exists()) {
      throw new Error('Propriedade não encontrada');
    }

    await updateDoc(propertyRef, {
      views: (propertyDoc.data().views || 0) + 1
    });
  }
};
