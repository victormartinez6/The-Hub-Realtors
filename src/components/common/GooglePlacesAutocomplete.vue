<template>
  <div class="google-places-autocomplete">
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-[#012928] focus:ring focus:ring-[#012928] focus:ring-opacity-50"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

// Função simplificada para simular a seleção de um lugar
const selectPlace = (address: string) => {
  const mockPlace = {
    formatted_address: address,
    geometry: {
      location: {
        lat: () => 0,
        lng: () => 0
      }
    },
    name: address
  };
  
  emit('place-selected', mockPlace);
};
</script>

<style scoped>
.google-places-autocomplete {
  position: relative;
  width: 100%;
}
</style>
