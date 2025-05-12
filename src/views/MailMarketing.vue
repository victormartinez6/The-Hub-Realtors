<template>
  <div class="mail-marketing-container">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4 main-card" elevation="3" rounded="lg">
            <v-card-title class="d-flex align-center card-header">
              <v-icon color="#012928" size="28" class="mr-3">mdi-email-send</v-icon>
              <span class="text-h5 font-weight-medium">Mail Marketing</span>
              <v-spacer></v-spacer>
            </v-card-title>
            
            <v-card-text class="px-4 py-5">
              <!-- Informações do remetente -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-5 section-card" rounded="lg">
                    <v-card-title class="section-header d-flex align-center py-4 px-4">
                      <v-icon color="#012928" class="mr-2">mdi-account-outline</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Remetente</span>
                      <v-chip
                        size="small"
                        :color="activeService === 'smtp' ? '#1976D2' : '#4CAF50'"
                        class="ml-3"
                        text-color="white"
                        pill
                        elevation="1"
                      >
                        <v-icon start size="small">
                          {{ activeService === 'smtp' ? 'mdi-email-outline' : 'mdi-send' }}
                        </v-icon>
                        {{ activeService === 'smtp' ? 'SMTP' : 'SendGrid' }}
                      </v-chip>
                    </v-card-title>
                    <v-card-text class="px-4 py-4">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            id="fromName"
                            name="fromName"
                            v-model="fromName"
                            label="Nome do remetente"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account"
                            hide-details="auto"
                            class="rounded-lg"
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
                            prepend-inner-icon="mdi-email-outline"
                            hide-details="auto"
                            class="rounded-lg"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Template e assunto -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-5 section-card" rounded="lg">
                    <v-card-title class="section-header d-flex align-center py-4 px-4">
                      <v-icon color="#012928" class="mr-2">mdi-file-document-outline</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Template e Assunto</span>
                    </v-card-title>
                    <v-card-text class="px-4 py-4">
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
                            prepend-inner-icon="mdi-file-document-outline"
                            :hint="templates.length === 0 ? 'Nenhum template encontrado. Crie templates na página de Templates de Email.' : ''"
                            persistent-hint
                            class="rounded-lg"
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
                            prepend-inner-icon="mdi-format-title"
                            hide-details="auto"
                            class="rounded-lg"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Destinatários -->
              <v-row>
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-5 section-card" rounded="lg">
                    <v-card-title class="section-header d-flex align-center py-4 px-4">
                      <v-icon color="#012928" class="mr-2">mdi-account-group-outline</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Destinatários</span>
                    </v-card-title>
                    <v-card-text class="px-4 py-4">
                      <v-radio-group 
                        id="recipientType" 
                        name="recipientType" 
                        v-model="recipientType" 
                        inline
                        class="recipient-options mb-3"
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

                      <v-expand-transition>
                        <div v-if="recipientType === 'manual'" class="mt-3">
                          <v-textarea
                            id="manualEmails"
                            name="manualEmails"
                            v-model="manualEmails"
                            label="Lista de emails"
                            variant="outlined"
                            density="comfortable"
                            hint="Digite um email por linha ou separados por vírgula"
                            rows="5"
                            class="rounded-lg"
                            prepend-inner-icon="mdi-email-multiple-outline"
                            auto-grow
                            counter
                          ></v-textarea>
                        </div>
                      </v-expand-transition>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Botões de ação -->
              <v-row>
                <v-col cols="12" class="d-flex justify-end">
                  <v-btn
                    color="#012928"
                    size="large"
                    prepend-icon="mdi-email-send"
                    @click="sendEmails"
                    :loading="isSending"
                    :disabled="!selectedTemplate || !subject"
                    elevation="2"
                    class="send-btn px-6 py-3 mb-4"
                  >
                    <span class="font-weight-medium">Fazer Envio</span>
                    <template v-if="isSending" v-slot:append>
                      <span class="text-caption ml-2">{{ Math.round(sendingProgress) }}%</span>
                    </template>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Histórico de Emails -->
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4 history-card" elevation="3" rounded="lg">
            <v-card-title class="d-flex align-center card-header py-4 px-4">
              <v-icon color="#012928" size="28" class="mr-3">mdi-email-multiple</v-icon>
              <span class="text-h5 font-weight-medium">Histórico de Emails</span>
              <v-spacer></v-spacer>
              
              <v-btn
                color="#012928"
                variant="outlined"
                @click="refreshHistory"
                :loading="isLoadingHistory"
                prepend-icon="mdi-refresh"
                class="refresh-btn"
                rounded="lg"
              >
                Atualizar
              </v-btn>
            </v-card-title>
            
            <v-card-text class="px-4 py-5">
              <v-data-table
                :headers="historyHeaders"
                :items="emailHistory"
                :loading="isLoadingHistory"
                :items-per-page="10"
                class="history-table rounded-lg"
                :loading-text="'Carregando histórico...'"
                :no-data-text="'Nenhum email enviado ainda'"
              >
                <template v-slot:item.timestamp="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="small" color="grey" class="mr-2">mdi-clock-outline</v-icon>
                    {{ formatDate(item.timestamp) }}
                  </div>
                </template>
                
                <template v-slot:item.subject="{ item }">
                  <div class="text-truncate" style="max-width: 250px;">
                    {{ item.subject }}
                  </div>
                </template>
                
                <template v-slot:item.to="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="small" color="grey" class="mr-2">mdi-account-outline</v-icon>
                    <span class="text-caption">{{ Array.isArray(item.to) ? item.to.length : 1 }} destinatário(s)</span>
                  </div>
                </template>
                
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getStatusColor(item.status)"
                    size="small"
                    variant="outlined"
                    class="status-chip"
                    :prepend-icon="getStatusIcon(item.status)"
                  >
                    {{ getStatusText(item.status) }}
                  </v-chip>
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="#012928"
                    @click="showDetails(item)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Modal de detalhes do email -->
    <v-dialog
      v-model="detailsDialog"
      max-width="800px"
      transition="dialog-bottom-transition"
    >
      <v-card v-if="selectedEmail" class="email-details-card" rounded="lg">
        <v-card-title class="email-details-header d-flex align-center py-4 px-4">
          <v-icon color="#012928" size="24" class="mr-3">mdi-email-open-outline</v-icon>
          <span class="text-h6 font-weight-medium">Detalhes do Email</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="detailsDialog = false"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="px-4 py-4">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <div class="detail-label">Assunto</div>
                <div class="detail-value">{{ selectedEmail.subject }}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Data de Envio</div>
                <div class="detail-value d-flex align-center">
                  <v-icon size="small" color="grey" class="mr-2">mdi-clock-outline</v-icon>
                  {{ formatDate(selectedEmail.timestamp) }}
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <v-chip
                    :color="getStatusColor(selectedEmail.status)"
                    size="small"
                    variant="outlined"
                    :prepend-icon="getStatusIcon(selectedEmail.status)"
                  >
                    {{ getStatusText(selectedEmail.status) }}
                  </v-chip>
                </div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <div class="detail-item">
                <div class="detail-label">De</div>
                <div class="detail-value d-flex align-center">
                  <v-icon size="small" color="grey" class="mr-2">mdi-account-outline</v-icon>
                  {{ selectedEmail.fromName }} &lt;{{ selectedEmail.fromEmail }}&gt;
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Template</div>
                <div class="detail-value d-flex align-center">
                  <v-icon size="small" color="grey" class="mr-2">mdi-file-document-outline</v-icon>
                  {{ selectedEmail.templateName || 'N/A' }}
                </div>
              </div>
            </v-col>
          </v-row>
          
          <v-divider class="my-4"></v-divider>
          
          <v-row>
            <v-col cols="12">
              <div class="detail-label mb-2">Destinatários</div>
              <v-card variant="outlined" class="recipients-list rounded-lg" flat>
                <v-list density="compact" class="pa-0">
                  <v-list-item v-for="(recipient, index) in Array.isArray(selectedEmail.to) ? selectedEmail.to : [selectedEmail.to]" :key="index" class="recipient-item">
                    <template v-slot:prepend>
                      <v-icon size="small" color="#012928">mdi-email-outline</v-icon>
                    </template>
                    <v-list-item-title>{{ recipient }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
          
          <v-divider class="my-4"></v-divider>
          
          <v-row>
            <v-col cols="12">
              <div class="detail-label mb-2">Conteúdo do Email</div>
              <v-card variant="outlined" class="email-content-preview rounded-lg" flat>
                <div class="email-preview pa-4" v-html="selectedEmail.html"></div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { sendGridService } from '../services/sendgrid.service';
import { unifiedEmailService } from '../services/unified-email.service';
import { smtpService } from '../services/smtp.service';
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
const recipientType = ref('manual');
const manualEmails = ref('');

// Estado para envio
const isSending = ref(false);
const sendingProgress = ref(0);

// Estado para histórico
const emailHistory = ref([]);
const isLoadingHistory = ref(false);
const detailsDialog = ref(false);
const selectedEmail = ref(null);

// Cabeçalhos para a tabela de histórico
const historyHeaders = [
  { title: 'Data', key: 'timestamp', sortable: true },
  { title: 'Assunto', key: 'subject', sortable: true },
  { title: 'Destinatários', key: 'recipientCount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false }
];

// Carregar configurações de email
async function loadEmailSettings() {
  try {
    // Obter o serviço ativo (método assíncrono)
    activeService.value = await unifiedEmailService.getActiveService();
    console.log('%c[Mail Marketing] Serviço de email ativo:', 'color: #4CAF50; font-weight: bold', activeService.value);
    
    // Carregar configurações do serviço ativo
    if (activeService.value === 'smtp') {
      // Usar getConfig para obter as configurações SMTP específicas do usuário
      const smtpConfig = await smtpService.getConfig();
      fromName.value = smtpConfig?.fromName || '';
      fromEmail.value = smtpConfig?.fromEmail || '';
      console.log('%c[Mail Marketing] Configurações SMTP carregadas para o usuário atual', 'color: #2196F3', smtpConfig);
    } else {
      // SendGrid (configurações globais)
      const sendgridConfig = await loadSendGridConfig();
      fromName.value = sendgridConfig?.fromName || '';
      fromEmail.value = sendgridConfig?.fromEmail || '';
      console.log('%c[Mail Marketing] Configurações SendGrid carregadas (globais)', 'color: #2196F3');
    }
  } catch (error) {
    console.error('%c[Mail Marketing] Erro ao carregar configurações de email:', 'color: #F44336', error);
  }
}

// Carregar templates de email
async function loadTemplates() {
  try {
    const allTemplates = await emailTemplateService.getTemplates();
    templates.value = allTemplates;
  } catch (error) {
    console.error('Erro ao carregar templates:', error);
    templates.value = [];
  }
}

// Processar lista de emails manuais
function processManualEmails(emailsText) {
  if (!emailsText) return [];
  
  // Dividir por vírgula ou quebra de linha
  const emailList = emailsText.split(/[,\n]/)
    .map(email => email.trim())
    .filter(email => email && email.includes('@'));
  
  return emailList;
}

// Obter todos os leads
async function getAllLeads() {
  try {
    const leadsRef = collection(db, 'leads');
    const snapshot = await getDocs(leadsRef);
    
    const leads = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.email) {
        leads.push(data.email);
      }
    });
    
    return leads;
  } catch (error) {
    console.error('Erro ao carregar leads:', error);
    return [];
  }
}

