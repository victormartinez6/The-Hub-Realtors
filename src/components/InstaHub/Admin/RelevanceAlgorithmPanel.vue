<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">{{ t('admin.relevanceAlgorithm') }}</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.noveltyWeight') }} ({{ localSettings.newnessFactor }}%)
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.newnessFactor" 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            class="w-full"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Quanto maior o valor, mais os posts recentes terão prioridade.
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.engagementWeight') }} ({{ localSettings.engagementFactor }}%)
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.engagementFactor" 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            class="w-full"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Quanto maior o valor, mais os posts com muitos interessados terão prioridade.
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.qualityWeight') }} ({{ localSettings.qualityFactor }}%)
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.qualityFactor" 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            class="w-full"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Quanto maior o valor, mais os posts com informações completas e boas fotos terão prioridade.
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.matchWeight') }} ({{ localSettings.matchFactor }}%)
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.matchFactor" 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            class="w-full"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Quanto maior o valor, mais os posts que correspondem aos interesses do usuário terão prioridade.
        </p>
      </div>
      
      <div class="pt-2 border-t border-gray-200">
        <div class="flex justify-between text-sm">
          <span>Total:</span>
          <span :class="totalWeight === 100 ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ totalWeight }}%
          </span>
        </div>
        <p class="text-xs mt-1" :class="totalWeight === 100 ? 'text-green-600' : 'text-red-600'">
          {{ totalWeight === 100 ? 'Pesos balanceados corretamente.' : 'A soma dos pesos deve ser igual a 100%.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  settings: {
    type: Object,
    required: true,
    default: () => ({
      newnessFactor: 40,
      engagementFactor: 30,
      qualityFactor: 15,
      matchFactor: 15
    })
  }
});

const emit = defineEmits(['update:settings']);

const localSettings = computed({
  get: () => props.settings || {
    newnessFactor: 40,
    engagementFactor: 30,
    qualityFactor: 15,
    matchFactor: 15
  },
  set: (value) => emit('update:settings', value)
});

const totalWeight = computed(() => {
  if (!localSettings.value) return 0;
  
  return (
    (localSettings.value.newnessFactor || 0) +
    (localSettings.value.engagementFactor || 0) +
    (localSettings.value.qualityFactor || 0) +
    (localSettings.value.matchFactor || 0)
  );
});
</script>
