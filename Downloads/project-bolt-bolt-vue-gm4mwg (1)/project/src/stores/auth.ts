import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { UserData } from '../firebase/services/auth.service'

interface UserProfile {
  name: string
  email: string
  phone?: string
  position?: string
}

interface PasswordUpdate {
  currentPassword: string
  newPassword: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userData = ref<UserData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => userData.value)

  // Função para carregar dados do usuário
  const loadUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        userData.value = userDoc.data() as UserData
        console.log('[Auth Store] Dados do usuário carregados:', {
          role: userData.value.role,
          name: userData.value.name
        })
      } else {
        console.error('[Auth Store] Dados do usuário não encontrados')
        userData.value = null
      }
    } catch (e) {
      console.error('[Auth Store] Erro ao carregar dados do usuário:', e)
      userData.value = null
    }
  }

  // Initialize auth state listener
  console.log('[Auth Store] Configurando listener de autenticação...')
  onAuthStateChanged(auth, async (newUser) => {
    console.log('[Auth Store] Estado de autenticação alterado:', {
      userId: newUser?.uid,
      email: newUser?.email
    })
    
    user.value = newUser
    
    if (newUser) {
      await loadUserData(newUser.uid)
    } else {
      userData.value = null
    }
    
    loading.value = false
  }, (error) => {
    console.error('[Auth Store] Erro no listener de autenticação:', error)
    loading.value = false
  })

  // Actions
  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth Store] Tentando login:', { email })
      loading.value = true
      error.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      await loadUserData(userCredential.user.uid)
      
      console.log('[Auth Store] Login realizado com sucesso:', {
        userId: user.value.uid,
        email: user.value.email,
        role: userData.value?.role
      })
      
      return true
    } catch (e) {
      console.error('[Auth Store] Erro no login:', e)
      error.value = e instanceof Error ? e.message : 'Erro desconhecido no login'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      console.log('[Auth Store] Iniciando logout...')
      loading.value = true
      error.value = null
      
      await signOut(auth)
      user.value = null
      userData.value = null
      
      console.log('[Auth Store] Logout realizado com sucesso')
      return true
    } catch (e) {
      console.error('[Auth Store] Erro no logout:', e)
      error.value = e instanceof Error ? e.message : 'Erro desconhecido no logout'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar dados do usuário no state
      if (userData.value) {
        userData.value = {
          ...userData.value,
          ...profile
        }
      }

      // Em um caso real, você faria uma chamada à API aqui
      // await api.put('/user/profile', profile)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  const updatePassword = async (data: PasswordUpdate) => {
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em um caso real, você faria uma chamada à API aqui
      // await api.put('/user/password', data)
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      throw error
    }
  }

  return {
    // State
    user,
    userData,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    currentUser,
    
    // Actions
    login,
    logout,
    updateUserProfile,
    updatePassword
  }
})