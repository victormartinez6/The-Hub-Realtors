<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-xl font-medium text-gray-900 mb-4">Teste de Envio de Email (SendGrid)</h3>
    
    <div class="grid grid-cols-1 gap-6">
      <div>
        <label for="toEmail" class="block text-sm font-medium text-gray-700 mb-1">Destinatário (To)</label>
        <input
          type="email"
          id="toEmail"
          v-model="emailData.to"
          placeholder="destinatario@exemplo.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
        />
        <p class="mt-1 text-xs text-gray-500">Email do destinatário</p>
      </div>

      <div>
        <label for="fromEmail" class="block text-sm font-medium text-gray-700 mb-1">Remetente (From)</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <input
              type="email"
              id="fromEmail"
              v-model="emailData.from.email"
              placeholder="remetente@exemplo.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
            />
            <p class="mt-1 text-xs text-gray-500">Email do remetente</p>
          </div>
          <div>
            <input
              type="text"
              id="fromName"
              v-model="emailData.from.name"
              placeholder="Nome do Remetente"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
            />
            <p class="mt-1 text-xs text-gray-500">Nome do remetente</p>
          </div>
        </div>
      </div>

      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Assunto (Subject)</label>
        <input
          type="text"
          id="subject"
          v-model="emailData.subject"
          placeholder="Assunto do email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
        <div class="flex space-x-3 mb-2">
          <button 
            @click="activeTab = 'text'"
            :class="[
              'px-3 py-1 text-sm rounded-md',
              activeTab === 'text' 
                ? 'bg-[#451A37] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            Texto Simples
          </button>
          <button 
            @click="activeTab = 'html'"
            :class="[
              'px-3 py-1 text-sm rounded-md',
              activeTab === 'html' 
                ? 'bg-[#451A37] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            HTML
          </button>
        </div>

        <div v-if="activeTab === 'text'">
          <textarea
            v-model="emailData.text"
            rows="6"
            placeholder="Conteúdo em texto simples"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37]"
          ></textarea>
        </div>

        <div v-if="activeTab === 'html'">
          <textarea
            v-model="emailData.html"
            rows="6"
            placeholder="Conteúdo em HTML"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#451A37] font-mono text-sm"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-col space-y-4">
      <div class="flex space-x-4">
        <button
          @click="sendEmail"
          :disabled="isSending || !isFormValid"
          class="px-4 py-2 bg-[#451A37] text-white rounded-md hover:bg-[#733F63] focus:outline-none focus:ring-2 focus:ring-[#451A37] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isSending" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {{ isSending ? 'Enviando...' : 'Enviar Email' }}
        </button>

        <button
          @click="resetForm"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpar
        </button>
      </div>

      <div v-if="result" class="p-4 rounded-md" :class="result.success ? 'bg-green-50' : 'bg-red-50'">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg v-if="result.success" class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-grow">
            <p :class="result.success ? 'text-green-700' : 'text-red-700'" class="font-medium">
              {{ result.success ? 'Email enviado com sucesso!' : 'Erro ao enviar email' }}
            </p>
            <p class="mt-1 text-sm" :class="result.success ? 'text-green-600' : 'text-red-600'">
              {{ result.message }}
            </p>
            <div v-if="result.data" class="mt-3 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-40">
              <p class="font-semibold mb-1">Detalhes da resposta:</p>
              <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { sendgridSimpleService, type EmailResult } from '../services/sendgrid-simple.service';

// Estado do componente
const activeTab = ref('text');
const isSending = ref(false);
const result = ref<EmailResult | null>(null);

// Dados do email
const emailData = reactive({
  to: '',
  from: {
    email: 'contato@thehub.com.br',
    name: 'The Hub Realtors'
  },
  subject: '',
  text: '',
  html: ''
});

// Verificar se o formulário é válido
const isFormValid = computed(() => {
  return (
    emailData.to.trim() !== '' &&
    emailData.from.email.trim() !== '' &&
    emailData.subject.trim() !== ''
    // Não validamos o conteúdo aqui, pois adicionaremos um espaço se estiver vazio
  );
});

// Enviar email
async function sendEmail() {
  // Verificar se o formulário é válido antes de enviar
  if (!isFormValid.value) {
    result.value = {
      success: false,
      message: 'Preencha todos os campos obrigatórios'
    };
    return;
  }
  
  isSending.value = true;
  result.value = null;
  
  try {
    // Garantir que pelo menos um dos conteúdos (texto ou HTML) tenha pelo menos um caractere
    // Isso é necessário porque o SendGrid exige que pelo menos um dos campos tenha conteúdo
    let textContent = emailData.text || '';
    let htmlContent = emailData.html || '';
    
    // Se ambos estiverem vazios, adicionar um espaço em branco ao conteúdo ativo
    if (textContent.trim() === '' && htmlContent.trim() === '') {
      console.log('Conteúdo vazio detectado, adicionando conteúdo padrão');
      if (activeTab.value === 'text') {
        textContent = 'Conteúdo do email';
      } else {
        htmlContent = '<p>Conteúdo do email</p>';
      }
    }
    
    // Preparar dados do email
    const data = {
      to: emailData.to,
      from: {
        email: emailData.from.email,
        name: emailData.from.name
      },
      subject: emailData.subject,
      text: textContent,
      html: htmlContent
    };
    
    // Enviar email usando o serviço simplificado do SendGrid
    const emailResult = await sendgridSimpleService.sendEmail(data);
    
    result.value = emailResult;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    result.value = {
      success: false,
      message: 'Erro ao enviar email. Verifique o console para mais detalhes.'
    };
  } finally {
    isSending.value = false;
  }
};

// Limpar formulário
const resetForm = () => {
  emailData.to = '';
  emailData.subject = '';
  emailData.text = '';
  emailData.html = '';
  result.value = null;
};
</script>
