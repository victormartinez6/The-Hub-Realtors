<template>
  <div class="email-template-editor">
    <v-form @submit.prevent="saveTemplate">
      <v-row>
        <!-- Editor -->
        <v-col cols="6">
          <v-card>
            <v-card-title>Editor</v-card-title>
            <v-card-text>
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
                <v-card-subtitle>Componentes Disponíveis</v-card-subtitle>
                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    v-for="item in availableComponents"
                    :key="item.type"
                    variant="outlined"
                    color="primary"
                    class="mb-2 me-2"
                    @click="addComponent(item)"
                  >
                    <v-icon start>{{ item.icon }}</v-icon>
                    {{ item.type }}
                  </v-btn>
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div class="template-components">
                <v-card-subtitle>Template</v-card-subtitle>
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

        <!-- Pré-visualização -->
        <v-col cols="6">
          <v-card class="preview-card">
            <v-card-title>Pré-visualização</v-card-title>
            <v-card-text>
              <div class="preview-content">
                <div v-for="(element, index) in templateComponents" :key="index" class="preview-item">
                  <!-- Texto -->
                  <template v-if="element.type === 'text'">
                    <p class="text-content" :style="element.style">{{ element.content }}</p>
                  </template>
                  
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
  if (!templateName.value) {
    alert('Por favor, insira um nome para o template.');
    return;
  }

  const template = {
    name: templateName.value,
    description: templateDescription.value,
    components: templateComponents.value.map(component => ({
      ...component,
      id: component.id || uuidv4() // Garante que todos os componentes tenham um ID
    }))
  };

  console.log('Salvando template:', template);
  emit('save', template);
};
</script>

<style scoped>
.email-template-editor {
  padding: 16px;
}

.components-list {
  margin-bottom: 16px;
}

.template-components-list {
  min-height: 100px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 8px;
}

.component-item {
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
}

.preview-card {
  height: 100%;
  overflow-y: auto;
}

.preview-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.preview-item {
  margin: 8px 0;
}

.placeholder-image {
  width: 100%;
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background: #f5f5f5;
}

.image-preview {
  position: relative;
  margin: 8px 0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-height: 200px;
  background: #f5f5f5;
}

.v-img {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
  display: flex;
  gap: 4px;
  z-index: 1;
}

.image-upload {
  width: 100%;
}

.drag-handle {
  cursor: move;
}

.text-editor {
  width: 100%;
}

.button-editor {
  width: 100%;
}

.social-editor {
  width: 100%;
}

.social-icon {
  font-size: 24px;
  color: #666;
}

.social-icon:hover {
  color: var(--v-primary-base);
}

.white-space-pre {
  white-space: pre-wrap;
}

.text-content {
  white-space: pre-wrap;
  margin: 0;
}
</style>
