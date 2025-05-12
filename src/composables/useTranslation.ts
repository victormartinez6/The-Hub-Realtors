import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { type Locale } from '../i18n';

// Importar diretamente os arquivos de tradução
import ptTranslations from '../i18n/pt.json';
import enTranslations from '../i18n/en.json';

// Criar um estado reativo global para o idioma atual
const currentLanguage = ref<Locale>(
  (localStorage.getItem('locale') as Locale) || 'pt'
);

// Armazenar todas as traduções em um objeto reativo
const translations = reactive({
  pt: ptTranslations,
  en: enTranslations
});

/**
 * Composable personalizado para internacionalização
 * Implementação simplificada e direta que não depende tanto do mecanismo interno do Vue I18n
 */
export function useTranslation() {
  // Ainda usamos o useI18n para funções de formatação
  const { d, n } = useI18n();

  // Função para obter o idioma atual
  const getLocale = (): Locale => {
    return currentLanguage.value;
  };

  // Função para alterar o idioma
  const setLocale = (newLocale: Locale): void => {
    // Atualizar o estado reativo
    currentLanguage.value = newLocale;
    
    // Salvar no localStorage
    localStorage.setItem('locale', newLocale);
    
    // Atualizar o atributo lang do HTML
    document.querySelector('html')?.setAttribute('lang', newLocale);
    
    // Disparar um evento personalizado para notificar os componentes
    window.dispatchEvent(new CustomEvent('locale-changed', { detail: newLocale }));
    
    // Tentar atualizar também o i18n global para compatibilidade
    try {
      // @ts-ignore
      window.$i18n?.global?.locale && (window.$i18n.global.locale.value = newLocale);
    } catch (error) {
      console.warn('Não foi possível atualizar o i18n global:', error);
    }
    
    console.log('Idioma alterado para:', newLocale);
  };

  // Função de tradução simplificada e direta
  const t = (key: string, params?: Record<string, any>): string => {
    const locale = currentLanguage.value;
    
    // Dividir a chave por pontos para navegar no objeto de traduções
    const keys = key.split('.');
    
    // Começar do objeto de traduções do idioma atual
    let result: any = translations[locale];
    
    // Navegar pela hierarquia de chaves
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Se a chave não for encontrada, retornar a própria chave como fallback
        return key;
      }
    }
    
    // Se o resultado for uma string, retorná-lo
    if (typeof result === 'string') {
      // Substituir parâmetros se houver
      if (params) {
        return Object.entries(params).reduce(
          (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
          result
        );
      }
      return result;
    }
    
    // Se o resultado não for uma string, retornar a chave como fallback
    return key;
  };

  // Propriedade computada para o idioma atual
  const locale = computed(() => currentLanguage.value);

  return {
    // Tradução básica
    t,

    // Alterar idioma
    setLocale,
    
    // Obter idioma atual
    getLocale,
    
    // Formatação de data (ainda usando o i18n)
    formatDate: (date: Date) => d(date, 'long'),
    formatShortDate: (date: Date) => d(date, 'short'),

    // Formatação de número (ainda usando o i18n)
    formatNumber: (num: number) => n(num, 'decimal'),

    // Formatação de moeda (ainda usando o i18n)
    formatCurrency: (amount: number) => n(amount, 'currency'),
    
    // Propriedade computada para o idioma atual
    locale,
    
    // Expor as traduções diretamente
    translations
  };
}

// Exportar uma instância global do composable para uso em componentes que não podem usar composables
export const globalTranslation = useTranslation();
