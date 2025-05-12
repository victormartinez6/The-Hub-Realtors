<template>
  <div class="py-4 px-4">
    <v-card class="w-100" elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 font-weight-bold">
          <v-icon size="large" color="#012928" class="me-2">mdi-email-outline</v-icon>
          Templates de Email
        </div>
        <v-btn
          color="#012928"
          prepend-icon="mdi-plus"
          @click="showNewTemplateModal = true"
          class="create-btn font-weight-medium"
          elevation="1"
        >
          Novo Template
        </v-btn>
      </v-card-title>

      <v-tabs v-model="tab" bg-color="transparent">
        <v-tab value="templates">Templates Disponíveis</v-tab>
      </v-tabs>
      
      <!-- Conteúdo principal -->

      <!-- Filtros de Busca -->
      <v-card class="filter-card" elevation="2">
        <v-card-title class="filter-header">
          <v-icon class="mr-2">mdi-filter-outline</v-icon>
          Filtros de Busca
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="searchQuery"
                label="Buscar por nome"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="applyFilters"
                class="mb-2"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="mlsIdFilter"
                label="MLS ID"
                prepend-inner-icon="mdi-pound"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="applyFilters"
                class="mb-2"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="dateFilter"
                label="Data de criação"
                prepend-inner-icon="mdi-calendar"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="applyFilters"
                class="mb-2"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Lista de Templates -->
      <v-card class="template-list-card" elevation="3">
        <v-card-title class="template-list-header">
          <v-icon class="mr-2">mdi-email-outline</v-icon>
          Templates Disponíveis
          <v-spacer></v-spacer>
          <span class="text-subtitle-2 font-weight-medium">{{ filteredTemplates.length }} templates encontrados</span>
        </v-card-title>

        <!-- Templates de Hoje -->
        <template v-if="getTodayTemplates().length > 0">
          <div class="section-header-wrapper">
            <v-subheader class="today-header">
              <v-icon class="mr-2" color="success">mdi-calendar-today</v-icon>
              Criados Hoje
            </v-subheader>
          </div>
          <v-list lines="two" class="template-list">
            <v-list-item
              v-for="template in getTodayTemplates()"
              :key="template.id"
              class="template-list-item today-item"
              rounded
            >
              <template v-slot:prepend>
                <div class="template-prepend">
                  <div class="template-icon">
                    <v-icon size="large" color="#012928">mdi-email-newsletter</v-icon>
                  </div>
                </div>
              </template>
              
              <div class="template-content-wrapper">
                <!-- Data de criação do template -->
                <div class="template-date" v-if="template.createdAt">
                  <v-icon size="small" color="grey">mdi-calendar-clock</v-icon>
                  <span>{{ formatDate(template.createdAt) }}</span>
                </div>
                
                <!-- MLS ID -->
                <div v-if="template.mlsId" class="template-mls ml-3">
                  <v-icon size="small" color="grey">mdi-pound</v-icon>
                  <span>{{ template.mlsId }}</span>
                </div>
                
                <!-- Nome e descrição -->
                <div class="template-info ml-3">
                  <div class="template-name">{{ template.name }}</div>
                  <div class="template-subtitle">{{ template.description || 'Sem descrição' }}</div>
                </div>
              </div>
              <template v-slot:append>
                <div class="template-actions">
                  <v-btn
                    color="#012928"
                    variant="text"
                    icon="mdi-eye"
                    @click="previewTemplate(template)"
                    class="action-btn"
                    title="Visualizar"
                  ></v-btn>
                  <v-btn
                    color="#012928"
                    variant="text"
                    icon="mdi-pencil"
                    @click="editTemplate(template)"
                    class="action-btn"
                    title="Editar"
                  ></v-btn>
                  <v-btn
                    color="error"
                    variant="text"
                    icon="mdi-delete"
                    @click="deleteTemplate(template.id || '')"
                    class="action-btn"
                    title="Excluir"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </template>

        <!-- Templates Anteriores -->
        <template v-if="getPreviousTemplates().length > 0">
          <div class="section-header-wrapper">
            <v-subheader class="previous-header">
              <v-icon class="mr-2" color="grey">mdi-calendar-month</v-icon>
              Criados Anteriormente
            </v-subheader>
          </div>
          <v-list lines="two" class="template-list">
            <v-list-item
              v-for="template in getPreviousTemplates()"
              :key="template.id"
              class="template-list-item"
              rounded
            >
              <template v-slot:prepend>
                <div class="template-prepend">
                  <div class="template-icon">
                    <v-icon size="large" color="#012928">mdi-email-newsletter</v-icon>
                  </div>
                </div>
              </template>
              
              <div class="template-content-wrapper">
                <!-- Data de criação do template -->
                <div class="template-date" v-if="template.createdAt">
                  <v-icon size="small" color="grey">mdi-calendar-clock</v-icon>
                  <span>{{ formatDate(template.createdAt) }}</span>
                </div>
                
                <!-- MLS ID -->
                <div v-if="template.mlsId" class="template-mls ml-3">
                  <v-icon size="small" color="grey">mdi-pound</v-icon>
                  <span>{{ template.mlsId }}</span>
                </div>
                
                <!-- Nome e descrição -->
                <div class="template-info ml-3">
                  <div class="template-name">{{ template.name }}</div>
                  <div class="template-subtitle">{{ template.description || 'Sem descrição' }}</div>
                </div>
              </div>
              <template v-slot:append>
                <div class="template-actions">
                  <v-btn
                    color="#012928"
                    variant="text"
                    icon="mdi-eye"
                    @click="previewTemplate(template)"
                    class="action-btn"
                    title="Visualizar"
                  ></v-btn>
                  <v-btn
                    color="#012928"
                    variant="text"
                    icon="mdi-pencil"
                    @click="editTemplate(template)"
                    class="action-btn"
                    title="Editar"
                  ></v-btn>
                  <v-btn
                    color="error"
                    variant="text"
                    icon="mdi-delete"
                    @click="deleteTemplate(template.id || '')"
                    class="action-btn"
                    title="Excluir"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </template>

        <!-- Mensagem quando não há templates -->
        <v-card-text v-if="filteredTemplates.length === 0" class="text-center pa-6 font-weight-medium">
          <v-icon size="large" color="grey" class="mb-2">mdi-email-off-outline</v-icon>
          <div class="text-h6 text-grey font-weight-medium">Nenhum template encontrado</div>
          <div class="text-body-2 text-grey-darken-1 mt-2">Tente ajustar os filtros ou criar um novo template</div>
        </v-card-text>

        <!-- Paginação -->
        <v-card-actions class="justify-center">
          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            rounded="circle"
          ></v-pagination>
        </v-card-actions>
      </v-card>

      <!-- Modal de Visualização -->
      <v-dialog v-model="showPreviewModal" max-width="800" class="preview-dialog">
        <v-card class="preview-card" elevation="10">
          <v-toolbar color="#012928" dark class="preview-toolbar">
            <v-toolbar-title class="preview-title">
              <v-icon class="mr-2">mdi-email-check</v-icon>
              {{ selectedTemplate?.name || 'Visualização do Template' }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" @click="showPreviewModal = false" class="close-btn"></v-btn>
          </v-toolbar>

          <v-card-text class="preview-card-content">
            <div class="template-preview">
              <div v-if="selectedTemplate?.description" class="template-description">
                {{ selectedTemplate.description }}
              </div>
              
              <div class="template-content">
                <div v-for="(component, index) in selectedTemplate?.components" :key="component.id || index" class="component-preview">
                  <!-- Texto -->
                  <div v-if="component.type === 'text'" :style="component.style" class="mb-4">
                    {{ component.content }}
                  </div>
                  
                  <!-- HTML -->
                  <div v-else-if="component.type === 'html'" :style="component.style" class="mb-4" v-html="component.content">
                  </div>
                  
                  <!-- Título -->
                  <div v-else-if="component.type === 'title'" class="text-h5 font-weight-bold mb-4">
                    {{ component.content }}
                  </div>
                  
                  <!-- Imagem -->
                  <div v-else-if="component.type === 'image'" class="mb-4">
                    <v-img
                      v-if="component.content"
                      :key="component.content"
                      :src="component.content"
                      :alt="'Imagem ' + (index + 1)"
                      cover
                      max-height="300"
                      class="rounded"
                    ></v-img>
                  </div>
                  
                  <!-- Botão -->
                  <div v-else-if="component.type === 'button'" class="mb-4">
                    <v-btn
                      :color="component.color"
                      class="text-none"
                      :href="component.link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ component.content }}
                    </v-btn>
                  </div>
                  
                  <!-- Redes Sociais -->
                  <div v-else-if="component.type === 'social'" class="mb-4">
                    <div class="d-flex justify-center gap-4">
                      <template v-for="network in component.networks" :key="network.name">
                        <v-btn
                          v-if="network.enabled"
                          :icon="network.icon"
                          :href="network.link"
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="text"
                          size="large"
                          class="social-icon"
                        ></v-btn>
                      </template>
                    </div>
                  </div>
                  
                  <!-- Espaçador -->
                  <div v-else-if="component.type === 'spacer'" :style="{ height: component.size + 'px' }"></div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Modal de Novo/Editar Template -->
      <v-dialog
        v-model="showNewTemplateModal"
        fullscreen
        :scrim="false"
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar color="#012928" dark>
            <v-btn
              icon="mdi-close"
              @click="closeModal"
              variant="text"
            >
            </v-btn>
            <v-toolbar-title class="font-weight-medium">{{ editingTemplate ? 'Editar Template' : 'Novo Template' }}</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <email-template-editor
              ref="templateEditor"
              v-if="showNewTemplateModal"
              :initial-template="editingTemplate || getMarketingTemplate()"
              @save="saveTemplate"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRoute, useRouter } from 'vue-router';
