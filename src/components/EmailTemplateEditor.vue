<template>
  <div class="email-template-editor">
    <v-form @submit.prevent="saveTemplate">
      <v-row>
        <!-- Editor -->
        <v-col cols="6">
          <v-card class="editor-card" elevation="3">
            <v-card-title class="editor-title">
              <v-icon class="mr-2">mdi-pencil-outline</v-icon>
              Editor
            </v-card-title>
            <v-card-text class="editor-content">
              <v-text-field
                v-model="templateName"
                label="Nome do Template"
                required
              ></v-text-field>

              <v-textarea
                v-model="templateDescription"
                label="Descrição"
                rows="2"
              ></v-textarea>

              <v-divider class="my-4"></v-divider>

              <div class="components-list">
                <div class="section-header">
                  <v-icon color="#012928" class="mr-2">mdi-puzzle-outline</v-icon>
                  <span class="section-title">Componentes Disponíveis</span>
                </div>
                <div class="component-buttons">
                  <v-btn
                    v-for="item in availableComponents"
                    :key="item.type"
                    variant="outlined"
                    color="#012928"
                    class="component-btn"
                    elevation="2"
                    @click="addComponent(item)"
                  >
                    <v-icon start color="#01FBA1">{{ item.icon }}</v-icon>
                    {{ item.type }}
                  </v-btn>
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <!-- Botão de Salvar -->
              <v-btn
                color="#012928"
                block
                class="save-btn mb-4"
                @click="saveTemplate"
                elevation="2"
                size="large"
              >
                <v-icon start>mdi-content-save</v-icon>
                Salvar Template
              </v-btn>

              <div class="template-components">
                <div class="section-header">
                  <v-icon color="#012928" class="mr-2">mdi-file-document-edit-outline</v-icon>
                  <span class="section-title">Componentes do Template</span>
                </div>
                <draggable
                  v-model="templateComponents"
                  group="components"
                  item-key="id"
                  handle=".drag-handle"
                  class="template-components-list"
                >
                  <template #item="{ element }">
                    <div class="component-item">
                      <div class="d-flex align-center">
                        <v-icon class="drag-handle me-2">mdi-drag</v-icon>
                        <div class="flex-grow-1">
                          <template v-if="element.type === 'text'">
                            <v-textarea
                              v-model="element.content"
                              :label="element.placeholder"
                              :style="element.style"
                              rows="4"
                              auto-grow
                              no-resize
                              hide-details
                              class="white-space-pre"
                            ></v-textarea>
                            <v-expansion-panels class="mt-2">
                              <v-expansion-panel>
                                <v-expansion-panel-title>Opções de Estilo</v-expansion-panel-title>
                                <v-expansion-panel-text>
                                  <v-row dense>
                                    <v-col cols="6">
                                      <v-select
                                        v-model="element.style.fontSize"
                                        label="Tamanho da Fonte"
                                        :items="textStyleOptions.fontSize"
                                        density="compact"
                                      ></v-select>
                                    </v-col>
                                    <v-col cols="6">
                                      <v-select
                                        v-model="element.style.fontWeight"
                                        label="Peso da Fonte"
                                        :items="textStyleOptions.fontWeight"
                                        density="compact"
                                      ></v-select>
                                    </v-col>
                                    <v-col cols="6">
                                      <v-select
                                        v-model="element.style.textAlign"
                                        label="Alinhamento"
                                        :items="textStyleOptions.textAlign"
                                        density="compact"
                                      ></v-select>
                                    </v-col>
                                    <v-col cols="6">
                                      <v-select
                                        v-model="element.style.lineHeight"
                                        label="Altura da Linha"
                                        :items="textStyleOptions.lineHeight"
                                        density="compact"
                                      ></v-select>
                                    </v-col>
                                  </v-row>
                                </v-expansion-panel-text>
                              </v-expansion-panel>
                            </v-expansion-panels>
                          </template>

                          <template v-else-if="element.type === 'button'">
                            <v-text-field
                              v-model="element.content"
                              label="Texto do Botão"
                              class="mb-2"
                            ></v-text-field>
                            <v-text-field
                              v-model="element.link"
                              label="Link do Botão"
                              class="mb-2"
                              placeholder="https://"
                            ></v-text-field>
                            <v-select
                              v-model="element.color"
                              label="Cor do Botão"
                              :items="buttonColorOptions"
                              class="mb-2"
                            ></v-select>
                          </template>

                          <template v-else-if="element.type === 'image'">
                            <div v-if="!element.content" class="image-upload">
                              <v-file-input
                                label="Selecione uma imagem"
                                accept="image/*"
                                @update:model-value="handleImageUpload($event, element)"
                                prepend-icon="mdi-camera"
                                :loading="element.uploading"
                                hide-details
                              ></v-file-input>
                            </div>
                            <div v-else class="image-preview">
                              <v-img
                                :key="element.content"
                                :src="element.content"
                                :alt="'Imagem ' + element.id"
                                cover
                                max-height="300"
                                class="rounded"
                                @error="console.error('Erro ao carregar imagem:', element.content)"
                                @load="console.log('Imagem carregada:', element.content)"
                              ></v-img>
                              <div class="image-actions">
                                <v-btn
                                  icon="mdi-pencil"
                                  variant="text"
                                  color="primary"
                                  size="small"
                                  @click="removeImage(element)"
                                />
                                <v-btn
                                  icon="mdi-delete"
                                  variant="text"
                                  color="error"
                                  size="small"
                                  @click="removeImage(element)"
                                  class="ms-1"
                                />
                              </div>
                            </div>
                          </template>

                          <template v-else-if="element.type === 'social'">
                            <v-card flat>
                              <v-card-text>
                                <div v-for="network in element.networks" :key="network.name" class="d-flex align-center mb-2">
                                  <v-checkbox
                                    v-model="network.enabled"
                                    :label="network.name.charAt(0).toUpperCase() + network.name.slice(1)"
                                    density="compact"
                                    hide-details
                                    class="me-2"
                                  ></v-checkbox>
                                  <v-text-field
                                    v-if="network.enabled"
                                    v-model="network.link"
                                    :label="`Link do ${network.name}`"
                                    density="compact"
                                    hide-details
                                    class="flex-grow-1"
                                    placeholder="https://"
                                  ></v-text-field>
                                </div>
                              </v-card-text>
                            </v-card>
                          </template>

                          <template v-else-if="element.type === 'html'">
                            <div class="mb-2">
                              <div class="d-flex align-center mb-2">
                                <v-icon color="info" class="me-2">mdi-robot</v-icon>
                                <span class="text-subtitle-2">Conteúdo HTML gerado por IA</span>
                              </div>
                              <v-textarea
                                v-model="element.content"
                                label="Código HTML"
                                :style="element.style"
                                rows="6"
                                auto-grow
                                no-resize
                                hide-details
                                class="font-monospace"
                              ></v-textarea>
                            </div>
                            <v-expansion-panels class="mt-2">
                              <v-expansion-panel>
                                <v-expansion-panel-title>Opções de Estilo</v-expansion-panel-title>
                                <v-expansion-panel-text>
                                  <v-row dense>
                                    <v-col cols="6">
                                      <v-select
                                        v-model="element.style.fontSize"
                                        label="Tamanho da Fonte"
                                        :items="textStyleOptions.fontSize"
                                        density="compact"
                                      ></v-select>
                                    </v-col>
                                    <v-col cols="6">
                                      <v-select
                                        v-model="element.style.lineHeight"
                                        label="Altura da Linha"
                                        :items="textStyleOptions.lineHeight"
                                        density="compact"
                                      ></v-select>
                                    </v-col>
                                  </v-row>
                                </v-expansion-panel-text>
                              </v-expansion-panel>
                            </v-expansion-panels>
                          </template>

                          <template v-else-if="element.type === 'spacer'">
                            <div class="spacer" :style="{ height: element.size + 'px' }"></div>
                          </template>
                        </div>
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          color="error"
                          size="small"
                          @click="removeComponent(element)"
                        />
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                type="submit"
                :disabled="!templateName"
              >
                Salvar Template
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Visualização -->
        <v-col cols="6">
          <v-card class="preview-card" elevation="3">
            <v-card-title class="preview-title">
              <v-icon class="mr-2">mdi-eye-outline</v-icon>
              Visualização
            </v-card-title>
            <v-card-text class="preview-content-wrapper">
              <div class="preview-content">
                <h2 class="text-h5 mb-4">{{ templateName || 'Sem título' }}</h2>
                <div v-for="(element, index) in templateComponents" :key="element.id || index" class="preview-item">
                  <!-- Texto -->
                  <p v-if="element.type === 'text'" :style="element.style" class="text-content">{{ element.content }}</p>
                  
                  <!-- HTML (renderizado) -->
                  <div v-else-if="element.type === 'html'" :style="element.style" v-html="element.content" class="html-content"></div>
                  
                  <!-- Título -->
                  <div v-else-if="element.type === 'title'" class="text-h5 font-weight-bold mb-4">
                    {{ element.content }}
                  </div>
                  
                  <!-- Imagem -->
                  <div v-else-if="element.type === 'image'" class="mb-4">
                    <v-img
                      v-if="element.content"
                      :src="element.content"
                      :alt="'Imagem ' + (index + 1)"
                      cover
                      max-height="300"
                    ></v-img>
                    <div v-else class="placeholder-image">
                      Selecione uma imagem
                    </div>
                  </div>
                  
                  <!-- Botão -->
                  <div v-else-if="element.type === 'button'" class="mb-4">
                    <v-btn
                      :color="element.color || 'primary'"
                      class="text-none"
                    >
                      {{ element.content }}
                    </v-btn>
                  </div>
                  
                  <!-- Espaçador -->
                  <div v-else-if="element.type === 'spacer'" :style="{ height: element.size + 'px' }"></div>
                  
                  <!-- Redes Sociais -->
                  <div v-else-if="element.type === 'social'" class="mb-4">
                    <div v-for="network in element.networks" :key="network.name" class="d-flex align-center mb-2">
                      <v-icon :icon="network.icon" size="24" class="me-2"></v-icon>
                      <a :href="network.link" target="_blank" rel="noopener noreferrer">{{ network.name }}</a>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';
