import { Account } from '../firebase/services/accounts.service'
import { usePaymentStatusStore } from '../stores/paymentStatus'
import { useAccountStore } from '../stores/account'
import { storeToRefs } from 'pinia'

export const determineInitialStatus = async () => {
  const paymentStatusStore = usePaymentStatusStore()
  await paymentStatusStore.fetchPaymentStatuses()
  const { paymentStatuses } = storeToRefs(paymentStatusStore)

  const pendingStatus = paymentStatuses.value.find(status => status.name.toLowerCase() === 'pendente')
  const scheduledStatus = paymentStatuses.value.find(status => status.name.toLowerCase() === 'programado')

  return (account: Partial<Account>) => {
    if (!account.dueDate) return pendingStatus?.id

    if (account.scheduledFor) {
      return scheduledStatus?.id
    }

    return pendingStatus?.id
  }
}

export const checkAndUpdateStatus = async () => {
  try {
    const accountStore = useAccountStore()
    const paymentStatusStore = usePaymentStatusStore()
    
    await Promise.all([
      accountStore.fetchAccounts(),
      paymentStatusStore.fetchPaymentStatuses()
    ])

    const { accounts } = storeToRefs(accountStore)
    const { paymentStatuses } = storeToRefs(paymentStatusStore)

    if (!paymentStatuses.value || paymentStatuses.value.length === 0) return

    const pendingStatus = paymentStatuses.value.find(status => status.name.toLowerCase() === 'pendente')
    const lateStatus = paymentStatuses.value.find(status => status.name.toLowerCase() === 'atrasado')
    const scheduledStatus = paymentStatuses.value.find(status => status.name.toLowerCase() === 'programado')
    const paidStatus = paymentStatuses.value.find(status => status.name.toLowerCase() === 'pago')

    if (!pendingStatus || !lateStatus || !scheduledStatus || !paidStatus) return

    const now = new Date()

    for (const account of accounts.value) {
      const currentStatus = paymentStatuses.value.find(status => status.id === account.statusId)
      if (!currentStatus) continue

      // Regra 1: Se status pendente e passou da data de vencimento, muda para atrasado
      if (currentStatus.name.toLowerCase() === 'pendente' && account.dueDate) {
        const dueDate = new Date(account.dueDate)
        if (dueDate < now) {
          await accountStore.updateAccountData(account.id!, { statusId: lateStatus.id })
        }
      }
      
      // Regra 2: Se status programado e passou da data programada, muda para pago
      else if (currentStatus.name.toLowerCase() === 'programado' && account.scheduledFor) {
        const scheduledDate = new Date(account.scheduledFor)
        if (scheduledDate < now) {
          await accountStore.updateAccountData(account.id!, { statusId: paidStatus.id })
        }
      }
    }
  } catch (error) {
    console.error('Error checking and updating status:', error)
  }
}