import EmailTemplateEditor from '../components/EmailTemplateEditor.vue';
import emailTemplateService from '../services/emailTemplate.service';
import { openAIService } from '../services/openai.service';
import AIAnimation from '../components/AIAnimation.vue';

// Definição de tipos
interface EmailTemplate {
  id?: string;
  name: string;
  description: string;
  components: Array<{
    type: string;
    content: string;
    style: Record<string, string>;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface PostData {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  propertyInfo: Record<string, any>;
  author: Record<string, any>;
  createdAt: any;
  [key: string]: any;
}

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const templates = ref<EmailTemplate[]>([]);
const filteredTemplates = ref<EmailTemplate[]>([]);
const showNewTemplateModal = ref(false);
const showPreviewModal = ref(false);
const editingTemplate = ref<EmailTemplate | null>(null);
const selectedTemplate = ref<EmailTemplate | null>(null);
const templateEditor = ref<any>(null);
const tab = ref('templates'); // Adicionar a variável tab para as abas
const postData = ref<PostData | null>(null);
const isMarketingMode = ref(false);
const isGeneratingTemplate = ref(false);
const aiGeneratedHTML = ref('');

// Paginação
const page = ref(1);
const itemsPerPage = 5;
const totalPages = ref(1);

// Filtros
const searchQuery = ref('');
const dateFilter = ref('');
const mlsIdFilter = ref('');

watch(selectedTemplate, (newValue) => {
  console.log('Template selecionado:', newValue);
}, { deep: true });

onBeforeMount(() => {
  // Verificar se estamos no modo de marketing
  isMarketingMode.value = route.query.mode === 'marketing';
  
  // Se estamos no modo de marketing, verificar se há dados do post no localStorage
  if (isMarketingMode.value) {
    try {
      const storedData = localStorage.getItem('emailMarketingPostData');
      if (storedData) {
        postData.value = JSON.parse(storedData);
        console.log('Dados do post carregados:', postData.value);
        
        // Abrir automaticamente o modal para criar um novo template
        showNewTemplateModal.value = true;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do post:', error);
    }
  }
});

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadTemplates();
  }
});

