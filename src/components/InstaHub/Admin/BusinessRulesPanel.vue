<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">{{ t('admin.businessRules') }}</h3>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.interestsPerUser') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.maxInterestsPerDay" 
            type="range" 
            min="5" 
            max="50" 
            step="5"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ localSettings.maxInterestsPerDay }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('admin.interestsPerUserDescription') }}
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.postsPerBroker') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.maxPostsPerBroker" 
            type="range" 
            min="10" 
            max="100" 
            step="10"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ localSettings.maxPostsPerBroker }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('admin.postsPerBrokerDescription') }}
        </p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ t('admin.minTimeBetweenReposts') }}
        </label>
        <div class="flex items-center gap-2">
          <input 
            v-model.number="localSettings.minTimeBetweenReposts" 
            type="range" 
            min="1" 
            max="30" 
            step="1"
            class="w-full"
          />
          <span class="text-sm font-medium">{{ localSettings.minTimeBetweenReposts }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          {{ t('admin.minTimeBetweenRepostsDescription') }}
        </p>
      </div>
      
      <div class="pt-4 border-t border-gray-200">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            v-model="localSettings.enableAutoArchive" 
            id="enableAutoArchive"
            class="h-4 w-4 text-[#451A37] focus:ring-[#451A37] border-gray-300 rounded"
          />
          <label for="enableAutoArchive" class="ml-2 block text-sm text-gray-700">
            {{ t('admin.autoArchiving') }}
          </label>
        </div>
        
        <div class="flex items-center mt-3">
          <input 
            type="checkbox" 
            v-model="localSettings.enableNotifications" 
            id="enableNotifications"
            class="h-4 w-4 text-[#451A37] focus:ring-[#451A37] border-gray-300 rounded"
          />
          <label for="enableNotifications" class="ml-2 block text-sm text-gray-700">
            {{ t('admin.autoNotifications') }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  settings: {
    type: Object,
    required: true,
    default: () => ({
      maxInterestsPerDay: 20,
      maxPostsPerBroker: 50,
      minTimeBetweenReposts: 7,
      enableAutoArchive: true,
      enableNotifications: true
    })
  }
});

const emit = defineEmits(['update:settings']);

// Garantir que as configurações tenham todos os campos necessários
onMounted(() => {
  if (props.settings) {
    // Adicionar campos que podem não existir nas configurações iniciais
    if (localSettings.value.enableAutoArchive === undefined) {
      localSettings.value = {
        ...localSettings.value,
        enableAutoArchive: true
      };
    }
    
    if (localSettings.value.enableNotifications === undefined) {
      localSettings.value = {
        ...localSettings.value,
        enableNotifications: true
      };
    }
  }
});

const localSettings = computed({
  get: () => props.settings || {
    maxInterestsPerDay: 20,
    maxPostsPerBroker: 50,
    minTimeBetweenReposts: 7,
    enableAutoArchive: true,
    enableNotifications: true
  },
  set: (value) => emit('update:settings', value)
});
</script>
