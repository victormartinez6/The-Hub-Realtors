import { collection, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Broker } from '../types/models';
import { userService } from './userService';

const COLLECTION_NAME = 'brokers';
const brokersCollection = collection(db, COLLECTION_NAME);

export const brokerService = {
  async createBroker(userId: string, brokerData: Omit<Broker, 'uid' | 'userId' | 'createdAt' | 'updatedAt' | 'active' | 'realtors'>): Promise<Broker> {
    const user = await userService.getUser(userId);
    if (!user || user.role !== 'broker') {
      throw new Error('Usuário inválido ou não é um broker');
    }

    const now = new Date().toISOString();
    const newBroker: Broker = {
      uid: userId,
      userId,
      ...brokerData,
      realtors: [],
      createdAt: now,
      updatedAt: now,
      active: true
    };

    await setDoc(doc(brokersCollection, userId), newBroker);
    return newBroker;
  },

  async updateBroker(uid: string, brokerData: Partial<Broker>): Promise<Broker> {
    const brokerRef = doc(brokersCollection, uid);
    const brokerDoc = await getDoc(brokerRef);
    
    if (!brokerDoc.exists()) {
      throw new Error('Broker não encontrado');
    }

    const updatedData = {
      ...brokerData,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(brokerRef, updatedData);
    return { uid, ...brokerDoc.data(), ...updatedData } as Broker;
  },

  async getBroker(uid: string): Promise<Broker | null> {
    const brokerDoc = await getDoc(doc(brokersCollection, uid));
    if (!brokerDoc.exists()) return null;
    
    return { uid: brokerDoc.id, ...brokerDoc.data() } as Broker;
  },

  async getAllBrokers(): Promise<Broker[]> {
    const querySnapshot = await getDocs(brokersCollection);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as Broker));
  },

  async getActiveBrokers(): Promise<Broker[]> {
    const q = query(brokersCollection, where('active', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as Broker));
  },

  async addRealtorToBroker(brokerId: string, realtorId: string): Promise<void> {
    const brokerRef = doc(brokersCollection, brokerId);
    const brokerDoc = await getDoc(brokerRef);
    
    if (!brokerDoc.exists()) {
      throw new Error('Broker não encontrado');
    }

    const broker = brokerDoc.data() as Broker;
    if (!broker.realtors.includes(realtorId)) {
      await updateDoc(brokerRef, {
        realtors: [...broker.realtors, realtorId],
        updatedAt: new Date().toISOString()
      });
    }
  },

  async removeRealtorFromBroker(brokerId: string, realtorId: string): Promise<void> {
    const brokerRef = doc(brokersCollection, brokerId);
    const brokerDoc = await getDoc(brokerRef);
    
    if (!brokerDoc.exists()) {
      throw new Error('Broker não encontrado');
    }

    const broker = brokerDoc.data() as Broker;
    await updateDoc(brokerRef, {
      realtors: broker.realtors.filter(id => id !== realtorId),
      updatedAt: new Date().toISOString()
    });
  }
};
