<template>
  <div class="realtor-select-container relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    
    <!-- Input para busca -->
    <div 
      ref="inputRef"
      class="relative"
      @click="showDropdown = true"
    >
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="placeholder"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Lista de realtors selecionados -->
    <div v-if="modelValue.length > 0" class="mt-2 flex flex-wrap gap-2">
      <div
        v-for="realtorId in modelValue"
        :key="realtorId"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
      >
        {{ getRealtorName(realtorId) }}
        <button
          type="button"
          @click.stop="removeRealtor(realtorId, $event)"
          class="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
        >
          <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Dropdown de realtors -->
    <Teleport to="body">
      <div
        v-if="showDropdown"
        ref="dropdownRef"
        class="realtor-select-dropdown absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        :style="{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }"
      >
        <div v-if="filteredRealtors.length === 0" class="text-gray-500 text-sm py-2 px-4">
          Nenhum realtor encontrado
        </div>
        <div
          v-else
          v-for="realtor in filteredRealtors"
          :key="realtor.id"
          @click.stop="toggleRealtor(realtor.id, $event)"
          class="cursor-pointer select-none relative py-2 px-3 hover:bg-indigo-50"
          :class="{
            'bg-indigo-50': isRealtorSelected(realtor.id)
          }"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="block truncate font-medium">
                {{ realtor.displayName || realtor.email }}
              </span>
              <span v-if="realtor.displayName" class="block truncate text-sm text-gray-500">
                {{ realtor.email }}
              </span>
            </div>
            <span
              v-if="isRealtorSelected(realtor.id)"
              class="text-indigo-600"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserManagementStore } from '../stores/userManagement';
import { useAuthStore } from '../stores/auth';
import debounce from 'lodash/debounce';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => []
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Buscar realtor...'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const userManagementStore = useUserManagementStore();
const authStore = useAuthStore();
const showDropdown = ref(false);
const searchQuery = ref('');
const inputRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

// Log para debug
watch(() => props.modelValue, (newValue) => {
  console.log('[RealtorSelect] modelValue atualizado:', newValue);
}, { deep: true });

const realtors = computed(() => {
  console.log('[RealtorSelect] Role do usuário:', authStore.userRole);
  console.log('[RealtorSelect] User UID:', authStore.user?.uid);
  console.log('[RealtorSelect] Todos usuários:', userManagementStore.users);
  console.log('[RealtorSelect] Realtors selecionados:', props.modelValue);

  return userManagementStore.users.filter(user => {
    // Se for broker, mostrar todos os realtors ativos
    if (authStore.userRole === 'broker') {
      return user.role === 'realtor' && user.status === 'active';
    }
    
    // Se for realtor, mostrar apenas ele mesmo
    if (authStore.userRole === 'realtor') {
      return user.id === authStore.user?.uid;
    }
    
    return false;
  });
});

const filteredRealtors = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  
  return realtors.value.filter(realtor => {
    const nameMatch = realtor.displayName?.toLowerCase().includes(query);
    const emailMatch = realtor.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });
});

const isRealtorSelected = computed(() => (realtorId: string) => {
  return props.modelValue.includes(realtorId);
});

const getRealtorName = (realtorId: string) => {
  const realtor = userManagementStore.users.find(user => user.id === realtorId);
  if (!realtor) {
    console.warn(`[RealtorSelect] Realtor não encontrado para o ID: ${realtorId}`);
    return 'Realtor não encontrado';
  }
  return realtor.displayName || realtor.email;
};

const removeRealtor = (realtorId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  const newValue = props.modelValue.filter(id => id !== realtorId);
  emit('update:modelValue', newValue);
};

const toggleRealtor = (realtorId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  if (props.multiple) {
    const newValue = [...props.modelValue, realtorId];
    emit('update:modelValue', newValue);
  } else {
    emit('update:modelValue', [realtorId]);
  }
  showDropdown.value = false; // Sempre fecha o dropdown após selecionar
  searchQuery.value = ''; // Limpa a busca após selecionar
};

// Carregar usuários ao montar o componente
onMounted(async () => {
  console.log('[RealtorSelect] Montando componente...');
  console.log('[RealtorSelect] Role do usuário:', authStore.userRole);
  
  if (authStore.userRole === 'realtor' || authStore.userRole === 'broker') {
    console.log('[RealtorSelect] Carregando usuários...');
    await userManagementStore.fetchUsers();
    console.log('[RealtorSelect] Usuários carregados:', userManagementStore.users.length);
  }
});

// Atualizar posição do dropdown
const updateDropdownPosition = async () => {
  await nextTick();
  if (inputRef.value && dropdownRef.value) {
    const rect = inputRef.value.getBoundingClientRect();
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  }
};

// Fechar dropdown quando clicar fora
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.realtor-select-container') && !target.closest('.realtor-select-dropdown')) {
    showDropdown.value = false;
    searchQuery.value = ''; // Limpa a busca ao fechar
  }
};

// Watch para fechar o dropdown quando não houver mais itens
watch(filteredRealtors, (newValue) => {
  if (newValue.length === 0 && searchQuery.value && showDropdown.value) {
    // Espera um pouco antes de fechar para mostrar a mensagem "Nenhum realtor encontrado"
    setTimeout(() => {
      showDropdown.value = false;
      searchQuery.value = '';
    }, 1500);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Recarregar realtors quando o broker mudar
watch(() => authStore.user?.uid, async (newBrokerId, oldBrokerId) => {
  if (newBrokerId && newBrokerId !== oldBrokerId) {
    await userManagementStore.fetchUsers();
  }
});

// Atualizar posição quando o dropdown é mostrado
watch(showDropdown, async (newValue) => {
  if (newValue) {
    await updateDropdownPosition();
  }
});
</script>

<style scoped>
.realtor-select-dropdown {
  position: fixed !important;
}
</style>
