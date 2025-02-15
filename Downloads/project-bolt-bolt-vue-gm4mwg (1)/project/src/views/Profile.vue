<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProfileStore } from '../stores/profile'
import NewProfileModal from '../components/profile/NewProfileModal.vue'
import ConfirmDialog from '../components/common/ConfirmDialog.vue'

const profileStore = useProfileStore()
const showNewProfileModal = ref(false)
const showConfirmDelete = ref(false)
const profileToDelete = ref<string | null>(null)

onMounted(() => {
  profileStore.fetchProfiles()
})

const confirmDelete = (id: string) => {
  profileToDelete.value = id
  showConfirmDelete.value = true
}

const handleDelete = async () => {
  if (profileToDelete.value) {
    await profileStore.deleteProfile(profileToDelete.value)
    showConfirmDelete.value = false
    profileToDelete.value = null
  }
}

const getColorClasses = (color: string) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  }
  return colors[color as keyof typeof colors]
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">Perfis de Acesso</h1>
        <p class="text-gray-600">Gerencie os perfis de acesso do sistema</p>
      </div>
      <button
        @click="showNewProfileModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Novo Perfil
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="profileStore.loading" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="profileStore.error" class="text-center py-8 text-red-600">
      {{ profileStore.error }}
    </div>

    <!-- Profiles Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="profile in profileStore.profiles"
        :key="profile.id"
        class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
              getColorClasses(profile.color)
            ]">
              <i :class="['pi', profile.icon, 'text-xl']"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg">{{ profile.name }}</h3>
              <p class="text-sm text-gray-600">{{ profile.description }}</p>
            </div>
          </div>
          <button
            @click="confirmDelete(profile.id!)"
            class="text-red-600 hover:text-red-900"
          >
            <i class="pi pi-trash"></i>
          </button>
        </div>

        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Permissões:</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(value, key) in profile.permissions"
              :key="key"
              :class="[
                'px-2 py-1 text-xs rounded-full',
                value ? getColorClasses(profile.color) : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ key }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- New Profile Modal -->
    <NewProfileModal
      :show="showNewProfileModal"
      @close="showNewProfileModal = false"
    />

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showConfirmDelete"
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este perfil?"
      @confirm="handleDelete"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>