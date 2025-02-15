import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore'
import { db } from '../config'

export interface CustomerBankAccount {
  bank: string
  agency: string
  account: string
  type: 'checking' | 'savings'
  pixKey?: string
}

export interface CustomerCostCenter {
  costCenterId: string
  costTypeId: string
}

export interface Customer {
  id?: string
  name: string
  document: string
  email: string
  phone: string
  address: {
    cep: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
  }
  bankAccounts: CustomerBankAccount[]
  costCenters: CustomerCostCenter[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export const getCustomers = async () => {
  const customersRef = collection(db, 'customers')
  const q = query(customersRef, where('active', '==', true))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Customer[]
}

export const createCustomer = async (data: Omit<Customer, 'id' | 'active' | 'createdAt' | 'updatedAt'>) => {
  const customersRef = collection(db, 'customers')
  const now = new Date().toISOString()
  
  const docRef = await addDoc(customersRef, {
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

export const updateCustomer = async (id: string, data: Partial<Customer>) => {
  const customerRef = doc(db, 'customers', id)
  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  await updateDoc(customerRef, updates)
  return { id, ...updates }
}

export const deleteCustomer = async (id: string) => {
  const customerRef = doc(db, 'customers', id)
  await updateDoc(customerRef, {
    active: false,
    updatedAt: new Date().toISOString()
  })
}