async function loadTemplates() {
  try {
    console.log('Carregando templates...');
    templates.value = await emailTemplateService.getTemplates();
    console.log('Templates carregados:', templates.value);
    
    // Ordenar templates por data de criação (mais recentes primeiro)
    templates.value.sort((a, b) => {
      const dateA = getDateFromTimestamp(a.createdAt);
      const dateB = getDateFromTimestamp(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Aplicar filtros iniciais
    applyFilters();
  } catch (error) {
    console.error('Erro ao carregar templates:', error);
  }
}

// Função para aplicar filtros e atualizar a lista de templates
function applyFilters() {
  let result = [...templates.value];
  
  // Filtrar por nome/descrição
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(template => 
      template.name.toLowerCase().includes(query) || 
      (template.description && template.description.toLowerCase().includes(query))
    );
  }
  
  // Filtrar por data
  if (dateFilter.value) {
    const selectedDate = new Date(dateFilter.value);
    selectedDate.setHours(0, 0, 0, 0);
    
    result = result.filter(template => {
      const templateDate = getDateFromTimestamp(template.createdAt);
      templateDate.setHours(0, 0, 0, 0);
      return templateDate.getTime() === selectedDate.getTime();
    });
  }
  
  // Filtrar por MLS ID
  if (mlsIdFilter.value) {
    const mlsId = mlsIdFilter.value.toLowerCase();
    result = result.filter(template => 
      template.mlsId && template.mlsId.toLowerCase().includes(mlsId)
    );
  }
  
  // Atualizar templates filtrados
  filteredTemplates.value = result;
  
  // Atualizar total de páginas
  totalPages.value = Math.ceil(filteredTemplates.value.length / itemsPerPage);
  
  // Ajustar página atual se necessário
  if (page.value > totalPages.value && totalPages.value > 0) {
    page.value = totalPages.value;
  }
}

// Função para obter objeto Date a partir de timestamp
function getDateFromTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date(0);
  
  if (timestamp.toDate) {
    // Se for um timestamp do Firestore
    return timestamp.toDate();
  } else if (timestamp.seconds) {
    // Se for um objeto com seconds (formato Firestore serializado)
    return new Date(timestamp.seconds * 1000);
  } else {
    // Se for outro formato de data
    return new Date(timestamp);
  }
}

// Função para formatar data e hora
function formatDate(timestamp: any): string {
  if (!timestamp) return 'Data desconhecida';
  
  const date = getDateFromTimestamp(timestamp);
  
  // Verificar se a data é válida
  if (isNaN(date.getTime())) return 'Data inválida';
  
  // Formatar a data no formato brasileiro
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Função para verificar se a data é hoje
function isToday(timestamp: any): boolean {
  if (!timestamp) return false;
  
  const date = getDateFromTimestamp(timestamp);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// Função para obter templates da página atual
function getCurrentPageTemplates(): EmailTemplate[] {
  const startIndex = (page.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredTemplates.value.slice(startIndex, endIndex);
}

// Função para obter templates criados hoje
function getTodayTemplates(): EmailTemplate[] {
  return getCurrentPageTemplates().filter(template => isToday(template.createdAt));
}

// Função para obter templates criados anteriormente
function getPreviousTemplates(): EmailTemplate[] {
  return getCurrentPageTemplates().filter(template => !isToday(template.createdAt));
}

async function saveTemplate(templateData: EmailTemplate) {
  try {
    console.log('Salvando template:', templateData);
    if (editingTemplate.value && editingTemplate.value.id) {
      await emailTemplateService.updateTemplate(editingTemplate.value.id, templateData);
    } else {
      await emailTemplateService.createTemplate(templateData);
    }
    await loadTemplates();
    showNewTemplateModal.value = false;
    
    // Limpar os dados do post após salvar o template
    if (isMarketingMode.value) {
      localStorage.removeItem('emailMarketingPostData');
      isMarketingMode.value = false;
    }
  } catch (error) {
    console.error('Erro ao salvar template:', error);
  }
}

function previewTemplate(template: EmailTemplate) {
  console.log('Abrindo template:', template);
  selectedTemplate.value = template;
  showPreviewModal.value = true;
}

async function editTemplate(template: EmailTemplate) {
  editingTemplate.value = template;
  showNewTemplateModal.value = true;
}

async function deleteTemplate(id: string) {
  if (confirm('Tem certeza que deseja excluir este template?')) {
    try {
      await emailTemplateService.deleteTemplate(id);
      await loadTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  }
}

function closeModal() {
  showNewTemplateModal.value = false;
  editingTemplate.value = null;
  
  // Se estávamos no modo de marketing, limpar os dados e voltar para a página anterior
  if (isMarketingMode.value) {
    localStorage.removeItem('emailMarketingPostData');
    isMarketingMode.value = false;
    router.back();
  }
}

// Função para gerar um template usando IA
async function generateAITemplate() {
  if (!postData.value) return;
  
  try {
    isGeneratingTemplate.value = true;
    
    // Obter configurações de marketing do usuário
    const authStore = useAuthStore();
    const userData = authStore.userData || {};
    const marketingConfig = userData.marketingConfig || {
      headerWidth: 600,
      logoUrl: '',
      headerImageUrl: '',
      primaryColor: '#451A37',
      secondaryColor: '#01FBA1'
    };
    
    // Chamar o serviço OpenAI para gerar apenas o corpo do email
    const bodyHtmlContent = await openAIService.generateEmailTemplate(postData.value);
    
    // Criar o HTML completo com cabeçalho e rodapé padrão
    const headerHtml = `
    <div style="background-color: ${marketingConfig.primaryColor}; color: white; padding: 20px; text-align: center; max-width: ${marketingConfig.headerWidth}px; margin: 0 auto;">
      ${marketingConfig.logoUrl ? `<img src="${marketingConfig.logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">` : `<h1 style="margin: 0; color: ${marketingConfig.secondaryColor};">The Hub Realtors</h1>`}
      ${marketingConfig.headerImageUrl ? `<img src="${marketingConfig.headerImageUrl}" alt="Header" style="width: 100%; max-width: ${marketingConfig.headerWidth}px; margin-top: 10px;">` : ''}
    </div>
    `;
    
    // Adicionar as imagens do imóvel ao corpo do email
    let bodyWithImages = bodyHtmlContent;
    
    // Se houver imagens no post, inserir no corpo do email
    if (postData.value.images && postData.value.images.length > 0) {
      const imagesHtml = `
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 20px 0;">
        ${postData.value.images.map(img => `<img src="${img}" alt="Imagem do imóvel" style="max-width: 100%; height: auto; max-height: 300px; object-fit: cover; border-radius: 8px;">`).join('')}
      </div>
      `;
      
      // Substituir a marcação de imagem ou adicionar no final se não houver marcação
      if (bodyWithImages.includes('INSERIR IMAGENS AQUI') || bodyWithImages.includes('inserir imagens aqui')) {
        bodyWithImages = bodyWithImages.replace(/INSERIR IMAGENS AQUI|inserir imagens aqui/gi, imagesHtml);
      } else {
        // Tentar inserir após o primeiro parágrafo
        const firstParagraphEnd = bodyWithImages.indexOf('</p>');
        if (firstParagraphEnd !== -1) {
          bodyWithImages = bodyWithImages.substring(0, firstParagraphEnd + 4) + imagesHtml + bodyWithImages.substring(firstParagraphEnd + 4);
        } else {
          // Se não encontrar parágrafo, adicionar no início
          bodyWithImages = imagesHtml + bodyWithImages;
        }
      }
    }
    
    // Remover qualquer duplicação de "Detalhes do Imóvel" que possa existir no conteúdo gerado pela IA
    bodyWithImages = bodyWithImages.replace(/<h2[^>]*>Detalhes do Imóvel<\/h2>[\s\S]*?<\/div>/gi, '');
    
    // Criar o rodapé padrão com as informações do usuário
    const footerHtml = `
    <div style="background-color: white; padding: 20px; border-top: 1px solid #eee; text-align: center; max-width: ${marketingConfig.headerWidth}px; margin: 20px auto 0;">
      <div style="margin-top: 15px; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.
      </div>
    </div>
    `;
    
    // Combinar tudo em um único HTML
    const fullHtmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: ${marketingConfig.headerWidth}px; margin: 0 auto;">
      ${headerHtml}
      <div style="padding: 20px; background-color: white;">
        ${bodyWithImages}
      </div>
      ${footerHtml}
    </div>
    `;
    
    aiGeneratedHTML.value = fullHtmlContent;
    
    // Criar um template com o HTML gerado
    editingTemplate.value = {
      name: `Email Marketing IA - ${postData.value.title}`,
      description: 'Template gerado automaticamente com IA a partir de um post do InstaHub',
      components: [
        {
          type: 'html',
          content: fullHtmlContent,
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333'
          }
        }
      ]
    };
    
    // Atualizar o editor de template
    if (templateEditor.value) {
      templateEditor.value.updateTemplate(editingTemplate.value);
    }
  } catch (error: any) {
    console.error('Erro ao gerar template com IA:', error);
    alert(`Erro ao gerar template com IA: ${error.message || 'Tente novamente mais tarde'}`);
  } finally {
    isGeneratingTemplate.value = false;
  }
}

// Função para criar um template de email marketing a partir dos dados do post
function getMarketingTemplate(): EmailTemplate | null {
  if (!postData.value) return null;
  
  // Extrair MLS ID dos dados do post, se disponível
  const mlsId = postData.value.propertyInfo?.mlsId || '';
  
  // Se já temos um template gerado por IA, usar ele
  if (aiGeneratedHTML.value) {
    return {
      name: `Email Marketing IA - ${postData.value.title}`,
      description: 'Template gerado automaticamente com IA a partir de um post do InstaHub',
      mlsId: mlsId,
      components: [
        {
          type: 'html',
          content: aiGeneratedHTML.value,
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333'
          }
        }
      ]
    };
  }
  
  const property = postData.value.propertyInfo;
  const author = postData.value.author;
  
  // Criar um template básico
  return {
    name: `Email Marketing - ${postData.value.title}`,
    description: 'Template gerado automaticamente a partir de um post do InstaHub',
    mlsId: mlsId,
    components: [
      // Título
      {
        type: 'title',
        content: postData.value.title,
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#451A37',
          textAlign: 'center',
          marginBottom: '20px'
        }
      },
      // Imagem principal
      {
        type: 'image',
        content: postData.value.images && postData.value.images.length > 0 ? postData.value.images[0] : '',
        style: {
          width: '100%',
          borderRadius: '8px',
          marginBottom: '20px'
        }
      },
      // Descrição
      {
        type: 'text',
        content: postData.value.description,
        style: {
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#333',
          marginBottom: '20px'
        }
      },
      // Detalhes do imóvel
      {
        type: 'title',
        content: 'Detalhes do Imóvel',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#451A37',
          marginTop: '20px',
          marginBottom: '15px'
        }
      },
      // Informações do imóvel em texto formatado
      {
        type: 'text',
        content: `
${property.title || 'Imóvel Exclusivo'}

${property.price ? `Preço: R$ ${Number(property.price).toLocaleString('pt-BR')}` : ''}
${property.type ? `Tipo: ${property.type}` : ''}
${property.area ? `Área: ${property.area}m²` : ''}
${property.rooms ? `Quartos: ${property.rooms}` : ''}
${property.bathrooms ? `Banheiros: ${property.bathrooms}` : ''}
${property.garage ? `Vagas: ${property.garage}` : ''}
${property.address ? `Localização: ${property.address}` : ''}
        `,
        style: {
          fontSize: '16px',
          lineHeight: '1.8',
          color: '#333',
          whiteSpace: 'pre-line',
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }
      },
      // Botão de contato
      {
        type: 'button',
        content: 'Quero mais informações',
        link: author.phone ? `https://wa.me/${author.phone.replace(/\D/g, '')}?text=Olá, vi seu anúncio sobre ${postData.value.title} e gostaria de mais informações.` : '#',
        color: 'primary',
        style: {
          display: 'block',
          width: '100%',
          textAlign: 'center',
          marginTop: '30px',
          marginBottom: '30px'
        }
      },

      // Rodapé
      {
        type: 'text',
        content: `&copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.`,
        style: {
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          marginTop: '30px'
        }
      }
    ]
  };
}
</script>

<style scoped>
/* Estilos gerais da página */
.email-templates-page {
  padding: 2rem 0;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #012928;
}

.create-btn {
  background-color: #012928 !important;
  color: white !important;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.3px;
}

.create-btn:hover {
  background-color: #023e3d !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* Estilos da lista de templates */
.template-list-card {
  margin-bottom: 2rem;
  border-radius: 0.5rem !important;
  overflow: hidden;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.template-list-header {
  background-color: #012928 !important;
  color: white !important;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
}

.template-list {
  padding: 0.5rem;
  background-color: #f8f9fa;
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.template-list-item {
  margin: 0.5rem 0.75rem;
  border-radius: 0.375rem !important;
  background-color: white !important;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  font-family: 'Montserrat', sans-serif;
}

.template-list-item:hover {
  background-color: #f9fafb !important;
  border-left: 2px solid #012928;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.template-icon {
  background-color: rgba(1, 41, 40, 0.1);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.template-prepend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.template-content-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0.5rem 0;
}

.template-date, .template-mls {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
}

.template-info {
  flex: 1;
}

.template-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.87);
  font-family: 'Montserrat', sans-serif;
}

.template-subtitle {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  font-family: 'Montserrat', sans-serif;
  margin-top: 2px;
}

.action-btn:hover {
  background-color: rgba(1, 41, 40, 0.1) !important;
  transform: translateY(-2px);
}

.action-text {
  margin-left: 0.25rem;
}

/* Estilos do modal de visualização */
.preview-dialog {
  border-radius: 16px;
}

.preview-card {
  border-radius: 16px !important;
  overflow: hidden;
  border: none !important;
}

.preview-toolbar {
  background-color: #012928 !important;
  border-bottom: 2px solid #01FBA1;
}

.preview-title {
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
}

.preview-card-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
}

.template-preview {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.template-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  border-left: 2px solid #012928;
  font-family: 'Montserrat', sans-serif;
}

.template-content {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #d1d5db;
}

.component-preview {
  margin: 0.75rem 0;
}

.rounded {
  border-radius: 8px;
}

.social-icon {
  font-size: 24px;
  color: #012928;
  transition: all 0.3s ease;
}

.social-icon:hover {
  color: #01FBA1;
  transform: scale(1.2);
}

.gap-4 {
  gap: 1rem;
}

/* Animações */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.template-list-item {
  animation: fadeIn 0.3s ease-out;
  animation-fill-mode: both;
}

.template-list-item:nth-child(1) { animation-delay: 0.1s; }
.template-list-item:nth-child(2) { animation-delay: 0.2s; }
.template-list-item:nth-child(3) { animation-delay: 0.3s; }
.template-list-item:nth-child(4) { animation-delay: 0.4s; }
.template-list-item:nth-child(5) { animation-delay: 0.5s; }

/* Estilos para os filtros */
.filter-card {
  border-radius: 0.5rem !important;
  overflow: hidden;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  margin-bottom: 1.5rem;
}

.filter-header {
  background-color: #f8f9fa !important;
  color: #012928 !important;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
  font-family: 'Montserrat', sans-serif;
}

/* Estilos para os cabeçalhos de seção */
.section-header-wrapper {
  position: relative;
  padding-top: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 1;
}

.today-header, .previous-header {
  background-color: #f8f9fa;
  font-weight: 500;
  padding: 0.75rem 1.25rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.95rem;
  position: relative;
  z-index: 2;
}

.today-item {
  border-left: 3px solid #01FBA1 !important;
  background-color: rgba(1, 251, 161, 0.03) !important;
}
</style>