// Enviar emails
async function sendEmails() {
  if (isSending.value) return;
  
  isSending.value = true;
  sendingProgress.value = 0;
  
  try {
    // Validar campos obrigatórios
    if (!selectedTemplate.value) {
      throw new Error('Selecione um template');
    }
    
    if (!subject.value) {
      throw new Error('Informe o assunto do email');
    }
    
    // Obter destinatários
    let recipients = [];
    if (recipientType.value === 'all') {
      recipients = await getAllLeads();
      console.log(`Carregados ${recipients.length} leads como destinatários`);
    } else {
      recipients = processManualEmails(manualEmails.value);
      console.log(`Processados ${recipients.length} emails manuais`);
    }
    
    if (recipients.length === 0) {
      throw new Error('Nenhum destinatário válido encontrado');
    }
    
    // Log do número de destinatários
    console.log(`Preparando envio para ${recipients.length} destinatários`);
    
    // Carregar o template
    console.log('Carregando template ID:', selectedTemplate.value);
    const template = await emailTemplateService.getTemplate(selectedTemplate.value);
    
    // Verificar se o template foi carregado corretamente
    console.log('Template carregado completo:', template);
    
    if (!template) {
      throw new Error('Template não encontrado');
    }
    
    // Verificar se o template tem conteúdo HTML
    if (!template.html) {
      console.error('Template sem conteúdo HTML:', template);
      
      // Se tiver componentes, tentar gerar o HTML como fallback
      if (template.components && template.components.length > 0) {
        console.log('Tentando gerar HTML a partir dos componentes como fallback');
        template.html = generateHtmlFromComponents(template.components);
        console.log('HTML de fallback gerado');
      } else {
        throw new Error('O template não possui conteúdo HTML');
      }
    } else {
      console.log('Usando HTML pré-gerado do template');
    }
    
    console.log('Template carregado:', template.name);
    console.log('HTML do template (primeiros 100 caracteres):', template.html.substring(0, 100) + '...');
    
    // Preparar dados do email
    const emailData = {
      to: recipients,
      from: {
        name: fromName.value,
        email: fromEmail.value
      },
      subject: subject.value,
      html: template.html,
      text: stripHtml(template.html)
    };
    
    // Logs detalhados para depuração
    console.log('DADOS DO EMAIL (DETALHADOS):', {
      to: emailData.to,
      from: emailData.from,
      subject: emailData.subject,
      html: emailData.html ? emailData.html.substring(0, 100) + '...' : 'Vazio',
      text: emailData.text ? emailData.text.substring(0, 100) + '...' : 'Vazio',
      htmlLength: emailData.html ? emailData.html.length : 0,
      textLength: emailData.text ? emailData.text.length : 0
    });
    
    console.log('Dados do email preparados:', {
      to: Array.isArray(emailData.to) ? `${emailData.to.length} destinatários` : emailData.to,
      from: `${emailData.from.name} <${emailData.from.email}>`,
      subject: emailData.subject
    });
    
    // Enviar o email usando o serviço ativo (SMTP ou SendGrid)
    console.log(`Enviando email via serviço ativo: ${activeService.value.toUpperCase()}`);
    const result = await unifiedEmailService.sendEmail(emailData);
    
    console.log('Resultado do envio:', result);
    
    if (result.success) {
      // Salvar no histórico
      saveToHistory({
        ...emailData,
        templateId: selectedTemplate.value,
        templateName: template.name,
        fromName: fromName.value,
        fromEmail: fromEmail.value,
        recipientCount: recipients.length
      });
      
      alert(`Email enviado com sucesso para ${recipients.length} destinatário${recipients.length > 1 ? 's' : ''}!`);
    } else {
      throw new Error(`Falha no envio: ${result.message || 'Erro desconhecido'}`);
    }
  } catch (error) {
    console.error('[Mail Marketing] Erro ao enviar emails:', error);
    alert(`Erro ao enviar emails: ${error.message || 'Erro desconhecido'}`);
  } finally {
    isSending.value = false;
    sendingProgress.value = 0;
  }
}

