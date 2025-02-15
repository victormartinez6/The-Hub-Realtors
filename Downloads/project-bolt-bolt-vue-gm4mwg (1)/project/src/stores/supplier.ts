import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Supplier, getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../firebase/services/suppliers.service'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSuppliers() {
    console.log('[SupplierStore] Fetching suppliers...')
    try {
      loading.value = true
      error.value = null
      const result = await getSuppliers()
      console.log('[SupplierStore] Suppliers fetched:', result)
      suppliers.value = result || [] // Ensure we always have an array
      console.log('[SupplierStore] Store updated:', suppliers.value)
    } catch (e: any) {
      console.error('[SupplierStore] Error fetching suppliers:', e)
      error.value = 'Erro ao carregar fornecedores. Por favor, tente novamente.'
      suppliers.value = [] // Reset to empty array on error
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addSupplier(supplier: Omit<Supplier, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    console.log('[SupplierStore] Adding supplier:', supplier)
    try {
      loading.value = true
      error.value = null
      const newSupplier = await createSupplier(supplier)
      console.log('[SupplierStore] Supplier created:', newSupplier)
      suppliers.value = [...(suppliers.value || []), newSupplier] // Ensure we have an array before spreading
      console.log('[SupplierStore] Store updated:', suppliers.value)
      return true
    } catch (e: any) {
      console.error('[SupplierStore] Error adding supplier:', e)
      error.value = 'Erro ao adicionar fornecedor. Por favor, tente novamente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateSupplierData(id: string, supplier: Partial<Supplier>) {
    console.log('[SupplierStore] Updating supplier:', id, supplier)
    try {
      loading.value = true
      error.value = null
      const updatedSupplier = await updateSupplier(id, supplier)
      console.log('[SupplierStore] Supplier updated:', updatedSupplier)
      const index = (suppliers.value || []).findIndex(s => s.id === id)
      if (index !== -1) {
        suppliers.value = [
          ...(suppliers.value || []),
          { ...((suppliers.value || [])[index]), ...updatedSupplier },
          ...(suppliers.value || []).slice(index + 1)
        ]
        console.log('[SupplierStore] Store updated:', suppliers.value)
      }
      return true
    } catch (e: any) {
      console.error('[SupplierStore] Error updating supplier:', e)
      error.value = 'Erro ao atualizar fornecedor. Por favor, tente novamente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteSupplierById(id: string) {
    console.log('[SupplierStore] Deleting supplier:', id)
    try {
      loading.value = true
      error.value = null
      await deleteSupplier(id)
      console.log('[SupplierStore] Supplier deleted:', id)
      suppliers.value = (suppliers.value || []).filter(s => s.id !== id)
      console.log('[SupplierStore] Store updated:', suppliers.value)
      return true
    } catch (e: any) {
      console.error('[SupplierStore] Error deleting supplier:', e)
      error.value = 'Erro ao excluir fornecedor. Por favor, tente novamente.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    addSupplier,
    updateSupplier: updateSupplierData,
    deleteSupplier: deleteSupplierById
  }
})