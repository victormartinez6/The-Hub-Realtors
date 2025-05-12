<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">{{ t('admin.timelineSettings') }}</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.postsPerLoad') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.postsPerLoad" 
            type="range" 
            min="5" 
            max="30" 
            step="5"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ localSettings.postsPerLoad }}</span>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.defaultOrder') }}
        </label>
        <select 
          v-model="localSettings.defaultOrder"
          class="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="recent">{{ t('admin.recent') }}</option>
          <option value="popular">{{ t('admin.popular') }}</option>
          <option value="relevant">{{ t('admin.relevant') }}</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.cacheTime') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="cacheTimeHours" 
            type="range" 
            min="0.25" 
            max="24" 
            step="0.25"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ cacheTimeHours }}h</span>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.maxPostAge') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.maxPostAge" 
            type="range" 
            min="7" 
            max="90" 
            step="1"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ localSettings.maxPostAge }}</span>
        </div>
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
      postsPerLoad: 15,
      defaultOrder: 'recent',
      cacheTime: 3600,
      maxPostAge: 60
    })
  }
});

const emit = defineEmits(['update:settings']);

const localSettings = computed({
  get: () => props.settings || {
    postsPerLoad: 15,
    defaultOrder: 'recent',
    cacheTime: 3600,
    maxPostAge: 60
  },
  set: (value) => emit('update:settings', value)
});

const cacheTimeHours = computed({
  get: () => (props.settings?.cacheTime || 3600) / 3600,
  set: (value) => {
    localSettings.value = {
      ...localSettings.value,
      cacheTime: value * 3600
    };
  }
});
</script>
