import { defineStore } from 'pinia';
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  signOut
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'broker' | 'realtor' | 'partner';
  status: 'active' | 'inactive' | 'blocked';
  brokerId?: string;
  brokerName?: string;
  photoURL?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    users: [] as User[],
    brokers: [] as User[],
    usersByBroker: [] as User[],
    usersByRole: {
      realtor: [] as User[],
      partner: [] as User[]
    },
    loading: false,
    error: null as string | null
  }),

  getters: {
    partners: (state) => state.usersByRole.partner || [],
    realtors: (state) => state.usersByBroker || [],
    getBrokerRealtors: (state) => (brokerId: string) => {
      return state.users.filter(user => 
        user.role === 'realtor' && 
        user.brokerId === brokerId &&
        user.status === 'active'
      );
    }
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        
        this.users = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || null,
              updatedAt: data.updatedAt?.toDate?.() || null,
              lastLogin: data.lastLogin?.toDate?.() || null
            };
          })
          .filter(user => ['broker', 'realtor', 'partner'].includes(user.role))
          .sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
          }) as User[];

        logger.debug(`UserManagement: Usuários carregados: ${this.users.length}`);
      } catch (err) {
        logger.error('UserManagement: Erro ao buscar usuários:', err);
        this.error = 'Erro ao carregar usuários';
      } finally {
        this.loading = false;
      }
    },

    async fetchBrokers() {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('role', '==', 'broker'),
          where('status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(q);
        this.brokers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
      } catch (err) {
        logger.error('UserManagement: Erro ao buscar brokers:', err);
      }
    },

    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
      this.loading = true;
      this.error = null;
      try {
        // 1. Criar usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          Math.random().toString(36).slice(-8) // senha temporária
        );

        // 2. Fazer logout imediatamente para não ficar logado como o novo usuário
        await signOut(auth);

        // 3. Atualizar perfil do usuário
        await updateProfile(userCredential.user, {
          displayName: userData.displayName,
          photoURL: userData.photoURL
        });

        // 4. Criar documento do usuário no Firestore
        const userDoc = doc(db, 'users', userCredential.user.uid);
        
        const userDataToSave = {
          ...userData,
          id: userCredential.user.uid,
          uid: userCredential.user.uid,
          status: 'active',
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Garantir que os campos opcionais existam
          phone: userData.phone || null,
          countryCode: userData.countryCode || null,
          streetAddress: userData.streetAddress || null,
          unit: userData.unit || null,
          city: userData.city || null,
          state: userData.state || null,
          zipCode: userData.zipCode || null,
          photoURL: userData.photoURL || null,
          profilePicture: userData.profilePicture || null
        };
        
        await setDoc(userDoc, userDataToSave);

        // 5. Enviar email de redefinição de senha
        await sendPasswordResetEmail(auth, userData.email);

        // 6. Atualizar o estado local
        this.users.push(userDataToSave as User);
        
        return userDataToSave;
      } catch (error: any) {
        logger.error('UserManagement: Erro ao criar usuário:', error);
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('Este email já está em uso');
        }
        this.error = error.message || 'Erro ao criar usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(userId: string, userData: Partial<User>) {
      this.loading = true;
      this.error = null;
      try {
        const userDoc = doc(db, 'users', userId);
        
        await updateDoc(userDoc, {
          ...userData,
          updatedAt: serverTimestamp()
        });

        // Atualizar estado local
        await this.fetchUsers();
      } catch (err) {
        logger.error('UserManagement: Erro ao atualizar usuário:', err);
        this.error = 'Erro ao atualizar usuário';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async blockUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const userDoc = doc(db, 'users', userId);
        
        await updateDoc(userDoc, {
          status: 'blocked',
          updatedAt: serverTimestamp()
        });

        // Atualizar estado local
        await this.fetchUsers();
      } catch (err) {
        logger.error('UserManagement: Erro ao bloquear usuário:', err);
        this.error = 'Erro ao bloquear usuário';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async unblockUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const userDoc = doc(db, 'users', userId);
        
        await updateDoc(userDoc, {
          status: 'active',
          updatedAt: serverTimestamp()
        });

        // Atualizar estado local
        await this.fetchUsers();
      } catch (err) {
        logger.error('UserManagement: Erro ao desbloquear usuário:', err);
        this.error = 'Erro ao desbloquear usuário';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(email: string) {
      this.loading = true;
      this.error = null;
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (err) {
        logger.error('UserManagement: Erro ao enviar email de redefinição:', err);
        this.error = 'Erro ao enviar email de redefinição';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;
      try {
        // Se for um broker, primeiro verificar e deletar todos os corretores associados
        const user = this.users.find(u => u.id === userId);
        if (user?.role === 'broker') {
          const realtorsRef = collection(db, 'users');
          const q = query(realtorsRef, where('brokerId', '==', userId));
          const realtorsSnapshot = await getDocs(q);
          
          // Deletar todos os corretores do broker
          const deletePromises = realtorsSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        }

        // Deletar o usuário
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);

        // Atualizar o estado local
        this.users = this.users.filter(user => user.id !== userId);
      } catch (error: any) {
        logger.error('UserManagement: Erro ao deletar usuário:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBrokerRealtors(brokerId: string) {
      logger.debug(`UserManagement: Buscando realtors do broker ${brokerId}`);
      try {
        const querySnapshot = await getDocs(query(
          collection(db, 'users'),
          where('role', '==', 'realtor'),
          where('brokerId', '==', brokerId)
        ));

        const realtors = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null
        }));

        this.usersByBroker = realtors;
        logger.debug(`UserManagement: ${realtors.length} realtors encontrados`);
      } catch (error) {
        logger.error('UserManagement: Erro ao buscar realtors:', error);
        throw error;
      }
    },

    async fetchPartners() {
      this.loading = true;
      this.error = null;
      try {
        logger.debug('UserManagement: Buscando parceiros');
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('role', '==', 'partner'),
          where('status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(q);
        logger.debug('UserManagement: Parceiros encontrados:', querySnapshot.size);
        
        this.usersByRole.partner = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
          lastLogin: doc.data().lastLogin?.toDate?.() || null
        })) as User[];

        logger.debug('UserManagement: Lista de parceiros atualizada:', this.usersByRole.partner);
      } catch (err) {
        logger.error('UserManagement: Erro ao buscar parceiros:', err);
        this.error = 'Erro ao carregar parceiros';
      } finally {
        this.loading = false;
      }
    },

    async fetchUsersByBroker(brokerId: string) {
      this.loading = true;
      this.error = null;
      try {
        logger.debug(`UserManagement: Buscando realtors para o broker ${brokerId}`);
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('brokerId', '==', brokerId),
          where('role', '==', 'realtor')
          // Removido o filtro de status para mostrar todos os realtors
        );
        
        const querySnapshot = await getDocs(q);
        logger.debug('UserManagement: Query executada, documentos encontrados:', querySnapshot.size);
        
        // Log detalhado dos documentos encontrados
        querySnapshot.forEach((doc) => {
          logger.debug('UserManagement: Realtor encontrado:', {
            id: doc.id,
            ...doc.data()
          });
        });
        
        this.usersByBroker = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
          lastLogin: doc.data().lastLogin?.toDate?.() || null
        })) as User[];
        
        logger.debug('UserManagement: Realtors carregados com sucesso:', this.usersByBroker);
      } catch (err) {
        logger.error('UserManagement: Erro ao buscar realtors do broker:', err);
        this.error = 'Erro ao carregar realtors';
      } finally {
        this.loading = false;
      }
    },

    async fetchUsersByRole(role: 'realtor' | 'partner') {
      this.loading = true;
      this.error = null;
      try {
        logger.debug(`UserManagement: Buscando usuários com role ${role}`);
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('role', '==', role),
          where('status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(q);
        logger.debug(`UserManagement: Usuários encontrados: ${querySnapshot.size}`);
        
        this.usersByRole[role] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
          lastLogin: doc.data().lastLogin?.toDate?.() || null
        })) as User[];
      } catch (err) {
        logger.error(`UserManagement: Erro ao buscar usuários com role ${role}:`, err);
        this.error = `Erro ao carregar ${role}s`;
      } finally {
        this.loading = false;
      }
    },
  }
});
