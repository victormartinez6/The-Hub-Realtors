import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  Profile,
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile
} from '../firebase/services/profiles.service'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchProfiles() {
    try {
      loading.value = true
      profiles.value = await getProfiles()
    } catch (e) {
      error.value = 'Error loading profiles'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function addProfile(profile: Omit<Profile, 'id' | 'active' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const newProfile = await createProfile(profile)
      profiles.value.push(newProfile)
      return true
    } catch (e) {
      error.value = 'Error adding profile'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateProfileData(id: string, data: Partial<Profile>) {
    try {
      loading.value = true
      const updatedProfile = await updateProfile(id, data)
      const index = profiles.value.findIndex(p => p.id === id)
      if (index !== -1) {
        profiles.value[index] = { ...profiles.value[index], ...updatedProfile }
      }
      return true
    } catch (e) {
      error.value = 'Error updating profile'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteProfileById(id: string) {
    try {
      loading.value = true
      await deleteProfile(id)
      profiles.value = profiles.value.filter(p => p.id !== id)
      return true
    } catch (e) {
      error.value = 'Error deleting profile'
      console.error(e)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    addProfile,
    updateProfile: updateProfileData,
    deleteProfile: deleteProfileById
  }
})