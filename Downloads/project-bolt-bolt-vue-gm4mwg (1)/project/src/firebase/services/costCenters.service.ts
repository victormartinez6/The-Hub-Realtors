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

export interface CostType {
  id?: string
  costCenterId: string  // ID do centro de custo pai
  code: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CostCenter {
  id?: string
  code: string
  name: string
  description?: string
  supplierId?: string
  customerId?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export const getCostCenters = async () => {
  const centersRef = collection(db, 'costCenters')
  const q = query(centersRef, where('active', '==', true))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CostCenter[]
}

export const createCostCenter = async (data: Omit<CostCenter, 'id' | 'active' | 'createdAt' | 'updatedAt'>) => {
  const centersRef = collection(db, 'costCenters')
  const now = new Date().toISOString()
  
  const docRef = await addDoc(centersRef, {
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

export const updateCostCenter = async (id: string, data: Partial<CostCenter>) => {
  const centerRef = doc(db, 'costCenters', id)
  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  await updateDoc(centerRef, updates)
  return { id, ...updates }
}

export const deleteCostCenter = async (id: string) => {
  const centerRef = doc(db, 'costCenters', id)
  await updateDoc(centerRef, {
    active: false,
    updatedAt: new Date().toISOString()
  })
}

// Cost Types
export const getCostTypes = async (centerId: string) => {
  const typesRef = collection(db, `costCenters/${centerId}/types`)
  const q = query(typesRef, where('active', '==', true))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CostType[]
}

export const createCostType = async (
  centerId: string, 
  data: Omit<CostType, 'id' | 'active' | 'createdAt' | 'updatedAt'>
) => {
  const typesRef = collection(db, `costCenters/${centerId}/types`)
  const now = new Date().toISOString()
  
  const docRef = await addDoc(typesRef, {
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

export const updateCostType = async (centerId: string, typeId: string, data: Partial<CostType>) => {
  const typeRef = doc(db, `costCenters/${centerId}/types/${typeId}`)
  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  await updateDoc(typeRef, updates)
  return { id: typeId, ...updates }
}

export const deleteCostType = async (centerId: string, typeId: string) => {
  const typeRef = doc(db, `costCenters/${centerId}/types/${typeId}`)
  await updateDoc(typeRef, {
    active: false,
    updatedAt: new Date().toISOString()
  })
}