import { ref, Ref } from 'vue'

interface CrudItem {
  id: number | string
  [key: string]: any
}

export function useCrud<T extends CrudItem>(initialItems: T[] = []) {
  const items = ref<T[]>(initialItems) as Ref<T[]>
  const editingItem = ref<T | null>(null)
  const showEditModal = ref(false)

  const addItem = (item: Omit<T, 'id'>) => {
    const newId = typeof items.value[0]?.id === 'number' 
      ? Math.max(0, ...items.value.map(i => Number(i.id))) + 1
      : String(items.value.length + 1)

    const newItem = {
      id: newId,
      ...item
    } as T

    items.value.push(newItem)
    return newItem
  }

  const updateItem = (id: number | string, updates: Partial<T>) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
      return items.value[index]
    }
    return null
  }

  const deleteItem = (id: number | string) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      return true
    }
    return false
  }

  const startEditing = (item: T) => {
    editingItem.value = { ...item }
    showEditModal.value = true
  }

  const cancelEditing = () => {
    editingItem.value = null
    showEditModal.value = false
  }

  const confirmDelete = (id: number | string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (confirm('Tem certeza que deseja excluir este item?')) {
        const success = deleteItem(id)
        resolve(success)
      } else {
        resolve(false)
      }
    })
  }

  return {
    items,
    editingItem,
    showEditModal,
    addItem,
    updateItem,
    deleteItem,
    startEditing,
    cancelEditing,
    confirmDelete
  }
}