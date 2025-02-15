import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Customer, getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../firebase/services/customers.service'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchCustomers() {
    try {
      loading.value = true
      customers.value = await getCustomers()
    } catch (e) {
      error.value = 'Error loading customers'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addCustomer(customer: Omit<Customer, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const newCustomer = await createCustomer(customer)
      customers.value.push(newCustomer)
      return true
    } catch (e) {
      error.value = 'Error adding customer'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateCustomerData(id: string, customer: Partial<Customer>) {
    try {
      loading.value = true
      const updatedCustomer = await updateCustomer(id, customer)
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = { ...customers.value[index], ...updatedCustomer }
      }
      return true
    } catch (e) {
      error.value = 'Error updating customer'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteCustomerById(id: string) {
    try {
      loading.value = true
      await deleteCustomer(id)
      customers.value = customers.value.filter(c => c.id !== id)
      return true
    } catch (e) {
      error.value = 'Error deleting customer'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    addCustomer,
    updateCustomer: updateCustomerData,
    deleteCustomer: deleteCustomerById
  }
})