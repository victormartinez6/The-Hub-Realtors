<template>
  <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
    <h3 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin-bottom: 1rem;">Configurações de SMTP</h3>
    
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
import { ref, onMounted } from 'vue';
import { smtpService } from '../services/smtp.service';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const smtpConfig = ref({
  host: '',
  port: 587,
  username: '',
  password: '',
  encryption: 'tls',
  fromName: '',
  fromEmail: ''
});

// Carregar configurações ao montar o componente
onMounted(async () => {
  if (authStore.userData?.role === 'super_admin') {
    try {
      console.log('SmtpSettings: Carregando configurações SMTP');
      const config = await smtpService.getConfig();
      if (config) {
        smtpConfig.value = config;
        console.log('SmtpSettings: Configurações carregadas com sucesso');
      }
    } catch (error) {
      console.error('SmtpSettings: Erro ao carregar configurações:', error);
    }
  }
});

const isTestingConnection = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

const saveSmtpSettings = async () => {
  console.log('SmtpSettings: Tentando salvar configurações');
  try {
    await smtpService.saveConfig(smtpConfig.value);
    testResult.value = {
      success: true,
      message: 'Configurações salvas com sucesso!'
    };
    console.log('SmtpSettings: Configurações salvas com sucesso');
  } catch (error) {
    console.error('SmtpSettings: Erro ao salvar configurações:', error);
    testResult.value = {
      success: false,
      message: 'Erro ao salvar configurações. Tente novamente.'
    };
  }
};

const testSmtpConnection = async () => {
  console.log('SmtpSettings: Testando conexão');
  isTestingConnection.value = true;
  testResult.value = null;
  
  try {
    const result = await smtpService.testConnection(smtpConfig.value);
    testResult.value = result;
    console.log('SmtpSettings: Teste de conexão concluído:', result);
  } catch (error) {
    console.error('SmtpSettings: Erro no teste de conexão:', error);
    testResult.value = { 
      success: false, 
      message: 'Erro ao testar conexão. Verifique as configurações e tente novamente.' 
    };
  } finally {
    isTestingConnection.value = false;
  }
};
</script>