import draggable from 'vuedraggable';
import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const props = defineProps({
  initialTemplate: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save']);

const templateName = ref(props.initialTemplate?.name || '');
const templateDescription = ref(props.initialTemplate?.description || '');
const templateComponents = ref<any[]>(props.initialTemplate?.components || []);

// Componentes disponíveis
const availableComponents = ref([
  {
    type: 'text',
    icon: 'mdi-text',
    placeholder: 'Digite seu texto aqui'
  },
  {
    type: 'html',
    icon: 'mdi-code-tags',
    placeholder: 'HTML'
  },
  {
    type: 'title',
    icon: 'mdi-format-header-1',
    placeholder: 'Digite o título'
  },
  {
    type: 'button',
    icon: 'mdi-gesture-tap-button',
    placeholder: 'Botão'
  },
  {
    type: 'image',
    icon: 'mdi-image',
    placeholder: 'Imagem'
  },
  {
    type: 'social',
    icon: 'mdi-share-variant',
    placeholder: 'Redes Sociais',
    networks: [
      { name: 'facebook', enabled: false, link: '' },
      { name: 'instagram', enabled: false, link: '' },
      { name: 'whatsapp', enabled: false, link: '' },
      { name: 'linkedin', enabled: false, link: '' }
    ]
  },
  {
    type: 'spacer',
    icon: 'mdi-arrow-expand-vertical',
    placeholder: 'Espaçador'
  }
]);

// Opções de estilo para texto
const textStyleOptions = {
  fontSize: ['12px', '14px', '16px', '18px', '20px', '24px', '32px'],
  fontWeight: ['normal', 'bold'],
  textAlign: ['left', 'center', 'right'],
  lineHeight: ['1', '1.2', '1.5', '2']
};

// Opções de cores para botões
const buttonColorOptions = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error'
];

// Debug: observar mudanças nos componentes
watch(templateComponents, (newValue) => {
  console.log('Componentes atualizados:', newValue);
}, { deep: true });

// Função para adicionar um novo componente
const addComponent = (component: any) => {
  const newComponent = {
    id: uuidv4(),
    type: component.type,
    content: '',
    placeholder: component.placeholder
  };

  // Inicializar propriedades específicas por tipo
  if (component.type === 'text') {
    newComponent.style = {
      fontSize: '16px',
      fontWeight: 'normal',
      textAlign: 'left',
      lineHeight: '1.5'
    };
  } else if (component.type === 'button') {
    newComponent.link = '';
    newComponent.color = 'primary';
  } else if (component.type === 'social') {
    newComponent.networks = [
      { name: 'facebook', enabled: false, link: '' },
      { name: 'instagram', enabled: false, link: '' },
      { name: 'whatsapp', enabled: false, link: '' },
      { name: 'linkedin', enabled: false, link: '' }
    ];
  } else if (component.type === 'spacer') {
    newComponent.size = 20;
  } else if (component.type === 'html') {
    newComponent.style = {
      fontSize: '16px',
      lineHeight: '1.6'
    };
  }

  console.log('Adicionando novo componente:', newComponent);
  templateComponents.value.push(newComponent);
};

// Função para remover um componente
const removeComponent = (component: any) => {
  const index = templateComponents.value.findIndex((c: any) => c.id === component.id);
  if (index !== -1) {
    templateComponents.value.splice(index, 1);
  }
};

// Função para fazer upload de imagem
const handleImageUpload = async (file: File | null, element: any) => {
  if (!file) return;
  console.log('Iniciando upload da imagem:', file.name);

  try {
    element.uploading = true;
    const storage = getStorage();
    console.log('Storage inicializado');

    // Gerar um nome único para o arquivo
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const imageRef = storageRef(storage, `email-templates/${filename}`);
    console.log('Referência criada:', imageRef.fullPath);
    
    // Upload do arquivo
    console.log('Iniciando upload...');
    const uploadResult = await uploadBytes(imageRef, file);
    console.log('Upload concluído:', uploadResult);
    
    // Obter URL da imagem
    console.log('Obtendo URL...');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('URL obtida:', downloadURL);
    
    // Criar um novo objeto para forçar a reatividade
    const index = templateComponents.value.findIndex(c => c.id === element.id);
    if (index !== -1) {
      console.log('Atualizando componente no índice:', index);
      const updatedComponent = {
        ...element,
        content: downloadURL,
        filename: filename // Salvar o nome do arquivo para referência
      };
      templateComponents.value[index] = updatedComponent;
      // Forçar reatividade
      templateComponents.value = [...templateComponents.value];
    }
  } catch (error) {
    console.error('Erro detalhado ao fazer upload da imagem:', error);
    alert('Erro ao fazer upload da imagem. Por favor, tente novamente.');
  } finally {
    element.uploading = false;
  }
};

// Função para remover imagem
const removeImage = (element: any) => {
  console.log('Removendo imagem do elemento:', element);
  const index = templateComponents.value.findIndex(c => c.id === element.id);
  if (index !== -1) {
    const updatedComponent = { ...element, content: '' };
    templateComponents.value[index] = updatedComponent;
    // Forçar reatividade
    templateComponents.value = [...templateComponents.value];
  }
};

// Função para salvar o template
const saveTemplate = async () => {
  console.log('Função saveTemplate chamada');
  
  if (!templateName.value) {
    alert('Por favor, insira um nome para o template.');
    return;
  }

  try {
    // Criar objeto do template
    const template = {
      name: templateName.value,
      description: templateDescription.value,
      
      // Garantir que a estrutura dos componentes seja preservada corretamente
      components: templateComponents.value.map(component => {
        // Criar uma cópia limpa do componente para evitar problemas de serialização
        const cleanComponent = { ...component };
        
        // Remover propriedades que podem causar problemas
        if (cleanComponent._dragging !== undefined) delete cleanComponent._dragging;
        if (cleanComponent._sortable !== undefined) delete cleanComponent._sortable;
        
        // Garantir que o componente tenha um ID
        if (!cleanComponent.id) cleanComponent.id = uuidv4();
        
        return cleanComponent;
      }),
      
      // Preservar outros campos importantes
      mlsId: props.initialTemplate?.mlsId || '',
      createdAt: props.initialTemplate?.createdAt || new Date(),
      
      // Se for uma edição, preservar o ID original
      id: props.initialTemplate?.id
    };

    console.log('Salvando template:', template);
    
    // Mostrar mensagem de carregamento
    const saveMessage = document.createElement('div');
    saveMessage.textContent = 'Salvando template...';
    saveMessage.style.position = 'fixed';
    saveMessage.style.top = '20px';
    saveMessage.style.right = '20px';
    saveMessage.style.padding = '10px 20px';
    saveMessage.style.backgroundColor = '#012928';
    saveMessage.style.color = 'white';
    saveMessage.style.borderRadius = '4px';
    saveMessage.style.zIndex = '9999';
    document.body.appendChild(saveMessage);
    
    // Emitir evento para o componente pai
    emit('save', template);
    
    // Remover mensagem após 2 segundos
    setTimeout(() => {
      document.body.removeChild(saveMessage);
      
      // Mostrar mensagem de sucesso
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Template salvo com sucesso!';
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.right = '20px';
      successMessage.style.padding = '10px 20px';
      successMessage.style.backgroundColor = '#4CAF50';
      successMessage.style.color = 'white';
      successMessage.style.borderRadius = '4px';
      successMessage.style.zIndex = '9999';
      document.body.appendChild(successMessage);
      
      // Remover mensagem de sucesso após 3 segundos
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    }, 2000);
  } catch (error) {
    console.error('Erro ao salvar template:', error);
    alert('Erro ao salvar template. Por favor, tente novamente.');
  }
};
</script>

<style scoped>
/* Estilos gerais do editor */
.email-template-editor {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Estilos dos cards */
.editor-card, .preview-card {
  border-radius: 12px !important;
  overflow: hidden;
  border: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  height: 100%;
}

.editor-title, .preview-title {
  background-color: #012928 !important;
  color: white !important;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  border-bottom: 2px solid #01FBA1;
}

.editor-content {
  padding: 1.5rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

/* Seções de componentes */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(1, 41, 40, 0.1);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #012928;
}

/* Botões de componentes */
.component-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.component-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(1, 41, 40, 0.2) !important;
  background-color: rgba(1, 41, 40, 0.05) !important;
}

.component-btn:hover {
  transform: translateY(-2px);
  background-color: rgba(1, 41, 40, 0.1) !important;
  box-shadow: 0 4px 8px rgba(1, 41, 40, 0.15) !important;
}

/* Lista de componentes do template */
.template-components {
  margin-top: 1.5rem;
}

.template-components-list {
  min-height: 100px;
  border: 1px dashed rgba(1, 41, 40, 0.3);
  border-radius: 8px;
  padding: 1rem;
  background-color: white;
}

.component-item {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.component-item:hover {
  border-color: #01FBA1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Área de pré-visualização */
.preview-content-wrapper {
  padding: 1.5rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.preview-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #eee;
}

.preview-item {
  margin: 1rem 0;
  animation: fadeIn 0.5s ease-out;
}

/* Estilos de imagem */
.placeholder-image {
  width: 100%;
  height: 200px;
  border: 2px dashed #01FBA1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #012928;
  background: rgba(1, 251, 161, 0.05);
  transition: all 0.3s ease;
}

.placeholder-image:hover {
  background: rgba(1, 251, 161, 0.1);
}

.image-preview {
  position: relative;
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-height: 200px;
  background: #f5f5f5;
  border: 1px solid #eee;
}

.v-img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  gap: 8px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-upload {
  width: 100%;
}

/* Elementos de edição */
.drag-handle {
  cursor: move;
  color: #012928;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  color: #01FBA1;
  transform: scale(1.2);
}

.text-editor, .button-editor, .social-editor {
  width: 100%;
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

.white-space-pre {
  white-space: pre-wrap;
}

.text-content {
  white-space: pre-wrap;
  margin: 0;
}

.html-content {
  margin: 0;
}

/* Animações */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Botão de salvar */
.save-btn {
  background-color: #012928 !important;
  color: white !important;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(1, 41, 40, 0.2) !important;
  margin-top: 1.5rem;
}

.save-btn:hover {
  background-color: #023e3d !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(1, 41, 40, 0.3) !important;
}
</style>
