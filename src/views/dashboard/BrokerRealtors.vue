<template>
  <div class="p-6">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gerenciamento de Corretores</h1>
      <button
        @click="openNewUserModal"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#012928] hover:bg-[#012928]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
      >
        Novo Corretor
      </button>
    </div>

    <!-- Filtros -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por nome ou email..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
        />
      </div>
      <div class="w-48">
        <select
          v-model="selectedStatus"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-[#012928]">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Carregando...
      </div>
    </div>

    <!-- Lista de Corretores -->
    <div v-else>
      <div v-if="filteredRealtors.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum corretor encontrado</h3>
        <p class="mt-1 text-sm text-gray-500">
          Comece adicionando um novo corretor à sua equipe.
        </p>
      </div>

      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <ul class="divide-y divide-gray-200">
          <li v-for="realtor in filteredRealtors" :key="realtor.uid" class="px-4 py-4">
            <UserListItem :user="realtor" @edit="editUser" @toggle-status="toggleUserStatus" @delete="deleteUser" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal de Usuário -->
    <Modal :show="isModalOpen" @close="closeModal">
      <template #title>
        {{ editingUser ? 'Editar Corretor' : 'Novo Corretor' }}
      </template>
      <template #content>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              v-model="userForm.displayName"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              v-model="userForm.email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">WhatsApp</label>
            <div class="relative mt-1 flex rounded-md shadow-sm">
              <!-- Seletor de País -->
              <div class="relative">
                <button
                  type="button"
                  @click="showCountryList = !showCountryList"
                  class="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
                >
                  <span class="mr-2">{{ selectedCountry?.flag }}</span>
                  <span>+{{ selectedCountry?.dialCode }}</span>
                  <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Lista de Países -->
                <div
                  v-if="showCountryList"
                  class="absolute z-10 mt-1 w-72 rounded-md bg-white shadow-lg"
                >
                  <div class="p-2">
                    <input
                      type="text"
                      v-model="countrySearchQuery"
                      placeholder="Buscar país ou código..."
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
                    />
                  </div>
                  <ul
                    class="max-h-60 overflow-auto py-1"
                    @click="showCountryList = false"
                  >
                    <li
                      v-for="country in filteredCountries"
                      :key="country.code"
                      @click="selectedCountry = country"
                      class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <span class="mr-3 text-lg">{{ country.flag }}</span>
                      <span class="flex-1">{{ country.name }}</span>
                      <span class="text-gray-500">+{{ country.dialCode }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Campo de Telefone -->
              <input
                type="tel"
                v-model="userForm.phone"
                @input="formatPhone"
                :placeholder="selectedCountry?.code === 'BR' ? '(11) 98765-4321' : '(555) 123-4567'"
                class="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
                required
              />
            </div>
            <p v-if="phoneError" class="mt-1 text-sm text-red-600">{{ phoneError }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Endereço</label>
            <input
              type="text"
              ref="addressInput"
              v-model="userForm.streetAddress"
              placeholder="Digite o endereço..."
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Complemento</label>
              <input
                type="text"
                v-model="userForm.unit"
                placeholder="Apt, Suite, etc."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Cidade</label>
              <input
                type="text"
                v-model="userForm.city"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm bg-gray-50"
                required
                readonly
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <input
                type="text"
                v-model="userForm.state"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm bg-gray-50"
                required
                readonly
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">CEP</label>
              <input
                type="text"
                v-model="userForm.zipCode"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#012928] focus:ring-[#012928] sm:text-sm bg-gray-50"
                required
                readonly
              />
            </div>
          </div>
          <div class="space-y-4">
            <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 p-2 rounded">
              {{ errorMessage }}
            </p>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-[#012928] border border-transparent rounded-md shadow-sm hover:bg-[#012928]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012928]"
              >
                {{ editingUser ? 'Salvar' : 'Criar' }}
              </button>
            </div>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
declare global {
  interface Window {
    google: typeof google;
  }
}

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { userService } from '../../services/userService';
import Modal from '../../components/Modal.vue';
import UserListItem from '../../components/UserListItem.vue';
import { useUserManagementStore } from '../../stores/userManagement';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { countries } from '../../utils/countries';

const authStore = useAuthStore();
const userManagementStore = useUserManagementStore();
const loading = ref(true);
const realtors = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const isModalOpen = ref(false);
const editingUser = ref(null);
const addressInput = ref(null);
const phoneError = ref('');
const errorMessage = ref('');
let autocomplete: google.maps.places.Autocomplete | null = null;
let refreshInterval: number | null = null;

// Formulário com campos adicionais
const userForm = ref({
  displayName: '',
  email: '',
  phone: '',
  streetAddress: '',
  unit: '',
  city: '',
  state: '',
  zipCode: '',
});

// Computed para filtrar realtors
const filteredRealtors = computed(() => {
  console.log('Filtrando realtors:', realtors.value);
  return realtors.value.filter(realtor => {
    const matchesSearch = searchQuery.value === '' ||
      realtor.displayName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      realtor.email.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus = selectedStatus.value === 'all' ||
      (selectedStatus.value === 'active' && realtor.status === 'active') ||
      (selectedStatus.value === 'blocked' && realtor.status === 'blocked');

    return matchesSearch && matchesStatus;
  });
});

// Seletor de País
const selectedCountry = ref(countries.find(c => c.code === 'US'));
const showCountryList = ref(false);
const countrySearchQuery = ref('');

// Computed para filtrar países
const filteredCountries = computed(() => {
  const query = countrySearchQuery.value.toLowerCase();
  const preferred = countries.filter(c => c.preferred);
  const others = countries.filter(c => !c.preferred);
  
  if (!query) {
    return [...preferred, ...others];
  }
  
  return countries.filter(country => 
    country.name.toLowerCase().includes(query) || 
    country.dialCode.includes(query)
  );
});

// Inicializar Google Places Autocomplete
const initGooglePlaces = () => {
  if (!window.google?.maps?.places) {
    console.warn('Google Maps API não disponível. Tentando novamente em 500ms...');
    setTimeout(initGooglePlaces, 500);
    return;
  }

  if (!addressInput.value) {
    console.warn('Elemento de endereço não encontrado. Tentando novamente em 500ms...');
    setTimeout(initGooglePlaces, 500);
    return;
  }
  
  try {
    const options = {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address'],
    };
    
    autocomplete = new google.maps.places.Autocomplete(addressInput.value, options);
    autocomplete.addListener('place_changed', handlePlaceSelect);
    console.log('Google Places inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar Google Places:', error);
    // Se houver erro, desabilita a validação do endereço
    addressInput.value.removeAttribute('required');
  }
};

// Manipular seleção de endereço
const handlePlaceSelect = () => {
  if (!autocomplete) return;
  
  const place = autocomplete.getPlace();
  if (!place.address_components) return;

  // Reset form address fields
  userForm.value.city = '';
  userForm.value.state = '';
  userForm.value.zipCode = '';

  // Parse address components
  for (const component of place.address_components) {
    const type = component.types[0];
    
    switch (type) {
      case 'street_number':
        userForm.value.streetAddress = component.long_name;
        break;
      case 'route':
        userForm.value.streetAddress += ' ' + component.long_name;
        break;
      case 'locality':
        userForm.value.city = component.long_name;
        break;
      case 'administrative_area_level_1':
        userForm.value.state = component.short_name;
        break;
      case 'postal_code':
        userForm.value.zipCode = component.long_name;
        break;
    }
  }
};

// Formatar número de telefone baseado no país
const formatPhone = () => {
  let phone = userForm.value.phone.replace(/\D/g, '');
  
  if (selectedCountry.value?.code === 'US') {
    if (phone.length > 0) {
      if (phone.length <= 3) {
        phone = `(${phone}`;
      } else if (phone.length <= 6) {
        phone = `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
      } else {
        phone = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
      }
    }
  } else if (selectedCountry.value?.code === 'BR') {
    if (phone.length > 0) {
      if (phone.length <= 2) {
        phone = `(${phone}`;
      } else if (phone.length <= 7) {
        phone = `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
      } else {
        phone = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
      }
    }
  }
  
  userForm.value.phone = phone;
  validatePhone();
};

// Validar telefone
const validatePhone = () => {
  try {
    if (!userForm.value.phone) {
      phoneError.value = 'Telefone é obrigatório';
      return false;
    }

    const phoneNumber = `+${selectedCountry.value?.dialCode}${userForm.value.phone.replace(/\D/g, '')}`;
    if (!isValidPhoneNumber(phoneNumber, selectedCountry.value?.code)) {
      phoneError.value = 'Número de telefone inválido';
      return false;
    }

    phoneError.value = '';
    return true;
  } catch (error) {
    phoneError.value = 'Número de telefone inválido';
    return false;
  }
};

// Carregar realtors do broker atual
const loadRealtors = async () => {
  loading.value = true;
  try {
    const currentUser = authStore.user;
    if (!currentUser) throw new Error('Usuário não autenticado');

    await userManagementStore.fetchBrokerRealtors(currentUser.uid);
    realtors.value = userManagementStore.realtors;
    console.log('Realtors carregados:', realtors.value);
  } catch (error) {
    console.error('Erro ao carregar realtors:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao carregar realtors';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  userForm.value = {
    displayName: '',
    email: '',
    phone: '',
    streetAddress: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
  };
  phoneError.value = '';
  errorMessage.value = '';
};

const openNewUserModal = () => {
  editingUser.value = null;
  resetForm();
  isModalOpen.value = true;
  // Inicializar Google Places após o modal estar visível
  setTimeout(() => {
    initGooglePlaces();
  }, 100);
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
};

const editUser = (user) => {
  editingUser.value = user;
  userForm.value = {
    displayName: user.displayName,
    email: user.email,
    phone: user.phone || '',
    streetAddress: user.streetAddress || '',
    unit: user.unit || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
  };
  isModalOpen.value = true;
  // Inicializar Google Places após o modal estar visível
  setTimeout(() => {
    initGooglePlaces();
  }, 100);
};

const saveUser = async () => {
  if (!validatePhone()) return;
  errorMessage.value = '';

  try {
    const currentUser = authStore.user;
    if (!currentUser) throw new Error('Usuário não autenticado');

    const userData = {
      displayName: userForm.value.displayName,
      email: userForm.value.email,
      role: 'realtor',
      status: 'active',
      phone: userForm.value.phone,
      countryCode: selectedCountry.value?.code,
      streetAddress: userForm.value.streetAddress,
      unit: userForm.value.unit,
      city: userForm.value.city,
      state: userForm.value.state,
      zipCode: userForm.value.zipCode,
      brokerId: currentUser.uid,
      brokerName: currentUser.displayName,
      active: true
    };

    if (editingUser.value) {
      await userManagementStore.updateUser(editingUser.value.id, userData);
    } else {
      await userManagementStore.createUser(userData);
    }

    await loadRealtors();
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Erro ao salvar usuário';
  }
};

const deleteUser = async (userId: string) => {
  if (confirm('Tem certeza que deseja excluir este corretor?')) {
    try {
      await userManagementStore.deleteUser(userId);
      await loadRealtors();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert(error.message || 'Erro ao excluir usuário. Por favor, tente novamente.');
    }
  }
};

const toggleUserStatus = async (userId: string, currentStatus: string) => {
  console.log('Alterando status do usuário:', { userId, currentStatus });
  if (!userId) {
    console.error('ID do usuário não fornecido');
    return;
  }

  try {
    if (currentStatus === 'active') {
      await userManagementStore.blockUser(userId);
    } else {
      await userManagementStore.unblockUser(userId);
    }
    // Recarregar os dados após alteração
    await loadRealtors();
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
  }
};

onMounted(async () => {
  await loadRealtors();
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
