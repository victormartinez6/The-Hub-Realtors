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

export interface SupplierBankAccount {
  bank: string
  agency: string
  account: string
  type: 'checking' | 'savings'
  pixKey?: string
}

export interface SupplierCostCenter {
  costCenterId: string
  costTypeId: string
}

export interface Supplier {
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
  bankAccounts: SupplierBankAccount[]
  costCenters: SupplierCostCenter[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export const getSuppliers = async () => {
  console.log('[suppliers.service] Getting suppliers...')
  try {
    const suppliersRef = collection(db, 'suppliers')
    console.log('[suppliers.service] Collection reference:', suppliersRef)
    
    // Get all suppliers, including those without an active field
    const snapshot = await getDocs(suppliersRef)
    console.log('[suppliers.service] Snapshot size:', snapshot.size)
    console.log('[suppliers.service] Empty?', snapshot.empty)
    
    const suppliers = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('[suppliers.service] Document data:', data)
      return {
        id: doc.id,
        ...data,
        active: data.active ?? true // Default to true if active field is not present
      }
    }) as Supplier[]
    
    // Filter out inactive suppliers
    const activeSuppliers = suppliers.filter(s => s.active)
    console.log('[suppliers.service] Found active suppliers:', activeSuppliers)
    return activeSuppliers
  } catch (error) {
    console.error('[suppliers.service] Error getting suppliers:', error)
    throw error
  }
}

export const createSupplier = async (data: Omit<Supplier, 'id' | 'active' | 'createdAt' | 'updatedAt'>) => {
  console.log('[suppliers.service] Creating supplier:', data)
  try {
    const now = new Date().toISOString()
    const supplierData = {
      ...data,
      active: true,
      createdAt: now,
      updatedAt: now
    }
    
    const docRef = await addDoc(collection(db, 'suppliers'), supplierData)
    console.log('[suppliers.service] Supplier created with ID:', docRef.id)
    
    return {
      id: docRef.id,
      ...supplierData
    }
  } catch (error) {
    console.error('[suppliers.service] Error creating supplier:', error)
    throw error
  }
}

export const updateSupplier = async (id: string, data: Partial<Supplier>) => {
  console.log('[suppliers.service] Updating supplier:', id, data)
  try {
    const supplierRef = doc(db, 'suppliers', id)
    const updates = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    await updateDoc(supplierRef, updates)
    console.log('[suppliers.service] Supplier updated successfully')
    return { id, ...updates }
  } catch (error) {
    console.error('[suppliers.service] Error updating supplier:', error)
    throw error
  }
}

export const deleteSupplier = async (id: string) => {
  console.log('[suppliers.service] Deleting supplier:', id)
  try {
    const supplierRef = doc(db, 'suppliers', id)
    await updateDoc(supplierRef, {
      active: false,
      updatedAt: new Date().toISOString()
    })
    console.log('[suppliers.service] Supplier deleted successfully')
  } catch (error) {
    console.error('[suppliers.service] Error deleting supplier:', error)
    throw error
  }
}