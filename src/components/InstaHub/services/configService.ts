import { ref, computed, onMounted } from 'vue';
import { db } from '../../../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';

/**
 * Serviço para gerenciar as configurações do InstaHub
 * Permite carregar, salvar e acessar configurações armazenadas no Firestore
 */
export const useConfigService = () => {
  const { t } = useI18n();
  const configData = ref<any>(null);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  // Valores padrão caso não exista configuração no Firestore
  const defaultConfig = {
    timelineSettings: {
      postsPerLoad: 15,
      defaultOrder: 'recent',
      cacheTime: 3600, // em segundos
      maxPostAge: 60   // em dias
    },
    relevanceAlgorithm: {
      newnessFactor: 40,
      engagementFactor: 30,
      qualityFactor: 15,
      matchFactor: 15
    },
    businessRules: {
      maxInterestsPerDay: 20,
      maxPostsPerBroker: 50,
      minTimeBetweenReposts: 7, // em dias
      enableAutoArchive: true,
      enableNotifications: true
    },
    contentQuality: {
      minPhotos: 3,
      minResolution: "1200x800",
      requiredFields: ["price", "address", "bedrooms", "bathrooms"],
      bannedKeywords: []
    }
  };

  // Carregar configurações
  const loadConfig = async () => {
    isLoading.value = true;
    try {
      const docRef = doc(db, 'appConfig', 'instaHub');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        configData.value = docSnap.data();
      } else {
        // Se não existir, criar com valores padrão
        await setDoc(docRef, defaultConfig);
        configData.value = defaultConfig;
      }
    } catch (err: any) {
      error.value = err;
      console.error('Erro ao carregar configurações:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Salvar configurações
  const saveConfig = async (newConfig: any) => {
    isLoading.value = true;
    try {
      const docRef = doc(db, 'appConfig', 'instaHub');
      await setDoc(docRef, newConfig);
      configData.value = newConfig;
      return { success: true, message: t('admin.configSaved') };
    } catch (err: any) {
      error.value = err;
      console.error('Erro ao salvar configurações:', err);
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Configurações computadas para fácil acesso
  const timelineSettings = computed(() => 
    configData.value?.timelineSettings || defaultConfig.timelineSettings
  );
  
  const relevanceAlgorithm = computed(() => 
    configData.value?.relevanceAlgorithm || defaultConfig.relevanceAlgorithm
  );
  
  const businessRules = computed(() => 
    configData.value?.businessRules || defaultConfig.businessRules
  );
  
  const contentQuality = computed(() => 
    configData.value?.contentQuality || defaultConfig.contentQuality
  );

  // Resetar para valores padrão
  const resetToDefault = async () => {
    return await saveConfig(defaultConfig);
  };

  onMounted(() => {
    loadConfig();
  });

  return {
    configData,
    isLoading,
    error,
    loadConfig,
    saveConfig,
    resetToDefault,
    timelineSettings,
    relevanceAlgorithm,
    businessRules,
    contentQuality
  };
};
