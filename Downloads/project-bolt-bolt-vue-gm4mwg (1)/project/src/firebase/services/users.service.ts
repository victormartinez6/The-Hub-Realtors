import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore'
import { db } from '../config'
import { UserData } from './auth.service'

export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export const getUserById = async (id: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', id))
    if (!userDoc.exists()) {
      throw new Error('User not found')
    }
    return {
      id: userDoc.id,
      ...userDoc.data()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export const updateUser = async (id: string, data: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', id)
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return await getUserById(id)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export const deleteUser = async (id: string) => {
  try {
    const userRef = doc(db, 'users', id)
    await updateDoc(userRef, {
      active: false,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}