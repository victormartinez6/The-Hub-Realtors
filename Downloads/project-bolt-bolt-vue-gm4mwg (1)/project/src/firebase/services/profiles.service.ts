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

export interface Profile {
  id?: string
  name: string
  description: string
  permissions: {
    [key: string]: boolean
  }
  color: string
  icon: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export const getProfiles = async () => {
  const profilesRef = collection(db, 'profiles')
  const q = query(profilesRef, where('active', '==', true))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Profile[]
}

export const createProfile = async (data: Omit<Profile, 'id' | 'active' | 'createdAt' | 'updatedAt'>) => {
  const profilesRef = collection(db, 'profiles')
  const now = new Date().toISOString()
  
  const docRef = await addDoc(profilesRef, {
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

export const updateProfile = async (id: string, data: Partial<Profile>) => {
  const profileRef = doc(db, 'profiles', id)
  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  await updateDoc(profileRef, updates)
  return { id, ...updates }
}

export const deleteProfile = async (id: string) => {
  const profileRef = doc(db, 'profiles', id)
  await updateDoc(profileRef, {
    active: false,
    updatedAt: new Date().toISOString()
  })
}