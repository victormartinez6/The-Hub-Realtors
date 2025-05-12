<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon color="#012928" class="mr-2">mdi-email-send</v-icon>
              <span>Mail Marketing</span>
              <v-spacer></v-spacer>
            </v-card-title>
            
            <v-card-text>
              <!-- Informações do remetente -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-1">
                      Remetente
                      <v-chip
                        size="small"
                        color="#012928"
                        class="ml-2"
                        text-color="white"
                      >
                        {{ activeService === 'smtp' ? 'SMTP' : 'SendGrid' }}
                      </v-chip>
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            id="fromName"
                            name="fromName"
                            v-model="fromName"
                            label="Nome do remetente"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            id="fromEmail"
                            name="fromEmail"
                            v-model="fromEmail"
                            label="Email do remetente"
                            variant="outlined"
                            density="comfortable"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Template e assunto -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    id="selectedTemplate"
                    name="selectedTemplate"
                    v-model="selectedTemplate"
                    :items="templates"
                    item-title="name"
                    item-value="id"
                    label="Selecione um template"
                    variant="outlined"
                    density="comfortable"
                    :hint="templates.length === 0 ? 'Nenhum template encontrado. Crie templates na página de Templates de Email.' : ''"
                    persistent-hint
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    id="subject"
                    name="subject"
                    v-model="subject"
                    label="Assunto do email"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Destinatários -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-1">
                      Destinatários
                    </v-card-title>
                    <v-card-text>
                      <v-radio-group 
                        id="recipientType" 
                        name="recipientType" 
                        v-model="recipientType" 
                        inline
                      >
                        <v-radio
                          label="Todos os leads"
                          value="all"
                          color="#012928"
                        ></v-radio>
                        <v-radio
                          label="Emails manuais"
                          value="manual"
                          color="#012928"
                        ></v-radio>
                      </v-radio-group>

                      <!-- Emails manuais -->
                      <div v-if="recipientType === 'manual'" class="mt-4">
                        <v-textarea
                          id="manualEmails"
                          name="manualEmails"
                          v-model="manualEmails"
                          label="Lista de emails"
                          variant="outlined"
                          density="comfortable"
                          hint="Digite um email por linha ou separados por vírgula"
                          rows="5"
                        ></v-textarea>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Opções avançadas -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-1">
                      Opções avançadas
                    </v-card-title>
                    <v-card-text>
                      <v-switch
                        v-model="testMode"
                        label="Modo de teste (simula o envio sem conexão real)"
                        color="#012928"
                        hide-details
                      ></v-switch>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Botões de ação -->
              <v-row>
                <v-col cols="12" class="d-flex justify-end">
                  <v-btn
                    color="#012928"
                    variant="text"
                    class="mr-2"
                    @click="resetForm"
                  >
                    Limpar
                  </v-btn>
                  <v-btn
                    color="#012928"
                    @click="saveEmailSettings"
                    class="mr-2"
                  >
                    Salvar Configurações
                  </v-btn>
                  <v-btn
                    color="#012928"
                    @click="sendEmails"
                    :loading="isSending"
                    :disabled="!selectedTemplate || !subject"
                  >
                    {{ testMode ? 'Testar Envio' : 'Enviar Emails' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { unifiedEmailService } from '../services/unified-email.service';
import { smtpService } from '../services/smtp.service';
import { sendgridSimpleService } from '../services/sendgrid-simple.service';
import emailTemplateService from '../services/emailTemplate.service';

// Estado do serviço de email e remetente
const activeService = ref('sendgrid'); // Valor padrão
const fromName = ref('');
const fromEmail = ref('');

// Estado para templates
const templates = ref([]);
const selectedTemplate = ref(null);
const subject = ref('');

// Estado para destinatários
const recipientType = ref('all');
const manualEmails = ref('');

// Estado para controle de envio
const isSending = ref(false);
const sendingProgress = ref(0);
const testMode = ref(true); // Modo de teste ativado por padrão

// Auth store
const authStore = useAuthStore();

// Carregar configurações de email do usuário
async function loadEmailSettings() {
  try {
    console.log('Iniciando carregamento das configurações de email...');
    const userId = authStore.user?.uid;
    
    if (!userId) {
      console.warn('Usuário não autenticado');
      // Definir valores padrão mesmo sem usuário autenticado
      fromName.value = 'The Hub Realtors';
      fromEmail.value = 'contato@thehub.com.br';
      return;
    }
    
    console.log('Usuário autenticado:', userId);
    
    // Carregar diretamente as configurações do SMTP e SendGrid
    try {
      console.log('Carregando configurações do SMTP...');
      const smtpConfig = await smtpService.getConfig();
      console.log('Configurações do SMTP carregadas:', smtpConfig);
      
      // Verificar se as configurações do SMTP têm os dados do remetente
      if (smtpConfig && smtpConfig.fromName && smtpConfig.fromEmail) {
        console.log('Usando configurações do SMTP para o remetente');
        fromName.value = smtpConfig.fromName;
        fromEmail.value = smtpConfig.fromEmail;
      }
    } catch (smtpError) {
      console.warn('Erro ao carregar configurações do SMTP:', smtpError);
    }
    
    try {
      console.log('Carregando configurações do SendGrid...');
      const sendgridRef = doc(db, 'settings', 'sendgrid');
      const sendgridSnap = await getDoc(sendgridRef);
      
      if (sendgridSnap.exists()) {
        const sendgridConfig = sendgridSnap.data();
        console.log('Configurações do SendGrid carregadas:', sendgridConfig);
        
        // Se não tiver dados do SMTP ou se o SendGrid for o serviço ativo
        if ((!fromName.value || !fromEmail.value) || activeService.value === 'sendgrid') {
          console.log('Usando configurações do SendGrid para o remetente');
          fromName.value = sendgridConfig.fromName || 'The Hub Realtors';
          fromEmail.value = sendgridConfig.fromEmail || 'contato@thehub.com.br';
        }
      }
    } catch (sendgridError) {
      console.warn('Erro ao carregar configurações do SendGrid:', sendgridError);
    }
    
    // Se ainda não tiver valores definidos, usar padrões
    if (!fromName.value || !fromEmail.value) {
      console.log('Usando valores padrão para o remetente');
      fromName.value = 'The Hub Realtors';
      fromEmail.value = 'contato@thehub.com.br';
    }
    
    // Obter o serviço ativo do usuário (após carregar as configurações)
    try {
      activeService.value = await unifiedEmailService.getActiveService();
      console.log('Serviço ativo:', activeService.value);
    } catch (serviceError) {
      console.warn('Erro ao obter serviço ativo:', serviceError);
      // Valor padrão
      activeService.value = 'sendgrid';
    }
    
    console.log('Configurações finais do remetente:', {
      activeService: activeService.value,
      fromName: fromName.value,
      fromEmail: fromEmail.value
    });
  } catch (error) {
    console.error('Erro ao carregar configurações de email:', error);
    // Valores padrão em caso de erro
    fromName.value = 'The Hub Realtors';
    fromEmail.value = 'contato@thehub.com.br';
    activeService.value = 'sendgrid';
  }
}

// Salvar configurações de email do usuário
async function saveEmailSettings() {
  try {
    const userId = authStore.user?.uid;
    
    if (!userId) {
      console.warn('Usuário não autenticado');
      return;
    }
    
    // Obter o serviço ativo atual (para garantir que está sincronizado)
    const currentActiveService = await unifiedEmailService.getActiveService();
    
    // Salvar configuração específica do usuário
    const userSettingRef = doc(db, 'user_email_settings', userId);
    await setDoc(userSettingRef, {
      activeService: currentActiveService,
      fromName: fromName.value,
      fromEmail: fromEmail.value,
      updatedAt: new Date()
    });
    
    // Atualizar as configurações do serviço ativo
    if (currentActiveService === 'smtp') {
      try {
        const smtpConfig = await smtpService.getConfig();
        await smtpService.saveConfig({
          ...smtpConfig,
          fromName: fromName.value,
          fromEmail: fromEmail.value
        });
        console.log('Configurações do SMTP atualizadas');
      } catch (smtpError) {
        console.warn('Não foi possível atualizar as configurações do SMTP:', smtpError);
      }
    } else if (currentActiveService === 'sendgrid') {
      try {
        // Buscar configurações atuais do SendGrid
        const sendgridRef = doc(db, 'settings', 'sendgrid');
        const sendgridSnap = await getDoc(sendgridRef);
        
        if (sendgridSnap.exists()) {
          const sendgridConfig = sendgridSnap.data();
          // Atualizar apenas os campos de remetente
          await setDoc(sendgridRef, {
            ...sendgridConfig,
            fromName: fromName.value,
            fromEmail: fromEmail.value,
            updatedAt: new Date()
          });
          console.log('Configurações do SendGrid atualizadas');
        } else {
          // Criar configuração inicial
          await setDoc(sendgridRef, {
            fromName: fromName.value,
            fromEmail: fromEmail.value,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log('Configurações iniciais do SendGrid criadas');
        }
      } catch (sendgridError) {
        console.warn('Não foi possível atualizar as configurações do SendGrid:', sendgridError);
      }
    }
    
    console.log('Configurações de email salvas com sucesso');
    alert('Configurações de email salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar configurações de email:', error);
    alert(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`);
  }
}

// Carregar templates
async function loadTemplates() {
  try {
    console.log('Iniciando carregamento de templates...');
    const userId = authStore.user?.uid;
    
    if (!userId) {
      console.warn('Usuário não autenticado, não é possível carregar templates');
      return;
    }
    
    // Buscar templates do usuário usando o serviço
    const userTemplates = await emailTemplateService.getTemplates();
    console.log(`Carregados ${userTemplates.length} templates do usuário:`, userTemplates);
    
    // Atualizar a lista de templates
    templates.value = userTemplates;
    
    // Se não houver templates, mostrar mensagem no console
    if (userTemplates.length === 0) {
      console.log('Nenhum template encontrado para o usuário. Crie templates na página de Templates de Email.');
    }
  } catch (error) {
    console.error('Erro ao carregar templates:', error);
    // Em caso de erro, definir uma lista vazia
    templates.value = [];
  }
}

// Métodos para ações
function resetForm() {
  // Não resetar fromName e fromEmail, pois são configurações do usuário
  selectedTemplate.value = null;
  subject.value = '';
  recipientType.value = 'all';
  manualEmails.value = '';
}

// Função auxiliar para processar emails manuais
function parseManualEmails(input) {
  if (!input || input.trim() === '') return [];
  
  // Dividir por vírgula ou quebra de linha
  const parts = input.split(/[,\n]/);
  
  // Filtrar emails válidos
  return parts
    .map(part => part.trim())
    .filter(part => part && part.includes('@'));
}

// Função para obter o conteúdo do template
async function getTemplateContent(templateId) {
  try {
    const template = await emailTemplateService.getTemplate(templateId);
    console.log('Template carregado:', template);
    
    // Verificar se o template tem componentes
    if (!template.components || template.components.length === 0) {
      throw new Error('O template não possui conteúdo');
    }
    
    // Processar os componentes para gerar o HTML
    let componentsHtml = '';
    
    // Tentar processar os componentes de forma mais estruturada
    try {
      template.components.forEach(component => {
        // Verificar o tipo de componente e gerar HTML adequado
        if (component.type === 'text' || component.type === 'paragraph') {
          componentsHtml += `<p style="margin-bottom: 15px; line-height: 1.5;">${component.content || component.text || ''}</p>`;
        } else if (component.type === 'heading' || component.type === 'header') {
          componentsHtml += `<h2 style="color: #012928; margin-top: 20px; margin-bottom: 10px;">${component.content || component.text || ''}</h2>`;
        } else if (component.type === 'image') {
          const imgSrc = component.src || component.url || '';
          const imgAlt = component.alt || 'Imagem';
          if (imgSrc) {
            componentsHtml += `<div style="margin: 20px 0;"><img src="${imgSrc}" alt="${imgAlt}" style="max-width: 100%; height: auto;"></div>`;
          }
        } else if (component.type === 'button') {
          const btnText = component.text || 'Clique aqui';
          const btnUrl = component.url || '#';
          componentsHtml += `<div style="margin: 20px 0;"><a href="${btnUrl}" style="display: inline-block; padding: 10px 20px; background-color: #012928; color: white; text-decoration: none; border-radius: 4px;">${btnText}</a></div>`;
        } else if (component.type === 'divider' || component.type === 'hr') {
          componentsHtml += `<hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">`;
        } else {
          // Para outros tipos de componentes, tentar extrair texto ou conteúdo
          const content = component.content || component.text || component.html || JSON.stringify(component);
          componentsHtml += `<div style="margin-bottom: 15px;">${content}</div>`;
        }
      });
    } catch (componentError) {
      console.warn('Erro ao processar componentes do template:', componentError);
      // Fallback: mostrar os componentes como JSON formatado
      componentsHtml = `<pre style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto;">${JSON.stringify(template.components, null, 2)}</pre>`;
    }
    
    // Montar o HTML completo do email
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="color: #012928; margin-bottom: 20px;">${template.name}</h1>
        
        <div style="margin-top: 20px;">
          ${componentsHtml}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>Este é um email automático, por favor não responda.</p>
          <p>© ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao obter conteúdo do template:', error);
    throw error;
  }
}

// Função para enviar emails
async function sendEmails() {
  if (!selectedTemplate.value || !subject.value) {
    alert('Selecione um template e informe o assunto do email');
    return;
  }
  
  try {
    isSending.value = true;
    sendingProgress.value = 0;
    
    console.log('Iniciando envio de emails...');
    console.log({
      fromName: fromName.value,
      fromEmail: fromEmail.value,
      template: selectedTemplate.value,
      subject: subject.value,
      recipientType: recipientType.value,
      manualEmails: manualEmails.value,
      testMode: testMode.value
    });
    
    // Obter a lista de destinatários
    let recipients = [];
    
    if (recipientType.value === 'manual') {
      // Processar emails manuais
      recipients = parseManualEmails(manualEmails.value);
      
      if (recipients.length === 0) {
        throw new Error('Nenhum email válido informado');
      }
      
      console.log(`Processados ${recipients.length} emails manuais:`, recipients);
    } else {
      // TODO: Implementar busca de todos os leads
      throw new Error('A opção "Todos os leads" ainda não está implementada');
    }
    
    // Obter o conteúdo do template
    const templateContent = await getTemplateContent(selectedTemplate.value);
    console.log('Conteúdo do template:', templateContent);
    
    // Preparar dados para o envio direto (sem depender do templateId)
    const emailData = {
      to: recipients[0], // Destinatário principal
      bcc: recipients.length > 1 ? recipients.slice(1) : [], // Outros destinatários como cópia oculta
      subject: subject.value,
      html: templateContent, // Enviar o conteúdo HTML diretamente
      from: {
        name: fromName.value,
        email: fromEmail.value
      }
    };
    
    console.log('Dados do email a ser enviado:', emailData);
    
    let result;
    
    // Verificar se está no modo de teste
    if (testMode.value) {
      // Simular o envio sem conexão real
      console.log('Modo de teste ativado, simulando envio...');
      
      // Simular um pequeno atraso para dar feedback visual
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular um resultado de sucesso
      result = {
        success: true,
        message: `Email de teste simulado para ${recipients.length} destinatário(s). No modo de teste, os emails não são realmente enviados.`,
        data: {
          to: emailData.to,
          subject: emailData.subject,
          testMode: true
        }
      };
    } else {
      // Enviar emails usando o serviço unificado (método sendEmail em vez de sendMarketingEmails)
      result = await unifiedEmailService.sendEmail(emailData);
    }
    
    console.log('Resultado do envio:', result);
    
    if (result.success) {
      alert(`${testMode.value ? 'Teste realizado' : 'Emails enviados'} com sucesso! ${result.message}`);
    } else {
      throw new Error(`Falha no envio: ${result.message}`);
    }
  } catch (error) {
    console.error('Erro ao enviar emails:', error);
    alert(`Erro ao ${testMode.value ? 'testar' : 'enviar'} emails: ${error.message || 'Erro desconhecido'}`);
  } finally {
    isSending.value = false;
    sendingProgress.value = 0;
  }
}

// Inicialização
onMounted(async () => {
  console.log('Inicializando componente Mail Marketing');
  try {
    // Carregar as configurações sequencialmente para garantir que funcionem
    console.log('Carregando configurações de email...');
    await loadEmailSettings();
    console.log('Configurações carregadas:', { 
      activeService: activeService.value,
      fromName: fromName.value,
      fromEmail: fromEmail.value 
    });
    
    console.log('Carregando templates...');
    await loadTemplates();
    console.log('Templates carregados:', templates.value);
  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
});
</script>