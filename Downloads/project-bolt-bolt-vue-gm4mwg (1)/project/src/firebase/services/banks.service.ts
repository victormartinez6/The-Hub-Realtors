import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../config'

export interface Bank {
  id?: string
  name: string
  agency: string
  account: string
  initialBalance: number
  initialBalanceDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export const getBanks = async () => {
  const banksRef = collection(db, 'banks')
  const q = query(banksRef, where('active', '==', true))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Bank[]
}

export const createBank = async (data: Omit<Bank, 'id' | 'active' | 'createdAt' | 'updatedAt'>) => {
  const banksRef = collection(db, 'banks')
  const now = new Date().toISOString()
  
  const docRef = await addDoc(banksRef, {
    ...data,
    active: true,
    createdAt: now,
    updatedAt: now
  })

  return {
    id: docRef.id,
    ...data,
    active: true,
    createdAt: now,
    updatedAt: now
  }
}

export const updateBank = async (id: string, data: Partial<Bank>) => {
  const bankRef = doc(db, 'banks', id)
  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  await updateDoc(bankRef, updates)
  return { id, ...updates }
}

export const deleteBank = async (id: string) => {
  const bankRef = doc(db, 'banks', id)
  await updateDoc(bankRef, {
    active: false,
    updatedAt: new Date().toISOString()
  })
}