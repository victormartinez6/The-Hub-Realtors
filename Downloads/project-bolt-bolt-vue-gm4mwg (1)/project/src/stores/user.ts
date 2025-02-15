import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUsers, updateUser, deleteUser } from '../firebase/services/users.service'
import { createUser } from '../firebase/services/auth.service'

export const useUserStore = defineStore('user', () => {
  const users = ref<any[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchUsers() {
    try {
      loading.value = true
      users.value = await getUsers()
    } catch (e) {
      error.value = 'Error loading users'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addUser(userData: any, password: string) {
    try {
      loading.value = true
      await createUser({
        ...userData,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, password)
      await fetchUsers()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error creating user'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateUserData(id: string, data: any) {
    try {
      loading.value = true
      await updateUser(id, {
        ...data,
        updatedAt: new Date().toISOString()
      })
      await fetchUsers()
      return true
    } catch (e) {
      error.value = 'Error updating user'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteUserById(id: string) {
    try {
      loading.value = true
      await deleteUser(id)
      await fetchUsers()
      return true
    } catch (e) {
      error.value = 'Error deleting user'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser: updateUserData,
    deleteUser: deleteUserById
  }
})