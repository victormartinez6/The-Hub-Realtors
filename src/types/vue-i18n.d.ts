declare module 'vue-i18n' {
  import { DefineComponent } from 'vue';
  
  export interface I18n {
    locale: string;
    t(key: string, values?: Record<string, any>): string;
    d(value: number | Date, format?: string): string;
    n(value: number, format?: string): string;
  }
  
  export function useI18n(): {
    t: (key: string, values?: Record<string, any>) => string;
    d: (value: number | Date, format?: string) => string;
    n: (value: number, format?: string) => string;
    locale: string;
  };
  
  export function createI18n(options: any): I18n;
}
