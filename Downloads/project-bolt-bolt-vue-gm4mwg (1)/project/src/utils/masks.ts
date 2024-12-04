import { ref, watch } from 'vue'

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export function useDocumentMask(initialValue = '') {
  const document = ref(initialValue)
  const maskedDocument = ref('')

  watch(document, (newValue) => {
    const cleanValue = newValue.replace(/\D/g, '')
    if (cleanValue.length <= 11) {
      maskedDocument.value = maskCPF(cleanValue)
    } else {
      maskedDocument.value = maskCNPJ(cleanValue)
    }
  }, { immediate: true })

  return {
    document,
    maskedDocument
  }
}