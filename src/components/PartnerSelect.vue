<template>
  <div class="partner-select-container relative">
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

    <!-- Lista de partners selecionados -->
    <div v-if="modelValue.length > 0" class="mt-2 flex flex-wrap gap-2">
      <div
        v-for="partnerId in modelValue"
        :key="partnerId"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
      >
        {{ getPartnerName(partnerId) }}
        <button
          type="button"
          @click.stop="removePartner(partnerId, $event)"
          class="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
        >
          <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Dropdown de parceiros -->
    <Teleport to="body">
      <div
        v-if="showDropdown"
        ref="dropdownRef"
        class="partner-select-dropdown absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        :style="{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          maxHeight: '300px'
        }"
        @keydown.esc="showDropdown = false"
        tabindex="0"
      >
        <div v-if="userManagementStore.loading" class="px-4 py-2 text-sm text-gray-500">
          Carregando parceiros...
        </div>
        <div v-else-if="filteredPartners.length === 0" class="px-4 py-2 text-sm text-gray-500">
          Nenhum parceiro encontrado
        </div>
        <template v-else>
          <div
            v-for="partner in filteredPartners"
            :key="partner.id"
            @click.stop="togglePartner(partner.id, $event)"
            class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
          >
            <div class="flex items-center">
              <span class="block truncate">
                {{ partner.displayName || partner.email }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserManagementStore } from '../stores/userManagement';
import debounce from 'lodash/debounce';

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    required: true
  },
  label: {
    type: String,
    default: 'Selecione os Parceiros'
  },
  placeholder: {
    type: String,
    default: 'Buscar parceiro...'
  }
});

const emit = defineEmits(['update:modelValue']);

const userManagementStore = useUserManagementStore();
const searchQuery = ref('');
const showDropdown = ref(false);
const inputRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

// Computed para filtrar partners baseado na busca
const filteredPartners = computed(() => {
  console.log('[PartnerSelect] Partners disponíveis:', userManagementStore.usersByRole.partner);
  if (!searchQuery.value) {
    // Retorna apenas os parceiros que não estão selecionados
    return (userManagementStore.usersByRole.partner || [])
      .filter(partner => !props.modelValue.includes(partner.id));
  }
  const query = searchQuery.value.toLowerCase();
  return (userManagementStore.usersByRole.partner || [])
    .filter(partner => !props.modelValue.includes(partner.id)) // Filtra os já selecionados
    .filter(partner => 
      (partner.displayName?.toLowerCase().includes(query) || false) ||
      partner.email.toLowerCase().includes(query)
    );
});

// Função para obter o nome do partner pelo ID
const getPartnerName = (partnerId: string) => {
  const partner = (userManagementStore.usersByRole.partner || []).find(p => p.id === partnerId);
  return partner ? (partner.displayName || partner.email) : '';
};

// Função para remover um partner
const removePartner = (partnerId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  const newValue = props.modelValue.filter(id => id !== partnerId);
  emit('update:modelValue', newValue);
};

// Função para alternar a seleção de um partner
const togglePartner = (partnerId: string, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  const newValue = [...props.modelValue, partnerId];
  emit('update:modelValue', newValue);
  showDropdown.value = false; // Sempre fecha o dropdown após selecionar
  searchQuery.value = ''; // Limpa a busca após selecionar
};

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
  if (!target.closest('.partner-select-container') && !target.closest('.partner-select-dropdown')) {
    showDropdown.value = false;
    searchQuery.value = ''; // Limpa a busca ao fechar
  }
};

// Carregar partners quando o componente for montado
const loadPartners = async () => {
  console.log('[PartnerSelect] Carregando parceiros...');
  await userManagementStore.fetchUsersByRole('partner');
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', updateDropdownPosition);
  window.addEventListener('resize', updateDropdownPosition);
  await loadPartners();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', updateDropdownPosition);
  window.removeEventListener('resize', updateDropdownPosition);
});

// Atualizar posição quando o dropdown é mostrado
watch(showDropdown, async (newValue) => {
  if (newValue) {
    await updateDropdownPosition();
  }
});

// Watch para fechar o dropdown quando não houver mais itens
watch(filteredPartners, (newValue) => {
  if (newValue.length === 0 && searchQuery.value && showDropdown.value) {
    // Espera um pouco antes de fechar para mostrar a mensagem "Nenhum parceiro encontrado"
    setTimeout(() => {
      showDropdown.value = false;
      searchQuery.value = '';
    }, 1500);
  }
});
</script>

<style scoped>
.partner-select-dropdown {
  position: fixed !important;
}
</style>
