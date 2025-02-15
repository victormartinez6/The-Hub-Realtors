<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps<{
  modelValue: {
    cep: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const loading = ref(false)
const error = ref('')

const updateField = (field: string, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}

const lookupCEP = async (cep: string) => {
  if (cep.length !== 8) return
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
    if (response.data.erro) {
      error.value = 'CEP não encontrado'
      return
    }
    
    emit('update:modelValue', {
      ...props.modelValue,
      street: response.data.logradouro,
      neighborhood: response.data.bairro,
      city: response.data.localidade,
      state: response.data.uf
    })
  } catch (e) {
    error.value = 'Erro ao buscar CEP'
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue.cep, (newCep) => {
  const cleanCep = newCep.replace(/\D/g, '')
  if (cleanCep !== newCep) {
    updateField('cep', cleanCep)
  }
  if (cleanCep.length === 8) {
    lookupCEP(cleanCep)
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">CEP</label>
        <input
          :value="modelValue.cep"
          @input="updateField('cep', ($event.target as HTMLInputElement).value)"
          type="text"
          maxlength="8"
          placeholder="00000000"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Número</label>
        <input
          :value="modelValue.number"
          @input="updateField('number', ($event.target as HTMLInputElement).value)"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Logradouro</label>
      <input
        :value="modelValue.street"
        @input="updateField('street', ($event.target as HTMLInputElement).value)"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Complemento</label>
      <input
        :value="modelValue.complement"
        @input="updateField('complement', ($event.target as HTMLInputElement).value)"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Bairro</label>
        <input
          :value="modelValue.neighborhood"
          @input="updateField('neighborhood', ($event.target as HTMLInputElement).value)"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Cidade</label>
        <input
          :value="modelValue.city"
          @input="updateField('city', ($event.target as HTMLInputElement).value)"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Estado</label>
      <input
        :value="modelValue.state"
        @input="updateField('state', ($event.target as HTMLInputElement).value)"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
</template>