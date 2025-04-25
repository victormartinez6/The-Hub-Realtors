import { createI18n } from 'vue-i18n';
import pt from './pt.json';
import en from './en.json';

// Tipo para os idiomas suportados
type Locale = 'pt' | 'en';

// Detectar o idioma do navegador
const getBrowserLocale = (): string => {
  const navigatorLocale = navigator.languages !== undefined 
    ? navigator.languages[0] 
    : navigator.language;
  
  if (!navigatorLocale) {
    return 'pt'; // Idioma padrão
  }
  
  // Retorna 'pt' para pt-BR, pt-PT, etc.
  return navigatorLocale.trim().split(/-|_/)[0];
};

// Verificar se o idioma está disponível
const getLocale = (): Locale => {
  // Tentar obter o idioma do localStorage
  const storedLocale = localStorage.getItem('locale');
  
  if (storedLocale && ['pt', 'en'].includes(storedLocale)) {
    return storedLocale as Locale;
  }
  
  // Tentar obter o idioma do navegador
  const browserLocale = getBrowserLocale();
  
  // Verificar se o idioma do navegador está disponível
  if (['pt', 'en'].includes(browserLocale)) {
    return browserLocale as Locale;
  }
  
  // Idioma padrão
  return 'pt';
};

// Criar instância do i18n
export const i18n = createI18n({
  legacy: false, // Usar a API de Composição do Vue 3
  globalInjection: true, // Injetar $t globalmente mesmo no modo não-legacy
  locale: getLocale(),
  fallbackLocale: 'pt', // Idioma de fallback
  messages: {
    pt,
    en
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