// Função para remover HTML do conteúdo
function stripHtml(html) {
  if (!html) return '';
  
  // Remover tags HTML de forma simples
  return html.replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Função para gerar HTML a partir dos componentes do template
function generateHtmlFromComponents(components) {
  console.log('%c[Mail Marketing] Gerando HTML a partir dos componentes', 'color: #4CAF50');
  
  if (!components || components.length === 0) {
    console.warn('%c[Mail Marketing] Sem componentes para gerar HTML', 'color: #FF9800');
    return '<p>Sem conteúdo</p>';
  }
  
  try {
    // Cabeçalho do email com estilos embutidos para melhor compatibilidade
    let htmlContent = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>The Hub Realtors</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; background-color: #f5f5f5;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td align="center" style="padding: 40px 30px;">
    `;
    
    // Processar cada componente
    components.forEach(component => {
      console.log(`%c[Mail Marketing] Processando componente: ${component.type}`, 'color: #2196F3');
      
      switch (component.type) {
        case 'text':
          htmlContent += `<div style="margin-bottom: 20px; line-height: 1.6; color: #333333; font-size: 16px; text-align: left;">${component.content || ''}</div>`;
          break;
          
        case 'image':
          // Verificar e corrigir URLs de imagens
          let imgSrc = component.src || '';
          
          // Verificar se a URL é absoluta
          if (imgSrc && !imgSrc.startsWith('http://') && !imgSrc.startsWith('https://')) {
            // Se for uma URL relativa, tentar convertê-la em absoluta
            if (imgSrc.startsWith('/')) {
              // URL relativa ao domínio
              const baseUrl = window.location.origin;
              imgSrc = `${baseUrl}${imgSrc}`;
              console.log(`%c[Mail Marketing] URL de imagem convertida para absoluta: ${imgSrc}`, 'color: #4CAF50');
            } else {
              // URL relativa ao caminho atual
              const baseUrl = window.location.origin + window.location.pathname;
              imgSrc = `${baseUrl.substring(0, baseUrl.lastIndexOf('/'))}/${imgSrc}`;
              console.log(`%c[Mail Marketing] URL de imagem convertida para absoluta: ${imgSrc}`, 'color: #4CAF50');
            }
          }
          
          // Adicionar a imagem com estilos para melhor compatibilidade
          htmlContent += `
            <div style="margin-bottom: 20px; text-align: center;">
              <img src="${imgSrc}" alt="${component.alt || 'Imagem'}" style="max-width: 100%; height: auto; border: 0; display: block; margin: 0 auto;" />
            </div>
          `;
          break;
          
        case 'button':
          // Garantir que o link seja absoluto
          let buttonLink = component.link || '#';
          if (buttonLink !== '#' && !buttonLink.startsWith('http://') && !buttonLink.startsWith('https://')) {
            if (buttonLink.startsWith('/')) {
              buttonLink = `${window.location.origin}${buttonLink}`;
            } else {
              buttonLink = `${window.location.origin}/${buttonLink}`;
            }
          }
          
          // Botão com design compatível com a maioria dos clientes de email
          htmlContent += `
            <div style="margin-bottom: 20px; text-align: center;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${buttonLink}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#012928" fillcolor="#012928">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${component.text || 'Clique aqui'}</center>
              </v:roundrect>
              <![endif]-->
              <a href="${buttonLink}" style="background-color:#012928;border-radius:4px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:16px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;mso-hide:all;">${component.text || 'Clique aqui'}</a>
            </div>
          `;
          break;
          
        case 'divider':
          htmlContent += `<div style="margin: 30px 0; height: 1px; background-color: #eeeeee;"></div>`;
          break;
          
        case 'heading':
          const headingLevel = component.level || 2;
          const fontSize = headingLevel === 1 ? '28px' : headingLevel === 2 ? '24px' : '20px';
          const fontWeight = 'bold';
          
          htmlContent += `<div style="margin-bottom: 20px; color: #012928; font-size: ${fontSize}; font-weight: ${fontWeight}; text-align: left;">${component.content || ''}</div>`;
          break;
          
        default:
          // Para componentes desconhecidos, tentar usar o conteúdo diretamente
          if (component.content) {
            htmlContent += `<div style="margin-bottom: 15px;">${component.content}</div>`;
          }
      }
    });
    
    // Adicionar rodapé do email
    htmlContent += `
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 30px; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">&copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.</p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">Este email foi enviado por The Hub Realtors.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    // Registrar o tamanho do HTML gerado
    console.log(`%c[Mail Marketing] HTML gerado com ${htmlContent.length} caracteres`, 'color: #4CAF50');
    
    return htmlContent;
  } catch (error) {
    console.error('Erro ao gerar HTML a partir dos componentes:', error);
    return '<p>Erro ao gerar conteúdo do template</p>';
  }
}

// Funções para o histórico de emails
function refreshHistory() {
  isLoadingHistory.value = true;
  try {
    // Criar um histórico de emails vazio se não existir
    if (!localStorage.getItem('emailHistory')) {
      localStorage.setItem('emailHistory', JSON.stringify([]));
    }
    
    // Carregar o histórico de emails do localStorage
    const history = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    emailHistory.value = history;
    console.log('Histórico de emails carregado:', emailHistory.value);
  } catch (error) {
    console.error('Erro ao carregar histórico de emails:', error);
  } finally {
    isLoadingHistory.value = false;
  }
}

// Função para salvar um email no histórico
function saveToHistory(emailData, status = 'success') {
  try {
    // Obter o histórico atual
    const history = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    
    // Adicionar o novo email ao início do histórico
    history.unshift({
      ...emailData,
      status,
      timestamp: new Date().toISOString()
    });
    
    // Limitar o histórico a 100 itens
    const limitedHistory = history.slice(0, 100);
    
    // Salvar o histórico atualizado
    localStorage.setItem('emailHistory', JSON.stringify(limitedHistory));
    
    // Atualizar o histórico na tela
    refreshHistory();
  } catch (error) {
    console.error('Erro ao salvar email no histórico:', error);
  }
}

// Função para carregar as configurações do SendGrid diretamente do Firestore
async function loadSendGridConfig() {
  try {
    console.log('[Mail Marketing] Carregando configurações do SendGrid...');
    
    // Carregar do Firestore
    const docRef = doc(db, 'settings', 'sendgrid');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[Mail Marketing] Configurações do SendGrid carregadas:');
      
      return {
        apiKey: data.apiKey || '',
        fromName: data.fromName || '',
        fromEmail: data.fromEmail || ''
      };
    } else {
      console.warn('[Mail Marketing] Configurações do SendGrid não encontradas');
      return null;
    }
  } catch (error) {
    console.error('[Mail Marketing] Erro ao carregar configurações do SendGrid:', error);
    return null;
  }
}

