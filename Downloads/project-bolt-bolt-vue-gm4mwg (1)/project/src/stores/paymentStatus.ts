import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase/config'
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore'

export const usePaymentStatusStore = defineStore('paymentStatus', () => {
  const paymentStatuses = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPaymentStatuses = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'paymentStatuses'), orderBy('name'))
      const querySnapshot = await getDocs(q)
      paymentStatuses.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err: any) {
      error.value = 'Erro ao carregar status de pagamento: ' + err.message
      console.error('Error fetching payment statuses:', err)
    } finally {
      loading.value = false
    }
  }

  const createPaymentStatus = async (status: any) => {
    loading.value = true
    error.value = null
    try {
      await addDoc(collection(db, 'paymentStatuses'), status)
      await fetchPaymentStatuses()
    } catch (err: any) {
      error.value = 'Erro ao criar status de pagamento: ' + err.message
      console.error('Error creating payment status:', err)
    } finally {
      loading.value = false
    }
  }

  const updatePaymentStatus = async (id: string, status: any) => {
    loading.value = true
    error.value = null
    try {
      const statusRef = doc(db, 'paymentStatuses', id)
      await updateDoc(statusRef, status)
      await fetchPaymentStatuses()
    } catch (err: any) {
      error.value = 'Erro ao atualizar status de pagamento: ' + err.message
      console.error('Error updating payment status:', err)
    } finally {
      loading.value = false
    }
  }

  const deletePaymentStatus = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const statusRef = doc(db, 'paymentStatuses', id)
      await deleteDoc(statusRef)
      await fetchPaymentStatuses()
    } catch (err: any) {
      error.value = 'Erro ao excluir status de pagamento: ' + err.message
      console.error('Error deleting payment status:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    paymentStatuses,
    loading,
    error,
    fetchPaymentStatuses,
    createPaymentStatus,
    updatePaymentStatus,
    deletePaymentStatus
  }
})
