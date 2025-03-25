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
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
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
  profilePicture?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Campos adicionais
  countryCode?: string;
  streetAddress?: string;
  unit?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    users: [] as User[],
    brokers: [] as User[],
    usersByBroker: [] as User[],
    usersByRole: {
      realtor: [] as User[],
      partner: [] as User[],
      broker: [] as User[]
    },
    partners: [] as User[], // adicionado partners como um estado
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
      // Se já estiver carregando, não inicia outra requisição
      if (this.loading) {
        logger.debug('UserManagement: Já existe um carregamento de usuários em andamento');
        return;
      }
      
      this.loading = true;
      this.error = null;
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        
        // Array temporário para armazenar usuários processados
        const processedUsers: User[] = [];
        
        // Processa cada documento
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Verifica se o usuário tem um papel válido
          if (['broker', 'realtor', 'partner'].includes(data.role)) {
            // Cria um objeto User com valores padrão para campos obrigatórios
            const user: User = {
              id: doc.id,
              email: data.email || '',
              displayName: data.displayName || '',
              role: (data.role as 'broker' | 'realtor' | 'partner') || 'partner',
              status: (data.status as 'active' | 'inactive' | 'blocked') || 'active',
              photoURL: data.photoURL || undefined,
              profilePicture: data.profilePicture || undefined,
              phone: data.phone || undefined,
              brokerId: data.brokerId || undefined,
              brokerName: data.brokerName || undefined,
              lastLogin: data.lastLogin?.toDate?.() || undefined,
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date()
            };
            processedUsers.push(user);
          }
        });
        
        // Ordena os usuários por data de criação (mais recentes primeiro)
        processedUsers.sort((a, b) => {
          const dateA = a.createdAt?.getTime() || 0;
          const dateB = b.createdAt?.getTime() || 0;
          return dateB - dateA;
        });
        
        // Atribui ao estado
        this.users = processedUsers;
        
        logger.debug(`UserManagement: Usuários carregados: ${this.users.length}`);
        
        // Verificamos se todos os usuários têm as propriedades necessárias
        this.users.forEach(user => {
          if (!user.displayName) {
            logger.warn(`UserManagement: Usuário ${user.id} não tem displayName`);
          }
          logger.debug(`UserManagement: Usuário ${user.id}, nome: ${user.displayName}, foto: ${user.photoURL || user.profilePicture || 'sem foto'}`);
        });
      } catch (err) {
        logger.error('UserManagement: Erro ao buscar usuários:', err);
        this.error = 'Erro ao carregar usuários';
      } finally {
        this.loading = false;
      }
    },

    async fetchBrokers() {
      this.loading = true;
      this.error = null;
      try {
        logger.debug('UserManagement: Buscando brokers');
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('role', '==', 'broker'),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        
        // Array temporário para armazenar brokers processados
        const brokers: User[] = [];
        
        // Processa cada documento
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Cria um objeto User com valores padrão para campos obrigatórios
          const user: User = {
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            role: 'broker',
            status: 'active',
            photoURL: data.photoURL || undefined,
            profilePicture: data.profilePicture || undefined,
            phone: data.phone || undefined,
            lastLogin: data.lastLogin?.toDate?.() || undefined,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
          brokers.push(user);
        });
        
        this.usersByRole.broker = brokers;
        logger.debug(`UserManagement: ${brokers.length} brokers encontrados`);
      } catch (error) {
        logger.error('UserManagement: Erro ao buscar brokers:', error);
        this.error = 'Erro ao carregar brokers';
      } finally {
        this.loading = false;
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
        const userWithDates: User = {
          ...userDataToSave,
          createdAt: new Date(),
          updatedAt: new Date()
        } as User;
        
        this.users.push(userWithDates);
        
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

    async fetchRealtors() {
      this.loading = true;
      this.error = null;
      try {
        logger.debug('UserManagement: Buscando realtors');
        const usersCollection = collection(db, 'users');
        const q = query(
          usersCollection,
          where('role', '==', 'realtor'),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        
        // Array temporário para armazenar realtors processados
        const realtors: User[] = [];
        
        // Processa cada documento
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Cria um objeto User com valores padrão para campos obrigatórios
          const user: User = {
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            role: 'realtor',
            status: 'active',
            photoURL: data.photoURL || undefined,
            profilePicture: data.profilePicture || undefined,
            phone: data.phone || undefined,
            brokerId: data.brokerId || undefined,
            brokerName: data.brokerName || undefined,
            lastLogin: data.lastLogin?.toDate?.() || undefined,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
          realtors.push(user);
        });
        
        this.usersByRole.realtor = realtors;
        logger.debug(`UserManagement: ${realtors.length} realtors encontrados`);
      } catch (error) {
        logger.error('UserManagement: Erro ao buscar realtors:', error);
        this.error = 'Erro ao carregar realtors';
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

        // Array temporário para armazenar realtors processados
        const realtors: User[] = [];
        
        // Processa cada documento
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Cria um objeto User com valores padrão para campos obrigatórios
          const user: User = {
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            role: 'realtor',
            status: (data.status as 'active' | 'inactive' | 'blocked') || 'active',
            photoURL: data.photoURL || undefined,
            profilePicture: data.profilePicture || undefined,
            phone: data.phone || undefined,
            brokerId: data.brokerId || undefined,
            brokerName: data.brokerName || undefined,
            lastLogin: data.lastLogin?.toDate?.() || undefined,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
          realtors.push(user);
        });

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
        
        // Array temporário para armazenar parceiros processados
        const partners: User[] = [];
        
        // Processa cada documento
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Cria um objeto User com valores padrão para campos obrigatórios
          const user: User = {
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            role: 'partner',
            status: 'active',
            photoURL: data.photoURL || undefined,
            profilePicture: data.profilePicture || undefined,
            phone: data.phone || undefined,
            brokerId: data.brokerId || undefined,
            brokerName: data.brokerName || undefined,
            lastLogin: data.lastLogin?.toDate?.() || undefined,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
          partners.push(user);
        });
        
        this.partners = partners;
        logger.debug(`UserManagement: ${partners.length} parceiros encontrados`);
      } catch (error) {
        logger.error('UserManagement: Erro ao buscar parceiros:', error);
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

    async fetchUserById(userId: string): Promise<User | null> {
      try {
        logger.debug(`UserManagement: Buscando usuário pelo ID ${userId}`);
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          logger.warn(`UserManagement: Usuário com ID ${userId} não encontrado`);
          return null;
        }
        
        const data = userDoc.data();
        
        // Cria um objeto User com valores padrão para campos obrigatórios
        const user: User = {
          id: userDoc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: (data.role as 'broker' | 'realtor' | 'partner') || 'partner',
          status: (data.status as 'active' | 'inactive' | 'blocked') || 'active',
          photoURL: data.photoURL || undefined,
          profilePicture: data.profilePicture || undefined,
          phone: data.phone || undefined,
          brokerId: data.brokerId || undefined,
          brokerName: data.brokerName || undefined,
          countryCode: data.countryCode || undefined,
          streetAddress: data.streetAddress || undefined,
          unit: data.unit || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          zipCode: data.zipCode || undefined,
          lastLogin: data.lastLogin?.toDate?.() || undefined,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
        
        // Adiciona o usuário à lista de usuários se ainda não estiver lá
        const existingUserIndex = this.users.findIndex(u => u.id === userId);
        if (existingUserIndex >= 0) {
          this.users[existingUserIndex] = user;
        } else {
          this.users.push(user);
        }
        
        logger.debug(`UserManagement: Usuário ${userId} encontrado: ${user.displayName}`);
        return user;
      } catch (error) {
        logger.error(`UserManagement: Erro ao buscar usuário ${userId}:`, error);
        return null;
      }
    },
  }
});
