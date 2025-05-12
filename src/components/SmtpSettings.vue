<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h4 style="font-size: 1rem; font-weight: 500; color: #374151; margin: 0;">Configurações do Servidor SMTP</h4>
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 0.5rem; font-size: 0.875rem; color: #374151;">{{ isActive ? 'Ativo' : 'Inativo' }}</span>
        <v-switch
          v-model="isActive"
          color="#012928"
          hide-details
          density="compact"
          @change="toggleService"
          :disabled="isSwitchingService"
        ></v-switch>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
      <div>
        <label for="host">Servidor SMTP</label>
        <input
          type="text"
          id="host"
          v-model="smtpConfig.host"
          placeholder="smtp.exemplo.com"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        />
      </div>

      <div>
        <label for="port">Porta</label>
        <input
          type="number"
          id="port"
          v-model="smtpConfig.port"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        />
      </div>

      <div>
        <label for="username">Usuário</label>
        <input
          type="text"
          id="username"
          v-model="smtpConfig.username"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        />
      </div>

      <div>
        <label for="password">Senha</label>
        <input
          type="password"
          id="password"
          v-model="smtpConfig.password"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        />
      </div>

      <div>
        <label for="encryption">Criptografia</label>
        <select
          id="encryption"
          v-model="smtpConfig.encryption"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        >
          <option value="none">Nenhuma</option>
          <option value="tls">TLS</option>
          <option value="ssl">SSL</option>
        </select>
      </div>

      <div>
        <label for="fromName">Nome do Remetente</label>
        <input
          type="text"
          id="fromName"
          v-model="smtpConfig.fromName"
          placeholder="The Hub Realtors"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        />
      </div>

      <div>
        <label for="fromEmail">E-mail do Remetente</label>
        <input
          type="email"
          id="fromEmail"
          v-model="smtpConfig.fromEmail"
          placeholder="noreply@exemplo.com"
          style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-top: 0.25rem;"
        />
      </div>
    </div>

    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
      <button
        type="button"
        @click="saveSmtpSettings"
        style="padding: 0.5rem 1rem; background: #012928; color: white; border-radius: 0.375rem; font-weight: 500;"
      >
        Salvar Configurações
      </button>

      <button
        type="button"
        @click="testSmtpConnection"
        :disabled="isTestingConnection"
        style="padding: 0.5rem 1rem; border: 1px solid #012928; color: #012928; border-radius: 0.375rem; font-weight: 500;"
      >
        <span v-if="isTestingConnection">Testando...</span>
        <span v-else>Testar Conexão</span>
      </button>
    </div>

    <div v-if="testResult" style="margin-top: 1rem; padding: 1rem; border-radius: 0.375rem;" :style="{ background: testResult.success ? '#ecfdf5' : '#fef2f2' }">
      <p :style="{ color: testResult.success ? '#047857' : '#dc2626' }">
        {{ testResult.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { smtpService } from '../services/smtp.service';
import { SmtpConfig } from '../models/SmtpConfig';
import axios from 'axios';
import { unifiedEmailService, type EmailServiceType } from '../services/unified-email.service';
import { useAuthStore } from '../stores/auth';

const smtpConfig = ref<SmtpConfig>({
  host: '',
  port: 587,
  username: '',
  password: '',
  encryption: 'tls',
  fromName: 'The Hub Realtors',
  fromEmail: ''
});

// Estado do componente
const isTestingConnection = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const isActive = ref(false);
const isSwitchingService = ref(false);
const authStore = useAuthStore();

// Verificar se a configuração é válida
const isConfigValid = computed(() => {
  return (
    smtpConfig.value.host.trim() !== '' &&
    smtpConfig.value.port > 0 &&
    smtpConfig.value.username.trim() !== '' &&
    smtpConfig.value.password.trim() !== '' &&
    smtpConfig.value.fromName.trim() !== '' &&
    smtpConfig.value.fromEmail.trim() !== ''
  );
});

// Função para alternar o serviço
const toggleService = async () => {
  try {
    isSwitchingService.value = true;
    testResult.value = null;
    
    // Se estiver desativando, não permitir (sempre deve ter um serviço ativo)
    if (!isActive.value) {
      testResult.value = {
        success: false,
        message: 'Pelo menos um serviço de email deve estar ativo.'
      };
      isActive.value = true;
      return;
    }
    
    // Se estiver ativando o SMTP, primeiro verificar se as configurações são válidas
    if (!isConfigValid.value) {
      testResult.value = {
        success: false,
        message: 'Preencha todos os campos obrigatórios antes de ativar o SMTP'
      };
      isActive.value = false;
      return;
    }
    
    // Salvar as configurações primeiro
    await saveSmtpSettings(false); // Não mostrar mensagem de sucesso ao salvar
    
    // Definir o SMTP como serviço ativo
    await unifiedEmailService.setActiveService('smtp');
    
    testResult.value = {
      success: true,
      message: 'SMTP ativado com sucesso!'
    };
    
    // Limpar a mensagem após 3 segundos
    setTimeout(() => {
      if (testResult.value?.success) {
        testResult.value = null;
      }
    }, 3000);
  } catch (error: any) {
    console.error('Erro ao alternar serviço SMTP:', error);
    testResult.value = {
      success: false,
      message: `Erro ao alternar serviço: ${error.message || 'Erro desconhecido'}`
    };
    // Reverter o estado do switch em caso de erro
    isActive.value = !isActive.value;
  } finally {
    isSwitchingService.value = false;
  }
};

// Listener para evento de mudança de serviço de email
const handleServiceChange = async (event: CustomEvent) => {
  const { service } = event.detail;
  console.log('SmtpSettings: Serviço de email alterado para:', service);
  isActive.value = service === 'smtp';
};

// Carregar configurações ao montar o componente
onMounted(async () => {
  try {
    // Adicionar listener para o evento de mudança de serviço
    window.addEventListener('email-service-change', handleServiceChange as EventListener);
    
    // Verificar se o SMTP é o serviço ativo
    const activeService = await unifiedEmailService.getActiveService();
    isActive.value = activeService === 'smtp';
    
    // Carregar configurações do SMTP
    const config = await smtpService.getConfig();
    if (config) {
      smtpConfig.value = config;
      console.log('SmtpSettings: Configurações carregadas com sucesso');
    }
  } catch (error) {
    // Tratar erro
    if (error instanceof Error) {
      console.error('SmtpSettings: Erro ao carregar configurações:', error);
    }
  }
});

// Remover listener ao desmontar o componente
onUnmounted(() => {
  window.removeEventListener('email-service-change', handleServiceChange as EventListener);
});

const saveSmtpSettings = async (showMessage = true) => {
  if (showMessage) {
    testResult.value = null;
  }
  
  try {
    // Validar campos obrigatórios
    if (!isConfigValid.value) {
      testResult.value = {
        success: false,
        message: 'Preencha todos os campos obrigatórios'
      };
      return false;
    }
    
    await smtpService.saveConfig(smtpConfig.value);
    
    if (showMessage) {
      testResult.value = {
        success: true,
        message: 'Configurações SMTP salvas com sucesso!'
      };
    }
    
    console.log('SmtpSettings: Configurações salvas com sucesso');
    return true;
  } catch (error) {
    console.error('SmtpSettings: Erro ao salvar configurações:', error);
    testResult.value = {
      success: false,
      message: 'Erro ao salvar configurações. Tente novamente.'
    };
    return false;
  }
};

const testSmtpConnection = async () => {
  console.log('SmtpSettings: Testando conexão SMTP');
  isTestingConnection.value = true;
  testResult.value = null;
  
  try {
    if (!smtpConfig.value.host || !smtpConfig.value.port || 
        !smtpConfig.value.username || !smtpConfig.value.password) {
      testResult.value = {
        success: false,
        message: 'Preencha todos os campos obrigatórios (servidor, porta, usuário e senha).'
      };
      isTestingConnection.value = false;
      return;
    }
    
    // Salvar configurações primeiro
    await saveSmtpSettings();
    
    // Testar conexão usando o servidor proxy local
    const proxyUrl = 'http://localhost:3002/api/email/test-connection';
    const response = await axios.post(proxyUrl, {
      smtpConfig: smtpConfig.value
    });
    
    testResult.value = {
      success: response.data.success,
      message: response.data.message
    };
    
    console.log('SmtpSettings: Teste de conexão concluído:', testResult.value);
  } catch (error: any) {
    console.error('SmtpSettings: Erro no teste de conexão:', error);
    
    let errorMessage = 'Erro ao testar conexão. Verifique as configurações e tente novamente.';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    testResult.value = { 
      success: false, 
      message: errorMessage
    };
  } finally {
    isTestingConnection.value = false;
  }
};

</script>