function showDetails(email) {
  selectedEmail.value = email;
  detailsDialog.value = true;
}

function formatDate(timestamp) {
  if (!timestamp) return 'Data desconhecida';
  
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getStatusColor(status) {
  switch (status) {
    case 'success': return 'success';
    case 'error': return 'error';
    case 'pending': return 'warning';
    default: return 'info';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'success': return 'Enviado';
    case 'error': return 'Erro';
    case 'pending': return 'Pendente';
    default: return 'Desconhecido';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'success': return 'mdi-check-circle-outline';
    case 'error': return 'mdi-alert-circle-outline';
    case 'pending': return 'mdi-clock-outline';
    default: return 'mdi-information-outline';
  }
}

// Listener para mudanças no serviço de email ativo
function handleEmailServiceChange(event) {
  console.log('%c[Mail Marketing] Serviço de email alterado:', 'color: #FF9800; font-weight: bold', event.detail);
  // Recarregar as configurações quando o serviço mudar
  loadEmailSettings();
}

// Inicialização
onMounted(async () => {
  console.log('%c[Mail Marketing] Inicializando componente', 'color: #2196F3; font-weight: bold');
  try {
    // Adicionar listener para mudanças no serviço de email
    window.addEventListener('email-service-change', handleEmailServiceChange);
    
    // Carregar as configurações sequencialmente para garantir que funcionem
    console.log('%c[Mail Marketing] Carregando configurações de email...', 'color: #2196F3');
    await loadEmailSettings();
    console.log('%c[Mail Marketing] Configurações carregadas:', 'color: #4CAF50', { 
      activeService: activeService.value,
      fromName: fromName.value,
      fromEmail: fromEmail.value 
    });
    
    console.log('Carregando templates...');
    await loadTemplates();
    console.log('Templates carregados:', templates.value);
    
    // Carregar templates e histórico
  await loadTemplates();
  refreshHistory();
} catch (error) {
  console.error('%c[Mail Marketing] Erro na inicialização do componente:', 'color: #F44336', error);
}
});

// Limpeza ao desmontar o componente
onUnmounted(() => {
  // Remover o listener para evitar vazamento de memória
  window.removeEventListener('email-service-change', handleEmailServiceChange);
  console.log('%c[Mail Marketing] Componente desmontado', 'color: #607D8B');
});
</script>

<style scoped>
/* Estilos gerais */
.mail-marketing-container {
  background-color: #ffffff;
  min-height: 100vh;
}

/* Cards */
.main-card {
  border: none;
  overflow: hidden;
}

.card-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #eaeaea;
}

.section-card {
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  background-color: #f8f8f8;
  border-bottom: 1px solid #eaeaea;
}

.action-card {
  background-color: #f5f9f9;
  border: 1px solid #e0e8e8;
}

/* Botões */
.send-btn {
  transition: transform 0.2s ease;
  letter-spacing: 0.5px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.refresh-btn {
  border-radius: 8px;
}

/* Tabela de histórico */
.history-card {
  border: none;
  overflow: hidden;
}

.history-table {
  border: 1px solid #eaeaea;
  border-radius: 8px;
}

.status-chip {
  font-weight: 500;
}

/* Modal de detalhes */
.email-details-card {
  border: none;
  overflow: hidden;
}

.email-details-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #eaeaea;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #333;
}

.recipients-list {
  border: 1px solid #eaeaea;
  max-height: 150px;
  overflow-y: auto;
}

.recipient-item {
  border-bottom: 1px solid #f0f0f0;
}

.recipient-item:last-child {
  border-bottom: none;
}

.email-content-preview {
  border: 1px solid #eaeaea;
}

.email-preview {
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
}
</style>
