import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Encontrar todos os arquivos Vue
const vueFiles = await glob('src/**/*.vue');
let migratedCount = 0;

console.log('Iniciando migração de internacionalização...');
console.log(`Encontrados ${vueFiles.length} arquivos Vue para verificar`);

for (const file of vueFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Verificar se o arquivo usa $t
  if (content.includes('$t(')) {
    console.log(`\nMigrando: ${file}`);
    migratedCount++;
    
    // Verificar se já importa useI18n ou useTranslation
    const hasUseI18n = content.includes('import { useI18n }') || 
                       content.includes('import {useI18n}');
    const hasUseTranslation = content.includes('import { useTranslation }') || 
                              content.includes('import {useTranslation}');
    
    // Adicionar import se necessário
    if (!hasUseI18n && !hasUseTranslation) {
      const scriptSetupMatch = content.match(/<script setup.*?>/);
      if (scriptSetupMatch) {
        const importStatement = `\nimport { useTranslation } from '@/composables/useTranslation';`;
        const scriptTag = scriptSetupMatch[0];
        content = content.replace(
          scriptTag, 
          `${scriptTag}${importStatement}`
        );
        console.log('- Adicionado import de useTranslation');
        modified = true;
      }
    }
    
    // Adicionar a constante t
    const setupContentMatch = content.match(/<script setup.*?>([\s\S]*?)<\/script>/);
    if (setupContentMatch) {
      const setupContent = setupContentMatch[1];
      if (!setupContent.includes('const { t }') && 
          !setupContent.includes('const {t}') &&
          !setupContent.includes('const { t,') &&
          !setupContent.includes('const {t,')) {
        
        let newSetupContent;
        if (hasUseI18n) {
          newSetupContent = setupContent.trim() + 
            '\n\n// Internacionalização\nconst { t } = useI18n();\n';
          console.log('- Adicionada constante t usando useI18n');
        } else {
          newSetupContent = setupContent.trim() + 
            '\n\n// Internacionalização\nconst { t } = useTranslation();\n';
          console.log('- Adicionada constante t usando useTranslation');
        }
        
        content = content.replace(setupContent, newSetupContent);
        modified = true;
      }
    }
    
    // Substituir $t por t no template
    if (content.includes('$t(')) {
      const oldContent = content;
      content = content.replace(/\$t\(/g, 't(');
      if (oldContent !== content) {
        console.log('- Substituído $t por t no template');
        modified = true;
      }
    }
    
    // Salvar o arquivo se houve modificações
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('✓ Arquivo atualizado com sucesso');
    } else {
      console.log('⚠ Nenhuma modificação necessária');
    }
  }
}

console.log(`\nMigração concluída! ${migratedCount} arquivos foram processados.`);
console.log('Recomendações:');
console.log('1. Verifique os arquivos modificados para garantir que tudo está funcionando corretamente');
console.log('2. Teste a aplicação para verificar se as traduções estão funcionando');
