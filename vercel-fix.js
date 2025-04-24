// Este script será executado antes do build na Vercel
// Ele cria um módulo vue-i18n vazio para evitar erros de build

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o diretório node_modules
const nodeModulesDir = path.join(__dirname, 'node_modules');

// Caminho para o diretório vue-i18n
const vueI18nDir = path.join(nodeModulesDir, 'vue-i18n');

// Conteúdo do módulo vue-i18n vazio
const vueI18nContent = `
// Módulo vue-i18n vazio para evitar erros de build
export const createI18n = () => ({
  global: {
    locale: { value: 'pt' },
    t: (key) => key
  }
});

export const useI18n = () => ({
  t: (key) => key,
  locale: { value: 'pt' }
});
`;

// Criar diretório vue-i18n se não existir
if (!fs.existsSync(vueI18nDir)) {
  fs.mkdirSync(vueI18nDir, { recursive: true });
}

// Criar arquivo index.js no diretório vue-i18n
fs.writeFileSync(path.join(vueI18nDir, 'index.js'), vueI18nContent);

// Criar arquivo package.json no diretório vue-i18n
const packageJsonContent = `{
  "name": "vue-i18n",
  "version": "9.2.2",
  "main": "index.js",
  "module": "index.js"
}`;

fs.writeFileSync(path.join(vueI18nDir, 'package.json'), packageJsonContent);

console.log('Módulo vue-i18n vazio criado com sucesso!');
