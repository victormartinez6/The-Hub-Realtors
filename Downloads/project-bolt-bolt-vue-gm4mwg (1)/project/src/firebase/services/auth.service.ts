import { auth } from '../config'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../config'

export interface UserData {
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  document: string
}

export const createUser = async (userData: UserData, password: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password)
  
  // Set role as admin if it's the first user
  const usersSnapshot = await getDoc(doc(db, 'users', 'count'))
  const isFirstUser = !usersSnapshot.exists()
  
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    ...userData,
    role: isFirstUser ? 'admin' : userData.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  })

  // Update user count
  await setDoc(doc(db, 'users', 'count'), {
    total: (usersSnapshot.exists() ? usersSnapshot.data().total : 0) + 1
  })

  return userCredential
}

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
  
  if (!userDoc.exists()) {
    throw new Error('User data not found')
  }

  const userData = userDoc.data() as UserData
  if (!userData.active) {
    throw new Error('User is inactive')
  }

  return {
    user: {
      ...userData,
      id: userCredential.user.uid
    },
    token: await userCredential.user.getIdToken()
  }
}

export const signOut = () => firebaseSignOut(auth)