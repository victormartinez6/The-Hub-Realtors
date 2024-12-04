<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'

console.log('[App] Iniciando componente App...')

const route = useRoute()
const authStore = useAuthStore()
const { loading, isAuthenticated } = storeToRefs(authStore)
const isAuthRoute = computed(() => ['login', 'register'].includes(route.name as string))

onMounted(() => {
  console.log('[App] Componente montado')
  console.log('[App] Estado:', {
    loading: loading.value,
    isAuthenticated: isAuthenticated.value,
    isAuthRoute: isAuthRoute.value,
    currentRoute: route.name
  })
})
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Carregando...</p>
    </div>
  </div>
  <div v-else class="min-h-screen bg-gray-50 overflow-x-hidden">
    <template v-if="!isAuthRoute && isAuthenticated">
      <div class="flex min-h-screen overflow-hidden">
        <Sidebar />
        <main class="flex-1 relative overflow-y-auto w-full">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </main>
      </div>
    </template>
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile-first responsive styles */
@media (max-width: 640px) {
  .table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .grid-responsive {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}

/* Prevent horizontal scroll on desktop */
@media (min-width: 1024px) {
  .overflow-x-hidden {
    overflow-x: hidden;
  }
}
</style>