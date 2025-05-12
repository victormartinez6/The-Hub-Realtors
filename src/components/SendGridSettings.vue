<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-medium text-gray-900">Configurações do SendGrid</h3>
      <div class="flex items-center">
        <span class="mr-2 text-sm font-medium text-gray-700">{{ isActive ? 'Ativo' : 'Inativo' }}</span>
        <v-switch
          v-model="isActive"
          color="#012928"
          hide-details
          density="compact"
          @change="toggleService"
          :disabled="isSwitching"
        ></v-switch>
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-6">
      <div>
        <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-1">API Key do SendGrid</label>
        <input
          type="password"
          id="apiKey"
          v-model="sendgridConfig.apiKey"
          placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
        />
        <p class="mt-1 text-xs text-gray-500">Obtenha sua API Key no painel do SendGrid em Settings > API Keys</p>
      </div>

      <div>
        <label for="fromName" class="block text-sm font-medium text-gray-700 mb-1">Nome do Remetente</label>
        <input
          type="text"
          id="fromName"
          v-model="sendgridConfig.fromName"
          placeholder="The Hub Realtors"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
        />
      </div>

      <div>
        <label for="fromEmail" class="block text-sm font-medium text-gray-700 mb-1">E-mail do Remetente</label>
        <input
          type="email"
          id="fromEmail"
          v-model="sendgridConfig.fromEmail"
          placeholder="noreply@thehubrealtors.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
        />
        <p class="mt-1 text-xs text-gray-500">Este email deve ser verificado no SendGrid</p>
      </div>
    </div>

    <div class="mt-6 flex flex-col space-y-4">
      <div class="flex space-x-4">
        <button
          @click="saveConfig"
          class="px-4 py-2 bg-[#012928] text-white rounded-md hover:bg-[#024e4c] focus:outline-none focus:ring-2 focus:ring-[#012928] flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Salvar Configurações
        </button>

        <button
          @click="showTestEmailModal = true"
          :disabled="!isConfigValid"
          class="px-4 py-2 border border-[#012928] text-[#012928] rounded-md hover:bg-[#012928]/10 focus:outline-none focus:ring-2 focus:ring-[#012928] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Enviar Email de Teste
        </button>
      </div>

      <div v-if="result" class="p-4 rounded-md" :class="result.success ? 'bg-green-50' : 'bg-red-50'">
        <p :class="result.success ? 'text-green-700' : 'text-red-700'">
          {{ result.message }}
        </p>
      </div>
    </div>

    <!-- Modal de Email de Teste -->
    <div v-if="showTestEmailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Enviar Email de Teste</h3>
        
        <div class="mb-4">
          <label for="testEmail" class="block text-sm font-medium text-gray-700 mb-1">Email para Teste</label>
          <input
            type="email"
            id="testEmail"
            v-model="testEmail"
            placeholder="seu@email.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
          />
          <p class="mt-1 text-xs text-gray-500">Um email de teste será enviado para este endereço</p>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showTestEmailModal = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button 
            @click="sendTestEmail"
            :disabled="!testEmail || isSending"
            class="px-4 py-2 bg-[#012928] text-white rounded-md hover:bg-[#024e4c] focus:outline-none focus:ring-2 focus:ring-[#012928] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSending">Enviando...</span>
            <span v-else>Enviar Teste</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendgridFunctionService } from '../services/sendgrid-function.service';
import { sendgridSmtpFunctionService } from '../services/sendgrid-smtp-function.service';
import { unifiedEmailService, type EmailServiceType } from '../services/unified-email.service';
import { useAuthStore } from '../stores/auth';

// Configuração do SendGrid
const sendgridConfig = ref({
  apiKey: '',
  fromName: '',
  fromEmail: ''
});

// Estado do componente
const result = ref<{ success: boolean; message: string } | null>(null);
const showTestEmailModal = ref(false);
const testEmail = ref('');
const isSending = ref(false);
const isActive = ref(false);
const isSwitching = ref(false);
const authStore = useAuthStore();

// Verificar se a configuração é válida
const isConfigValid = computed(() => {
  return (
    sendgridConfig.value.apiKey.trim() !== '' &&
    sendgridConfig.value.fromName.trim() !== '' &&
    sendgridConfig.value.fromEmail.trim() !== ''
  );
});

