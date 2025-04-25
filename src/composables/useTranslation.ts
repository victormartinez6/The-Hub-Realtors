import { useI18n } from 'vue-i18n';

/**
 * Composable personalizado para internacionalização
 * Centraliza todas as funções relacionadas a tradução e formatação
 */
export function useTranslation() {
  const { t, locale, d, n } = useI18n({ useScope: 'global' });
  
  return {
    // Tradução básica
    t,
    
    // Alterar idioma
    setLocale: (newLocale: 'pt' | 'en') => {
      locale.value = newLocale;
      localStorage.setItem('locale', newLocale);
      document.querySelector('html')?.setAttribute('lang', newLocale);
    },
    
    // Obter idioma atual
    getLocale: () => locale.value,
    
    // Formatação de data
    formatDate: (date: Date) => d(date, 'long'),
    
    // Formatação de número
    formatNumber: (num: number) => n(num, 'decimal'),
    
    // Formatação de moeda
    formatCurrency: (amount: number) => n(amount, 'currency', { 
      currency: locale.value === 'pt' ? 'BRL' : 'USD' 
    })
  };
}
