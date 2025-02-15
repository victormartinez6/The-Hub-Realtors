import { collection, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { User, UserRole } from '../types/models';

const COLLECTION_NAME = 'users';
const usersCollection = collection(db, COLLECTION_NAME);

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(usersCollection, currentUser.uid));
    if (!userDoc.exists()) return null;

    return { uid: userDoc.id, ...userDoc.data() } as User;
  },

  async createUser(uid: string, userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      uid,
      ...userData,
      createdAt: now,
      updatedAt: now,
      active: true
    };

    await setDoc(doc(usersCollection, uid), newUser);
    return newUser;
  },

  async updateUser(uid: string, userData: Partial<User>): Promise<User> {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Usuário não encontrado');
    }

    const updatedData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(userRef, updatedData);
    return { uid, ...userDoc.data(), ...updatedData } as User;
  },

  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(usersCollection, uid));
  },

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const q = query(usersCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  },

  async getUsersByBroker(brokerId: string): Promise<User[]> {
    const q = query(usersCollection, where('brokerId', '==', brokerId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  },

  async getUsersByRole(role: string): Promise<User[]> {
    const q = query(
      usersCollection,
      where('role', '==', role),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  },

  async getUserBroker(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data() as User;
    if (!userData.brokerId) return null;

    const brokerDoc = await getDoc(doc(usersCollection, userData.brokerId));
    if (!brokerDoc.exists()) return null;

    return { uid: brokerDoc.id, ...brokerDoc.data() } as User;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return { uid: doc.id, ...doc.data() } as User;
  },
};