// Função para alternar o serviço
const toggleService = async () => {
  try {
    isSwitching.value = true;
    result.value = null;
    
    // Se estiver desativando, não permitir (sempre deve ter um serviço ativo)
    if (!isActive.value) {
      result.value = {
        success: false,
        message: 'Pelo menos um serviço de email deve estar ativo.'
      };
      isActive.value = true;
      return;
    }
    
    // Se estiver ativando o SendGrid, primeiro verificar se as configurações são válidas
    if (!isConfigValid.value) {
      result.value = {
        success: false,
        message: 'Preencha todos os campos obrigatórios antes de ativar o SendGrid'
      };
      isActive.value = false;
      return;
    }
    
    // Salvar as configurações primeiro
    await saveConfig(false); // Não mostrar mensagem de sucesso ao salvar
    
    // Definir o SendGrid como serviço ativo
    await unifiedEmailService.setActiveService('sendgrid');
    
    result.value = {
      success: true,
      message: 'SendGrid ativado com sucesso!'
    };
    
    // Limpar a mensagem após 3 segundos
    setTimeout(() => {
      if (result.value?.success) {
        result.value = null;
      }
    }, 3000);
  } catch (error: any) {
    console.error('Erro ao alternar serviço SendGrid:', error);
    result.value = {
      success: false,
      message: `Erro ao alternar serviço: ${error.message || 'Erro desconhecido'}`
    };
    // Reverter o estado do switch em caso de erro
    isActive.value = !isActive.value;
  } finally {
    isSwitching.value = false;
  }
};

// Listener para evento de mudança de serviço de email
const handleServiceChange = async (event: CustomEvent) => {
  const { service } = event.detail;
  console.log('SendGridSettings: Serviço de email alterado para:', service);
  isActive.value = service === 'sendgrid';
};

// Carregar configurações ao montar o componente
onMounted(async () => {
  try {
    // Adicionar listener para o evento de mudança de serviço
    window.addEventListener('email-service-change', handleServiceChange as EventListener);
    
    // Verificar se o SendGrid é o serviço ativo
    const activeService = await unifiedEmailService.getActiveService();
    isActive.value = activeService === 'sendgrid';
    
    // Carregar configurações do SendGrid
    const docRef = doc(db, 'settings', 'sendgrid');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      sendgridConfig.value = {
        apiKey: data.apiKey || '',
        fromName: data.fromName || '',
        fromEmail: data.fromEmail || ''
      };
      console.log('Configurações do SendGrid carregadas com sucesso');
    }
  } catch (error) {
    console.error('Erro ao carregar configurações do SendGrid:', error);
  }
});

// Remover listener ao desmontar o componente
onUnmounted(() => {
  window.removeEventListener('email-service-change', handleServiceChange as EventListener);
});

// Salvar configurações
const saveConfig = async (showMessage = true) => {
  try {
    if (showMessage) {
      result.value = null;
    }
    
    // Validar campos obrigatórios
    if (!isConfigValid.value) {
      result.value = {
        success: false,
        message: 'Preencha todos os campos obrigatórios'
      };
      return false;
    }
    
    // Salvar no Firestore
    const docRef = doc(db, 'settings', 'sendgrid');
    await setDoc(docRef, sendgridConfig.value);
    
    if (showMessage) {
      result.value = {
        success: true,
        message: 'Configurações salvas com sucesso!'
      };
    }
    
    console.log('Configurações do SendGrid salvas com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações do SendGrid:', error);
    
    result.value = {
      success: false,
      message: 'Erro ao salvar configurações. Tente novamente.'
    };
    return false;
  }
};

// Enviar email de teste
const sendTestEmail = async () => {
  try {
    isSending.value = true;
    result.value = null;
    
    // Validar email de teste
    if (!testEmail.value) {
      result.value = {
        success: false,
        message: 'Informe um email para teste'
      };
      return;
    }
    
    // Salvar configurações primeiro
    await saveConfig();
    
    console.log('SendGridSettings: Enviando email de teste para', testEmail.value);
    
    // Enviar email de teste usando a Cloud Function com SMTP Relay do SendGrid
    const emailResult = await sendgridSmtpFunctionService.sendTestEmail(testEmail.value);
    
    result.value = emailResult;
    
    if (emailResult.success) {
      showTestEmailModal.value = false;
    }
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    
    result.value = {
      success: false,
      message: 'Erro ao enviar email de teste. Verifique as configurações e tente novamente.'
    };
  } finally {
    isSending.value = false;
  }
};
</script>
