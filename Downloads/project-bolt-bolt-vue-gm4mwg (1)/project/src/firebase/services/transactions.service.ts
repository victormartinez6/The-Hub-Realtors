import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore'
import { db } from '../config'
import { getAuth } from 'firebase/auth'

export interface Transaction {
  id: string
  description: string
  type: 'income' | 'expense'
  amount: number
  date: string
  status: 'pending' | 'completed'
  category?: string
  notes?: string
  attachments?: string[]
  bankId?: string
  costCenterId?: string
  supplierId?: string
  customerId?: string
  userId: string
  createdAt: string
  updatedAt: string
  active: boolean
}

export const getTransactions = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      console.error('[Transactions Service] Usuário não encontrado')
      throw new Error('Usuário não autenticado')
    }

    console.log('[Transactions Service] Buscando transações para usuário:', user.uid)
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef,
      where('active', '==', true),
      where('userId', '==', user.uid)
    )
    
    console.log('[Transactions Service] Executando query...')
    const snapshot = await getDocs(q)
    console.log('[Transactions Service] Query executada, documentos encontrados:', snapshot.size)
    
    const transactions = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('[Transactions Service] Processando documento:', doc.id, data)
      
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString?.() || data.date,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt
      }
    }) as Transaction[]

    console.log('[Transactions Service] Retornando transações processadas:', transactions.length)
    return transactions
  } catch (error) {
    console.error('[Transactions Service] Erro ao buscar transações:', error)
    throw error
  }
}

export const createTransaction = async (data: Omit<Transaction, 'id' | 'active' | 'createdAt' | 'updatedAt' | 'userId'>) => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('[Transactions Service] Criando nova transação:', data)
    const transactionsRef = collection(db, 'transactions')

    // Garante que a data está no formato correto
    const transactionDate = data.date ? new Date(data.date) : new Date()
    const now = new Date()

    const transactionData = {
      ...data,
      date: transactionDate.toISOString(),
      active: true,
      userId: user.uid,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    console.log('[Transactions Service] Dados processados:', transactionData)
    const docRef = await addDoc(transactionsRef, transactionData)
    console.log('[Transactions Service] Transação criada com sucesso:', docRef.id)

    return {
      id: docRef.id,
      ...transactionData
    }
  } catch (error) {
    console.error('[Transactions Service] Erro ao criar transação:', error)
    throw error
  }
}

export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<void> => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const transactionRef = doc(db, 'transactions', id)
    
    // Primeiro, obtém a transação atual
    const transactionDoc = await getDoc(transactionRef)
    if (!transactionDoc.exists()) {
      throw new Error('Transação não encontrada')
    }

    const currentTransaction = transactionDoc.data() as Transaction
    if (currentTransaction.userId !== user.uid) {
      throw new Error('Sem permissão para atualizar esta transação')
    }

    // Combina os dados existentes com as atualizações
    const updatedTransaction = {
      ...currentTransaction,
      ...transactionData,
      updatedAt: new Date().toISOString()
    }

    // Remove campos undefined ou null
    Object.keys(updatedTransaction).forEach(key => {
      if (updatedTransaction[key] === undefined || updatedTransaction[key] === null) {
        delete updatedTransaction[key]
      }
    })

    await updateDoc(transactionRef, updatedTransaction)
    console.log('Transação atualizada com sucesso:', id)
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    throw error
  }
}

export const deleteTransaction = async (id: string) => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('[Transactions Service] Excluindo transação:', id)
    const transactionRef = doc(db, 'transactions', id)
    
    // Verificar se a transação pertence ao usuário
    const docSnap = await getDoc(transactionRef)
    if (!docSnap.exists()) {
      throw new Error('Transação não encontrada')
    }
    
    const transactionData = docSnap.data()
    if (transactionData.userId !== user.uid) {
      throw new Error('Sem permissão para excluir esta transação')
    }

    await updateDoc(transactionRef, { 
      active: false,
      updatedAt: new Date().toISOString()
    })
    console.log('[Transactions Service] Transação excluída com sucesso')
  } catch (error) {
    console.error('[Transactions Service] Erro ao excluir transação:', error)
    throw error
  }
}
