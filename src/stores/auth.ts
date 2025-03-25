import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, db } from '../firebase/config';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  updateProfile
} from 'firebase/auth';
import { logger } from '../utils/logger';

interface UserData {
  id: string;
  role: string;
  status: string;
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
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
      logger.debug('Loading:', value);
    },

    async initAuth() {
      logger.debug('Auth: Iniciando autenticação...');
      if (this.initialized) {
        logger.debug('Auth: Autenticação já inicializada');
        return;
      }

      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          logger.debug('Auth: Estado de autenticação alterado:', user ? 'Usuário logado' : 'Usuário deslogado');
          
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                this.user = user;
                this.userData = {
                  id: userDoc.id,
                  ...userDoc.data()
                };
                logger.debug('Auth: Dados do usuário carregados:', {
                  uid: user.uid,
                  role: this.userData.role,
                  status: this.userData.status
                });
              }
            } catch (error) {
              logger.error('Auth: Erro ao carregar dados do usuário:', error);
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
        logger.error('Auth: Erro no login:', error);
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      logger.debug('Auth: Iniciando logout...');
      this.setLoading(true);
      try {
        await signOut(auth);
        this.user = null;
        this.userData = null;
        logger.debug('Auth: Logout realizado com sucesso');
        return { success: true };
      } catch (error: any) {
        logger.error('Auth: Erro no logout:', error);
        this.error = error.message;
        return { success: false, error: error.message };
      } finally {
        this.setLoading(false);
      }
    },

    async verifyPasswordResetCode(code: string) {
      try {
        await verifyPasswordResetCode(auth, code);
        return true;
      } catch (error) {
        logger.error('Auth: Erro ao verificar código de redefinição:', error);
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
        logger.error('Auth: Erro ao redefinir senha:', error);
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
        logger.error('Auth: Erro ao enviar email de redefinição de senha:', error);
        this.error = this.getErrorMessage(error.code);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async refreshUserData() {
      if (this.user?.uid) {
        try {
          logger.debug(`Auth: Carregando dados do usuário - ${this.user.email}`);
          const userDoc = await getDoc(doc(db, 'users', this.user.uid));
          if (userDoc.exists()) {
            this.userData = {
              id: userDoc.id,
              ...userDoc.data()
            } as UserData;
          }
        } catch (error) {
          logger.error('Auth: Erro ao atualizar dados do usuário:', error);
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
        logger.error('Auth: Erro ao atualizar foto do perfil:', error);
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