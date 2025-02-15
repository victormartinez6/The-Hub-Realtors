import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp,
  deleteDoc,
  getDoc
} from 'firebase/firestore'
import { db } from '../config'
import { getAuth } from 'firebase/auth'

export interface Account {
  id?: string
  description: string
  type: 'payable' | 'receivable'
  amount: number
  dueDate: string
  scheduledFor?: string
  costCenterId: string
  costTypeId: string
  statusId: string
  userId: string
  supplierId?: string // ID do fornecedor (apenas para contas a pagar)
  customerId?: string // ID do cliente (apenas para contas a receber)
  active: boolean
  createdAt: string
  updatedAt: string
}

export const getAccounts = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      console.error('[Accounts Service] Usuário não encontrado')
      throw new Error('Usuário não autenticado')
    }

    console.log('[Accounts Service] Buscando contas para usuário:', user.uid)
    const accountsRef = collection(db, 'accounts')
    const q = query(
      accountsRef,
      where('active', '==', true),
      where('userId', '==', user.uid)
    )
    
    console.log('[Accounts Service] Executando query...')
    const snapshot = await getDocs(q)
    console.log('[Accounts Service] Query executada, documentos encontrados:', snapshot.size)
    
    const accounts = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('[Accounts Service] Processando documento:', doc.id, data)
      
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString?.() || data.date,
        dueDate: data.dueDate?.toDate?.()?.toISOString?.() || data.dueDate,
        scheduledFor: data.scheduledFor?.toDate?.()?.toISOString?.() || data.scheduledFor,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt
      }
    }) as Account[]

    console.log('[Accounts Service] Retornando contas processadas:', accounts.length)
    return accounts
  } catch (error) {
    console.error('[Accounts Service] Erro ao buscar contas:', error)
    throw error
  }
}

export const createAccount = async (data: Omit<Account, 'id' | 'active' | 'createdAt' | 'updatedAt' | 'userId' | 'statusId'>) => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('[Accounts Service] Criando nova conta:', data)
    const accountsRef = collection(db, 'accounts')

    // Validação adicional para fornecedor/cliente
    if (data.type === 'payable' && !data.supplierId) {
      throw new Error('Fornecedor é obrigatório para contas a pagar')
    }
    if (data.type === 'receivable' && !data.customerId) {
      throw new Error('Cliente é obrigatório para contas a receber')
    }

    // Garante que as datas estão no formato correto
    const dueDate = data.dueDate ? new Date(data.dueDate) : null
    const scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null
    const now = new Date()

    const accountData = {
      ...data,
      dueDate: dueDate?.toISOString() || '',
      scheduledFor: scheduledFor?.toISOString() || '',
      active: true,
      userId: user.uid,
      statusId: data.scheduledFor ? 'scheduled' : 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    console.log('[Accounts Service] Dados processados:', accountData)
    const docRef = await addDoc(accountsRef, accountData)
    console.log('[Accounts Service] Conta criada com sucesso:', docRef.id)

    return {
      id: docRef.id,
      ...accountData
    }
  } catch (error) {
    console.error('[Accounts Service] Erro ao criar conta:', error)
    throw error
  }
}

export const updateAccount = async (id: string, accountData: Partial<Account>): Promise<void> => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const accountRef = doc(db, 'accounts', id)
    
    // Primeiro, obtém a conta atual
    const accountDoc = await getDoc(accountRef)
    if (!accountDoc.exists()) {
      throw new Error('Conta não encontrada')
    }

    const currentAccount = accountDoc.data() as Account
    if (currentAccount.userId !== user.uid) {
      throw new Error('Sem permissão para atualizar esta conta')
    }

    // Combina os dados existentes com as atualizações
    const updatedAccount = {
      ...currentAccount,
      ...accountData,
      updatedAt: new Date().toISOString()
    }

    // Remove campos undefined ou null
    Object.keys(updatedAccount).forEach(key => {
      if (updatedAccount[key] === undefined || updatedAccount[key] === null) {
        delete updatedAccount[key]
      }
    })

    await updateDoc(accountRef, updatedAccount)
    console.log('Conta atualizada com sucesso:', id)
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
    throw error
  }
}

export const deleteAccount = async (id: string) => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('[Account Service] Excluindo conta:', id)
    const accountRef = doc(db, 'accounts', id)
    
    // Verificar se a conta pertence ao usuário
    const docSnap = await getDoc(accountRef)
    if (!docSnap.exists()) {
      throw new Error('Conta não encontrada')
    }
    
    const accountData = docSnap.data()
    if (accountData.userId !== user.uid) {
      throw new Error('Sem permissão para excluir esta conta')
    }

    await updateDoc(accountRef, { 
      active: false,
      updatedAt: new Date().toISOString()
    })
    console.log('[Account Service] Conta excluída com sucesso')
  } catch (error) {
    console.error('[Account Service] Erro ao excluir conta:', error)
    throw error
  }
}