import { createI18n } from 'vue-i18n';
import pt from './pt.json';
import en from './en.json';

// Tipo para os idiomas suportados
export type Locale = 'pt' | 'en';

// Detectar o idioma do navegador
const getBrowserLocale = (): string => {
  const navigatorLocale = navigator.languages !== undefined 
    ? navigator.languages[0] 
    : navigator.language;
  
  if (!navigatorLocale) {
    return 'pt';
  }
  
  return navigatorLocale.trim().split(/-|_/)[0];
};

// Verificar se o idioma está disponível
const getLocale = (): Locale => {
  const storedLocale = localStorage.getItem('locale');
  
  if (storedLocale && ['pt', 'en'].includes(storedLocale)) {
    return storedLocale as Locale;
  }
  
  const browserLocale = getBrowserLocale();
  
  if (['pt', 'en'].includes(browserLocale)) {
    return browserLocale as Locale;
  }
  
  return 'pt';
};

// Criar instância do i18n
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getLocale(),
  fallbackLocale: 'pt',
  messages: {
    pt,
    en
  },
  datetimeFormats: {
    pt: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric'
      }
    }
  },
  numberFormats: {
    pt: {
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      currency: {
        style: 'currency',
        currency: 'BRL'
      }
    },
    en: {
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      currency: {
        style: 'currency',
        currency: 'USD'
      }
    }
  }
});

// Função para alterar o idioma
export const setLocale = (locale: Locale): void => {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
  document.querySelector('html')?.setAttribute('lang', locale);
};

// Exportar função para obter o idioma atual
export const getI18nLocale = (): Locale => {
  return i18n.global.locale.value as Locale;
};
