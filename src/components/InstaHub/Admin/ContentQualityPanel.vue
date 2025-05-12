<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">{{ t('content_quality.title') }}</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('content_quality.min_photos') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.minPhotos" 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ localSettings.minPhotos }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('content_quality.min_photos_description') }}
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('content_quality.min_resolution') }}
        </label>
        <select 
          v-model="localSettings.minResolution"
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="800x600">{{ t('content_quality.low_resolution') }}</option>
          <option value="1200x800">{{ t('content_quality.medium_resolution') }}</option>
          <option value="1920x1080">{{ t('content_quality.high_resolution') }}</option>
          <option value="2560x1440">{{ t('content_quality.ultra_hd_resolution') }}</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('content_quality.min_resolution_description') }}
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('content_quality.required_fields') }}
        </label>
        <div class="space-y-2 mt-2">
          <div v-for="field in availableFields" :key="field.value" class="flex items-center">
            <input 
              type="checkbox" 
              :id="field.value" 
              :value="field.value" 
              v-model="requiredFields"
              class="h-4 w-4 text-[#451A37] focus:ring-[#451A37] border-gray-300 rounded"
            />
            <label :for="field.value" class="ml-2 block text-sm text-gray-700">
              {{ field.label }}
            </label>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('content_quality.required_fields_description') }}
        </p>
      </div>
      
      <div class="pt-4 border-t border-gray-200">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('content_quality.banned_keywords') }}
        </label>
        <textarea 
          v-model="bannedKeywordsText" 
          rows="3"
          class="w-full p-2 border border-gray-300 rounded-md text-sm"
          placeholder="{{ t('content_quality.banned_keywords_placeholder') }}"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('content_quality.banned_keywords_description') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  settings: {
    type: Object,
    required: true,
    default: () => ({
      minPhotos: 3,
      minResolution: "1200x800",
      requiredFields: ["price", "address", "bedrooms", "bathrooms"],
      bannedKeywords: []
    })
  }
});

const emit = defineEmits(['update:settings']);

const availableFields = [
  { value: 'price', label: t('content_quality.price') },
  { value: 'address', label: t('content_quality.address') },
  { value: 'bedrooms', label: t('content_quality.bedrooms') },
  { value: 'bathrooms', label: t('content_quality.bathrooms') },
  { value: 'squareFootage', label: t('content_quality.square_footage') },
  { value: 'type', label: t('content_quality.type') },
  { value: 'status', label: t('content_quality.status') },
  { value: 'description', label: t('content_quality.description') },
  { value: 'mlsId', label: t('content_quality.mls_id') }
];

const localSettings = computed({
  get: () => props.settings || {
    minPhotos: 3,
    minResolution: "1200x800",
    requiredFields: ["price", "address", "bedrooms", "bathrooms"],
    bannedKeywords: []
  },
  set: (value) => emit('update:settings', value)
});

// Gerenciar campos obrigatórios
const requiredFields = computed({
  get: () => localSettings.value?.requiredFields || [],
  set: (value) => {
    localSettings.value = {
      ...localSettings.value,
      requiredFields: value
    };
  }
});

// Gerenciar palavras-chave proibidas
const bannedKeywordsText = computed({
  get: () => {
    return (localSettings.value?.bannedKeywords || []).join('\n');
  },
  set: (value) => {
    const keywords = value
      .split('\n')
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0);
    
    localSettings.value = {
      ...localSettings.value,
      bannedKeywords: keywords
    };
  }
});

// Garantir que as configurações tenham todos os campos necessários
watch(() => props.settings, (newSettings) => {
  if (newSettings && !newSettings.bannedKeywords) {
    localSettings.value = {
      ...localSettings.value,
      bannedKeywords: []
    };
  }
}, { immediate: true });
</script>
