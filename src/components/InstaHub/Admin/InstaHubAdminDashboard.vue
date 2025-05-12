<template>
  <div class="admin-dashboard">
    <h1 class="text-2xl font-bold mb-6">{{ t('admin.dashboard') }}</h1>
    
    <div v-if="isLoading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#451A37]"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-800">
      {{ t('instahub.error') }}: {{ error.message }}
    </div>
    
    <div v-else class="space-y-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ t('admin.dashboard') }}</h2>
          <div class="flex gap-2">
            <button 
              @click="resetToDefault" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              :disabled="isSaving"
            >
              {{ isSaving ? t('common.loading') : t('admin.restoreDefaults') }}
            </button>
            <button 
              @click="saveChanges" 
              class="px-4 py-2 bg-[#451A37] text-white rounded-lg hover:bg-opacity-90"
              :disabled="isSaving"
            >
              {{ isSaving ? t('profile.saving') : t('admin.saveChanges') }}
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimelineSettingsPanel 
            v-model:settings="editableConfig.timelineSettings" 
          />
          
          <RelevanceAlgorithmPanel 
            v-model:settings="editableConfig.relevanceAlgorithm" 
          />
          
          <BusinessRulesPanel 
            v-model:settings="editableConfig.businessRules" 
          />
          
          <ContentQualityPanel 
            v-model:settings="editableConfig.contentQuality" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useConfigService } from '../services/configService';
import { useI18n } from 'vue-i18n';
import TimelineSettingsPanel from './TimelineSettingsPanel.vue';
import RelevanceAlgorithmPanel from './RelevanceAlgorithmPanel.vue';
import BusinessRulesPanel from './BusinessRulesPanel.vue';
import ContentQualityPanel from './ContentQualityPanel.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const { t } = useI18n();
const { 
  configData, 
  isLoading, 
  error, 
  loadConfig, 
  saveConfig,
  resetToDefault: resetConfig
} = useConfigService();

const editableConfig = ref<any>({});
const isSaving = ref(false);

onMounted(async () => {
  await loadConfig();
  if (configData.value) {
    editableConfig.value = JSON.parse(JSON.stringify(configData.value));
  }
});

const resetToDefault = async () => {
  if (confirm(t('common.confirm') + ': ' + t('admin.restoreDefaults') + '?')) {
    isSaving.value = true;
    try {
      const result = await resetConfig();
      if (result.success) {
        editableConfig.value = JSON.parse(JSON.stringify(configData.value));
        toast.info(t('admin.configSaved'));
      } else {
        toast.error(`${t('instahub.error')}: ${result.message}`);
      }
    } catch (err: any) {
      toast.error(`${t('instahub.error')}: ${err.message}`);
    } finally {
      isSaving.value = false;
    }
  }
};

const saveChanges = async () => {
  isSaving.value = true;
  try {
    const result = await saveConfig(editableConfig.value);
    if (result.success) {
      toast.success(t('admin.configSaved'));
    } else {
      toast.error(`${t('instahub.error')}: ${result.message}`);
    }
  } catch (err: any) {
    toast.error(`${t('instahub.error')}: ${err.message}`);
  } finally {
    isSaving.value = false;
  }
};
</script>
