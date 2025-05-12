<template>
  <div class="update-menu-config">
    <v-container>
      <v-card>
        <v-card-title>
          <h2>Atualizar Configurações de Menu</h2>
        </v-card-title>
        <v-card-text>
          <p>Esta página atualiza as configurações de menu no Firestore com a configuração mais recente.</p>
          <p>Status: {{ status }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="#012928"
            @click="updateMenuConfig"
            :loading="loading"
            :disabled="loading"
          >
            Atualizar Configurações de Menu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { menuPermissionService } from '../services/menuPermissionService';
import { navigationConfig } from '../config/navigation';

const loading = ref(false);
const status = ref('Pronto para atualizar');
const authStore = useAuthStore();

async function updateMenuConfig() {
  loading.value = true;
  status.value = 'Atualizando configurações de menu...';

  try {
    // Verificar se o usuário está autenticado
    if (!authStore.user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    // Primeiro, carregar as configurações existentes
    const existingConfig = await menuPermissionService.loadMenuConfig();
    
    // Criar um mapa das configurações existentes para fácil acesso
    const existingConfigMap = new Map();
    existingConfig.forEach(item => {
      existingConfigMap.set(item.path, item);
    });
    
    // Mesclar as configurações novas com as existentes, preservando as permissões
    const mergedConfig = navigationConfig.map(item => {
      const existingItem = existingConfigMap.get(item.path);
      
      // Se o item já existir, preservar suas permissões (roles)
      if (existingItem && existingItem.roles) {
        return {
          ...item,
          roles: existingItem.roles
        };
      }
      
      return item;
    });
    
    // Adicionar itens que existem apenas na configuração existente
    existingConfig.forEach(item => {
      const exists = mergedConfig.some(newItem => newItem.path === item.path);
      if (!exists) {
        mergedConfig.push(item);
      }
    });

    // Salvar a configuração mesclada no Firestore
    await menuPermissionService.saveMenuConfig(mergedConfig, authStore.user.uid);
    
    status.value = 'Configurações de menu atualizadas com sucesso!';
    
    // Recarregar a página após 2 segundos para aplicar as mudanças
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error: any) {
    console.error('Erro ao atualizar configurações de menu:', error);
    status.value = `Erro: ${error.message || 'Erro desconhecido'}`;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // Verificar se o usuário tem permissão para atualizar configurações
  if (!authStore.isAuthenticated) {
    status.value = 'Usuário não autenticado';
  } else if (!['super_admin', 'admin', 'broker'].includes(authStore.userRole || '')) {
    status.value = 'Usuário sem permissão para atualizar configurações';
  }
});
</script>

<style scoped>
.update-menu-config {
  padding: 20px;
}
</style>
