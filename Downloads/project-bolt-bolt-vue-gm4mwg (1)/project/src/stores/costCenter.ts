import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  CostCenter,
  CostType,
  getCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getCostTypes,
  createCostType,
  updateCostType,
  deleteCostType
} from '../firebase/services/costCenters.service'

export const useCostCenterStore = defineStore('costCenter', () => {
  const costCenters = ref<CostCenter[]>([])
  const costTypesByCenter = ref<Record<string, CostType[]>>({})
  const loading = ref(false)
  const error = ref('')

  async function fetchCostCenters() {
    try {
      loading.value = true
      const centers = await getCostCenters()
      costCenters.value = centers
      
      // Fetch types for each center
      for (const center of centers) {
        if (center.id) {
          await fetchCostTypesForCenter(center.id)
        }
      }
    } catch (e) {
      error.value = 'Error loading cost centers'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCostTypesForCenter(centerId: string) {
    try {
      const types = await getCostTypes(centerId)
      costTypesByCenter.value[centerId] = types
    } catch (e) {
      console.error(`Error loading cost types for center ${centerId}:`, e)
      costTypesByCenter.value[centerId] = []
    }
  }

  function getCostTypesForCenter(centerId: string): CostType[] {
    return costTypesByCenter.value[centerId] || []
  }

  async function addCostCenter(center: Omit<CostCenter, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const newCenter = await createCostCenter(center)
      costCenters.value.push(newCenter)
      costTypesByCenter.value[newCenter.id!] = []
      return true
    } catch (e) {
      error.value = 'Error adding cost center'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function addCostType(
    centerId: string, 
    type: Omit<CostType, 'id' | 'active' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      loading.value = true
      const newType = await createCostType(centerId, type)
      if (!costTypesByCenter.value[centerId]) {
        costTypesByCenter.value[centerId] = []
      }
      costTypesByCenter.value[centerId].push(newType)
      return true
    } catch (e) {
      error.value = 'Error adding cost type'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateCenterData(id: string, data: Partial<CostCenter>) {
    try {
      loading.value = true
      const updatedCenter = await updateCostCenter(id, data)
      const index = costCenters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        costCenters.value[index] = { ...costCenters.value[index], ...updatedCenter }
      }
      return true
    } catch (e) {
      error.value = 'Error updating cost center'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteCenterById(id: string) {
    try {
      loading.value = true
      await deleteCostCenter(id)
      await fetchCostCenters()
    } catch (e) {
      error.value = 'Error deleting cost center'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCostTypeById(centerId: string, typeId: string) {
    try {
      loading.value = true
      await deleteCostType(centerId, typeId)
      await fetchCostTypesForCenter(centerId)
    } catch (e) {
      error.value = 'Error deleting cost type'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCostCentersBySupplier(supplierId: string): Promise<CostCenter[]> {
    try {
      loading.value = true
      const centers = await getCostCenters()
      // Filtra os centros de custo relacionados ao fornecedor
      return centers.filter(center => center.supplierId === supplierId)
    } catch (e) {
      error.value = 'Error loading supplier cost centers'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchCostCentersByCustomer(customerId: string): Promise<CostCenter[]> {
    try {
      loading.value = true
      const centers = await getCostCenters()
      // Filtra os centros de custo relacionados ao cliente
      return centers.filter(center => center.customerId === customerId)
    } catch (e) {
      error.value = 'Error loading customer cost centers'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchCostTypesByCostCenter(costCenterId: string): Promise<CostType[]> {
    try {
      loading.value = true
      return await getCostTypes(costCenterId)
    } catch (e) {
      error.value = 'Error loading cost types'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    costCenters,
    loading,
    error,
    costTypesByCenter,
    fetchCostCenters,
    fetchCostTypesForCenter,
    getCostTypesForCenter,
    addCostCenter,
    addCostType,
    updateCenterData,
    deleteCenterById,
    deleteCostTypeById,
    fetchCostCentersBySupplier,
    fetchCostCentersByCustomer,
    fetchCostTypesByCostCenter
  }
})