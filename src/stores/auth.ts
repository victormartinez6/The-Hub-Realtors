import { defineStore } from 'pinia';
import { 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import router from '../router';

interface UserData {
  id: string;
  role: string;
  status: string;
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
    userData: null as UserData | null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.userData,
    isBroker: (state) => state.userData?.role === 'broker',
    isRealtor: (state) => state.userData?.role === 'realtor',
    isPartner: (state) => state.userData?.role === 'partner',
    isAdmin: (state) => state.userData?.role === 'super_admin',
    currentUser: (state) => state.user,
    userRole: (state) => state.userData?.role
  },

  actions: {
    setLoading(value: boolean) {
      this.loading = value;
      console.log('Loading:', value);
    },

    async initAuth() {
      console.log('Iniciando autenticação...');
      if (this.initialized) {
        console.log('Autenticação já inicializada');
        return;
      }

      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Estado de autenticação alterado:', user ? 'Usuário logado' : 'Usuário deslogado');
          
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                this.user = user;
                this.userData = {
                  id: userDoc.id,
                  ...userDoc.data()
                };
                console.log('Dados do usuário carregados:', {
                  uid: user.uid,
                  role: this.userData.role,
                  status: this.userData.status
                });
              }
            } catch (error) {
              console.error('Erro ao carregar dados do usuário:', error);
              this.user = null;
              this.userData = null;
            }
          } else {
            this.user = null;
            this.userData = null;
          }
          
          this.initialized = true;
          resolve(true);
          unsubscribe();
        });
      });
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        // 1. Fazer login no Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        // 2. Buscar dados adicionais do usuário no Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (!userDoc.exists()) {
          throw new Error('Usuário não encontrado no banco de dados');
        }

        // 3. Atualizar dados do usuário
        this.userData = {
          id: userDoc.id,
          ...userDoc.data()
        };

        // 4. Verificar se está bloqueado
        if (this.userData.status === 'blocked') {
          await this.logout();
          throw new Error('Sua conta está bloqueada. Entre em contato com o administrador.');
        }

        // 5. Retornar sucesso e papel para o componente fazer o redirecionamento
        return {
          success: true,
          role: this.userData.role
        };

      } catch (error: any) {
        console.error('Erro no login:', error);
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      console.log('Iniciando logout...');
      this.setLoading(true);
      try {
        await signOut(auth);
        this.user = null;
        this.userData = null;
        router.push('/login');
        console.log('Logout realizado com sucesso');
      } catch (error: any) {
        console.error('Erro no logout:', error);
        this.error = error.message;
      } finally {
        this.setLoading(false);
      }
    },

    async verifyPasswordResetCode(code: string) {
      try {
        await verifyPasswordResetCode(auth, code);
        return true;
      } catch (error) {
        console.error('Erro ao verificar código de redefinição:', error);
        throw error;
      }
    },

    async resetPassword(code: string, newPassword: string) {
      this.loading = true;
      this.error = null;
      try {
        await confirmPasswordReset(auth, code, newPassword);
        return true;
      } catch (error: any) {
        console.error('Erro ao redefinir senha:', error);
        this.error = this.getErrorMessage(error.code) || 'Erro ao redefinir senha';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async sendPasswordResetEmail(email: string) {
      this.loading = true;
      this.error = null;
      try {
        await firebaseSendPasswordResetEmail(auth, email);
      } catch (error: any) {
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refreshUserData() {
      if (this.user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', this.user.uid));
          if (userDoc.exists()) {
            this.userData = {
              id: userDoc.id,
              ...userDoc.data()
            } as UserData;
          }
        } catch (error) {
          console.error('Erro ao atualizar dados do usuário:', error);
        }
      }
    },

    async updateUserPhoto(photoURL: string) {
      if (!this.user) return;
      
      try {
        // Atualiza o perfil no Firebase Auth
        await updateProfile(this.user, { photoURL });
        
        // Atualiza o documento do usuário no Firestore
        await updateDoc(doc(db, 'users', this.user.uid), {
          photoURL
        });
        
        // Atualiza o estado local
        this.user = { ...this.user, photoURL };
        if (this.userData) {
          this.userData = { ...this.userData, photoURL };
        }
        
        return true;
      } catch (error) {
        console.error('Erro ao atualizar foto do perfil:', error);
        throw error;
      }
    },

    getErrorMessage(code: string): string {
      const messages: { [key: string]: string } = {
        'auth/user-not-found': 'Não encontramos uma conta com este email.',
        'auth/invalid-email': 'O email fornecido é inválido.',
        'auth/expired-action-code': 'O link de redefinição de senha expirou. Por favor, solicite um novo.',
        'auth/invalid-action-code': 'O link de redefinição de senha é inválido ou já foi usado.',
        'auth/weak-password': 'A senha deve ter pelo menos 8 caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.',
        'default': 'Ocorreu um erro. Por favor, tente novamente.'
      };
      return messages[code] || messages['default'];
    },
  }
});