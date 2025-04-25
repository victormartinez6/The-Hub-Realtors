<template>
  <div class="google-places-autocomplete">
    <input
      ref="autocompleteInput"
      type="text"
      :value="modelValue"
      @input="handleInput"
      class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// Definir tipos para o Google Maps API
declare global {
  interface Window {
    google: any;
  }
}

// Tipos para o Google Maps
interface GoogleMapsPlace {
  address_components?: any[];
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  name?: string;
  place_id?: string;
}

interface GoogleMapsAutocomplete {
  addListener: (event: string, callback: () => void) => void;
  getPlace: () => GoogleMapsPlace;
}

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Digite um endereço'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  apiKey: {
    type: String,
    required: false,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'place-selected']);
const autocompleteInput = ref<HTMLInputElement | null>(null);
let autocomplete: any = null;
let googleMapsScript: HTMLScriptElement | null = null;

// Função para lidar com o input
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    emit('update:modelValue', target.value);
  }
};

// Função para inicializar o Google Places Autocomplete
const initAutocomplete = () => {
  if (!autocompleteInput.value) return;
  
  // Criar instância do Autocomplete
  autocomplete = new window.google.maps.places.Autocomplete(autocompleteInput.value, {
    types: ['address'],
    fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
  });
  
  // Adicionar listener para quando um lugar é selecionado
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete?.getPlace();
    if (place && place.formatted_address) {
      emit('update:modelValue', place.formatted_address);
      emit('place-selected', place);
    }
  });
};

// Carregar a API do Google Maps
const loadGoogleMapsAPI = () => {
  if (window.google && window.google.maps && window.google.maps.places) {
    // API já carregada
    initAutocomplete();
    return;
  }
  
  // Criar script para carregar a API
  googleMapsScript = document.createElement('script');
  googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=places`;
  googleMapsScript.async = true;
  googleMapsScript.defer = true;
  
  // Quando o script carregar, inicializar o autocomplete
  googleMapsScript.onload = () => {
    initAutocomplete();
  };
  
  // Adicionar o script ao documento
  document.head.appendChild(googleMapsScript);
};

// Observar mudanças no valor do input
watch(() => props.modelValue, (newValue) => {
  if (autocompleteInput.value && newValue === '') {
    autocompleteInput.value.value = '';
  }
});

onMounted(() => {
  if (props.apiKey) {
    loadGoogleMapsAPI();
  } else {
    console.warn('GooglePlacesAutocomplete: API key is required for autocomplete functionality');
  }
});

onBeforeUnmount(() => {
  // Limpar recursos ao desmontar o componente
  if (googleMapsScript && googleMapsScript.parentNode) {
    googleMapsScript.parentNode.removeChild(googleMapsScript);
  }
});
</script>

<style scoped>
.google-places-autocomplete {
  position: relative;
  width: 100%;
}

/* Estilizar as sugestões do Google Places */
.pac-container {
  border-radius: 0.375rem;
  margin-top: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 9999 !important;
}
</style>
