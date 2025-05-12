<template>
  <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
    <h3 style="font-size: 1.25rem; font-weight: 500; color: #111827; margin-bottom: 1.5rem;">Configurações de Serviço de Email</h3>
    
    <!-- Seleção de serviço de email -->
    <div style="margin-bottom: 2rem;">
      <h4 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem;">Escolha o serviço de email</h4>
      
      <div style="display: flex; gap: 1rem;">
        <div 
          v-if="hasPermission('email_sendgrid')"
          style="flex: 1; padding: 1rem; border: 2px solid; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;"
          :style="{
            borderColor: activeService === 'sendgrid' ? '#012928' : '#d1d5db',
            backgroundColor: activeService === 'sendgrid' ? '#f0f9f8' : 'white'
          }"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h5 style="font-size: 1rem; font-weight: 500; margin: 0; color: #111827;">SendGrid</h5>
            <v-switch
              v-model="isSendgridActive"
              color="#012928"
              hide-details
              density="compact"
              @change="toggleEmailService('sendgrid')"
              :disabled="isSwitchingService"
            ></v-switch>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Serviço de email baseado em API com alta entregabilidade.</p>
        </div>
        
        <div 
          v-if="hasPermission('email_smtp')"
          style="flex: 1; padding: 1rem; border: 2px solid; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;"
          :style="{
            borderColor: activeService === 'smtp' ? '#012928' : '#d1d5db',
            backgroundColor: activeService === 'smtp' ? '#f0f9f8' : 'white'
          }"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h5 style="font-size: 1rem; font-weight: 500; margin: 0; color: #111827;">SMTP</h5>
            <v-switch
              v-model="isSmtpActive"
              color="#012928"
              hide-details
              density="compact"
              @change="toggleEmailService('smtp')"
              :disabled="isSwitchingService"
            ></v-switch>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Use seu próprio servidor SMTP para enviar emails.</p>
        </div>
      </div>
    </div>
    
    <!-- Configurações específicas do serviço -->
    <div v-if="activeService === 'sendgrid' && hasPermission('email_sendgrid')">
      <SendgridSettings />
    </div>
    
    <div v-if="activeService === 'smtp' && hasPermission('email_smtp')">
      <SmtpSettings />
    </div>
    
    <!-- Teste de envio de email -->
    <div style="margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1.5rem;">
      <h4 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem;">Teste de Envio de Email</h4>
      
      <div style="display: flex; gap: 1rem; align-items: flex-end;">
        <div style="flex: 1;">
          <label for="testEmail" style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; color: #374151;">Email para teste</label>
          <input
            type="email"
            id="testEmail"
            v-model="testEmail"
            placeholder="seu@email.com"
            style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
          />
        </div>
        
        <button
          type="button"
          @click="sendTestEmail"
          :disabled="isSendingTest"
          style="padding: 0.5rem 1rem; background: #012928; color: white; border-radius: 0.375rem; font-weight: 500; height: 38px;"
        >
          <span v-if="isSendingTest">Enviando...</span>
          <span v-else>Enviar Email de Teste</span>
        </button>
      </div>
      
      <div v-if="testResult" style="margin-top: 1rem; padding: 1rem; border-radius: 0.375rem;" :style="{ background: testResult.success ? '#ecfdf5' : '#fef2f2' }">
        <p :style="{ color: testResult.success ? '#047857' : '#dc2626', margin: 0 }">
          {{ testResult.message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { unifiedEmailService } from '../services/unified-email.service';
import { menuPermissionsService } from '../services/menuPermissionService';
import { useAuthStore } from '../stores/auth';
import SmtpSettings from './SmtpSettings.vue';
import SendgridSettings from './SendGridSettings.vue';

// Estado do componente
const activeService = ref<'sendgrid' | 'smtp'>('sendgrid');
const testEmail = ref('');
const isSendingTest = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const authStore = useAuthStore();
const isSwitchingService = ref(false);

// Estado dos switches
const isSendgridActive = ref(false);
const isSmtpActive = ref(false);

// Verificar se o usuário tem permissão para acessar um serviço específico
const hasPermission = (permissionKey: string) => {
  const userRole = authStore.userData?.role;
  if (!userRole) return false;
  
  return menuPermissionsService.hasPermission(permissionKey, userRole);
};

// Verificar se o usuário tem permissão para pelo menos um dos serviços
const hasAnyEmailServicePermission = computed(() => {
  return hasPermission('email_sendgrid') || hasPermission('email_smtp');
});

// Atualizar o estado dos switches quando o serviço ativo muda
watch(activeService, (newService) => {
  isSendgridActive.value = newService === 'sendgrid';
  isSmtpActive.value = newService === 'smtp';
});

// Carregar o serviço ativo ao montar o componente
onMounted(async () => {
  try {
    // Carregar configurações de permissões de menu
    await menuPermissionsService.loadMenuConfig();
    
    // Carregar serviço ativo
    activeService.value = await unifiedEmailService.getActiveService();
    console.log('EmailServiceSettings: Serviço ativo carregado:', activeService.value);
    
    // Atualizar o estado dos switches
    isSendgridActive.value = activeService.value === 'sendgrid';
    isSmtpActive.value = activeService.value === 'smtp';
    
    // Se o usuário não tem permissão para o serviço ativo, mas tem para outro serviço,
    // alterar para o serviço que ele tem permissão
    if (!hasPermission(`email_${activeService.value}`)) {
      if (hasPermission('email_sendgrid')) {
        activeService.value = 'sendgrid';
        await unifiedEmailService.setActiveService('sendgrid');
        isSendgridActive.value = true;
        isSmtpActive.value = false;
      } else if (hasPermission('email_smtp')) {
        activeService.value = 'smtp';
        await unifiedEmailService.setActiveService('smtp');
        isSendgridActive.value = false;
        isSmtpActive.value = true;
      }
    }
  } catch (error) {
    console.error('EmailServiceSettings: Erro ao carregar serviço ativo:', error);
  }
});

// Alternar entre serviços de email
const toggleEmailService = async (service: 'sendgrid' | 'smtp') => {
  try {
    // Verificar se o usuário tem permissão para este serviço
    if (!hasPermission(`email_${service}`)) {
      console.error(`EmailServiceSettings: Usuário não tem permissão para o serviço ${service}`);
      return;
    }
    
    // Evitar múltiplas alterações simultâneas
    if (isSwitchingService.value) return;
    
    isSwitchingService.value = true;
    
    // Se estamos ativando o serviço que já está ativo, não fazer nada
    if (service === activeService.value) {
      isSwitchingService.value = false;
      return;
    }
    
    // Atualizar o serviço ativo
    activeService.value = service;
    
    // Atualizar os switches
    isSendgridActive.value = service === 'sendgrid';
    isSmtpActive.value = service === 'smtp';
    
    // Salvar a configuração
    await unifiedEmailService.setActiveService(service);
    console.log('EmailServiceSettings: Serviço alterado para:', service);
    
    // Mostrar mensagem de sucesso
    testResult.value = {
      success: true,
      message: `Serviço de email alterado para ${service === 'sendgrid' ? 'SendGrid' : 'SMTP'} com sucesso!`
    };
    
    // Limpar a mensagem após 3 segundos
    setTimeout(() => {
      if (testResult.value?.success) {
        testResult.value = null;
      }
    }, 3000);
  } catch (error: any) {
    console.error('EmailServiceSettings: Erro ao alterar serviço:', error);
    
    // Mostrar mensagem de erro
    testResult.value = {
      success: false,
      message: `Erro ao alterar serviço: ${error.message || 'Erro desconhecido'}`
    };
  } finally {
    isSwitchingService.value = false;
  }
};

// Enviar email de teste
const sendTestEmail = async () => {
  if (!testEmail.value) {
    testResult.value = {
      success: false,
      message: 'Por favor, informe um email para teste.'
    };
    return;
  }
  
  isSendingTest.value = true;
  testResult.value = null;
  
  try {
    const result = await unifiedEmailService.sendTestEmail(testEmail.value);
    testResult.value = result;
    console.log('EmailServiceSettings: Resultado do teste de email:', result);
  } catch (error: any) {
    console.error('EmailServiceSettings: Erro ao enviar email de teste:', error);
    testResult.value = {
      success: false,
      message: `Erro ao enviar email de teste: ${error.message || 'Erro desconhecido'}`
    };
  } finally {
    isSendingTest.value = false;
  }
};
</script>
