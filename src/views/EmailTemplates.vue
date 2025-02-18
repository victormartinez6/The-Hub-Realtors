<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Templates de E-mail</h1>
        <v-btn
          color="primary"
          @click="showNewTemplateModal = true"
        >
          Novo Template
        </v-btn>
      </div>

      <!-- Lista de Templates -->
      <v-card>
        <v-list lines="two">
          <v-list-item
            v-for="template in templates"
            :key="template.id"
            :title="template.name"
            :subtitle="template.description"
          >
            <template v-slot:prepend>
              <v-btn
                color="primary"
                variant="text"
                @click="previewTemplate(template)"
                class="me-2"
              >
                <v-icon>mdi-eye</v-icon>
                Visualizar
              </v-btn>
            </template>
            <template v-slot:append>
              <v-btn
                color="primary"
                variant="text"
                @click="editTemplate(template)"
                class="me-2"
              >
                Editar
              </v-btn>
              <v-btn
                color="error"
                variant="text"
                @click="deleteTemplate(template.id)"
              >
                Excluir
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- Modal de Visualização -->
      <v-dialog v-model="showPreviewModal" max-width="700">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>{{ selectedTemplate?.name }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="showPreviewModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text class="pa-4">
            <div class="template-preview">
              <div v-if="selectedTemplate?.description" class="text-subtitle-1 mb-4">
                {{ selectedTemplate.description }}
              </div>
              
              <div class="template-content">
                <div v-for="(component, index) in selectedTemplate?.components" :key="component.id || index" class="component-preview">
                  <!-- Texto -->
                  <div v-if="component.type === 'text'" :style="component.style" class="mb-4">
                    {{ component.content }}
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
          <v-toolbar color="primary">
            <v-btn
              icon
              @click="closeModal"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ editingTemplate ? 'Editar Template' : 'Novo Template' }}</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <email-template-editor
              ref="templateEditor"
              v-if="showNewTemplateModal"
              :initial-template="editingTemplate"
              @save="saveTemplate"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import EmailTemplateEditor from '../components/EmailTemplateEditor.vue';
import emailTemplateService from '../services/emailTemplate.service';

const authStore = useAuthStore();
const templates = ref([]);
const showNewTemplateModal = ref(false);
const showPreviewModal = ref(false);
const editingTemplate = ref(null);
const selectedTemplate = ref(null);
const templateEditor = ref(null);

watch(selectedTemplate, (newValue) => {
  console.log('Template selecionado:', newValue);
}, { deep: true });

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
  } catch (error) {
    console.error('Erro ao carregar templates:', error);
  }
}

async function saveTemplate(templateData: any) {
  try {
    console.log('Salvando template:', templateData);
    if (editingTemplate.value) {
      await emailTemplateService.updateTemplate(editingTemplate.value.id, templateData);
    } else {
      await emailTemplateService.createTemplate(templateData);
    }
    await loadTemplates();
    showNewTemplateModal.value = false;
  } catch (error) {
    console.error('Erro ao salvar template:', error);
  }
}

function previewTemplate(template: any) {
  console.log('Abrindo template:', template);
  selectedTemplate.value = template;
  showPreviewModal.value = true;
}

async function editTemplate(template: any) {
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
}
</script>

<style scoped>
.template-preview {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.template-content {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.component-preview {
  margin: 8px 0;
}

.rounded {
  border-radius: 8px;
}

.social-icon {
  font-size: 24px;
  color: #666;
  transition: color 0.2s ease;
}

.social-icon:hover {
  color: var(--v-primary-base);
}

.gap-4 {
  gap: 1rem;
}
</style>
