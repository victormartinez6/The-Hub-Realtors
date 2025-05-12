<template>
  <transition name="modal-fade">
    <div v-if="show && post" class="modal-backdrop" @click="emit('close')">
      <div class="modal-container" @click.stop>
        <!-- Botão Fechar -->
        <button @click="emit('close')" class="close-button">
          <i class="fas fa-times"></i>
        </button>
        
        <!-- Loading Overlay -->
        <div v-if="isGeneratingTemplate" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-title">Gerando template com IA</div>
            <v-progress-circular
              :size="70"
              :width="7"
              color="#01FBA1"
              indeterminate
            ></v-progress-circular>
            <div class="loading-message">{{ loadingMessage }}</div>
            <div class="loading-subtitle">Isso pode levar alguns segundos...</div>
          </div>
        </div>
        
        <div class="modal-content">
          <!-- Cabeçalho com informações do autor -->
          <div class="post-header">
            <div class="author-info">
              <img 
                :src="sanitizeUrl(post.author?.avatar)" 
                alt="Avatar" 
                class="author-avatar"
                @error="handleImageError" 
              />
              <div class="author-details">
                <h3 class="author-name">{{ post.author?.name || 'Usuário' }}</h3>
                <div class="post-meta">
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  <span v-if="post.propertyInfo?.type" class="property-type">
                    <i class="fas fa-building"></i> {{ post.propertyInfo.type }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <!-- Botões de ação para o autor ou admin -->
              <div v-if="isMyPost || isAdminOrSuperAdmin" class="admin-actions">
                <button 
                  @click="deletePost" 
                  class="action-button delete-button"
                  title="Excluir post"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
                <button 
                  v-if="isAdminOrSuperAdmin && post.propertyInfo" 
                  @click="openEditModal" 
                  class="action-button edit-button"
                  title="Editar informações do imóvel"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
              
              <!-- Botões de compartilhamento e marketing -->
              <div class="share-actions">
                <button 
                  @click="createEmailMarketing" 
                  class="action-button marketing-button"
                  title="Criar email marketing"
                >
                  <i class="fas fa-envelope"></i>
                </button>
                <button 
                  @click="generateWithAI" 
                  class="action-button ai-button"
                  title="Gerar email com IA"
                >
                  <i class="fas fa-robot"></i>
                </button>
                <button 
                  @click="sharePost" 
                  class="action-button share-button"
                  title="Compartilhar"
                >
                  <i class="fas fa-share-alt"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Galeria de imagens -->
          <div class="image-gallery">
            <div v-if="allImages.length > 0" class="gallery-container">
              <div class="main-image-container">
                <img 
                  :src="sanitizeUrl(allImages[currentImageIndex])" 
                  alt="Imagem do Imóvel" 
                  class="main-image"
                  @error="handleImageError"
                />
                
                <!-- Botões de navegação -->
                <button 
                  v-if="allImages.length > 1" 
                  @click.stop="prevImage()" 
                  class="gallery-nav prev-button"
                  aria-label="Imagem anterior"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button 
                  v-if="allImages.length > 1" 
                  @click.stop="nextImage()" 
                  class="gallery-nav next-button"
                  aria-label="Próxima imagem"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
                
                <!-- Contador de imagens -->
                <div class="image-counter">
                  {{ currentImageIndex + 1 }} / {{ allImages.length }}
                </div>
              </div>
              
              <!-- Miniaturas das imagens -->
              <div v-if="allImages.length > 1" class="thumbnails-container">
                <div 
                  v-for="(image, idx) in allImages" 
                  :key="idx" 
                  @click="currentImageIndex = idx" 
                  class="thumbnail"
                  :class="{ 'active': idx === currentImageIndex }"
                  :title="`Imagem ${idx + 1} de ${allImages.length}`"
                >
                  <img 
                    :src="sanitizeUrl(image)" 
                    alt="Miniatura" 
                    @error="handleImageError"
                  />
                </div>
              </div>
            </div>
            
            <div v-else class="no-images">
              <i class="fas fa-image"></i>
              <p>Nenhuma imagem disponível</p>
            </div>
          </div>
          
          <!-- Conteúdo do post -->
          <div class="post-content">
            <h2 class="post-title" v-html="post.caption"></h2>
            
            <div class="post-description">
              <p v-if="!showFullDescription && post.description && post.description.length > 300">
                {{ post.description.substring(0, 300) }}...
                <button @click="showFullDescription = true" class="read-more">Ler mais</button>
              </p>
              <p v-else class="full-description">{{ post.description }}</p>
              <button 
                v-if="showFullDescription && post.description && post.description.length > 300" 
                @click="showFullDescription = false" 
                class="read-less"
              >
                Mostrar menos
              </button>
            </div>
            
            <!-- Tags -->
            <div v-if="post.tags && post.tags.length > 0" class="tags-container">
              <span 
                v-for="tag in post.tags" 
                :key="tag" 
                class="tag"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
          
          <!-- Estatísticas de engajamento -->
          <div class="engagement-stats">
            <div class="stat-item">
              <i class="fas fa-heart"></i>
              <span>{{ post.likes?.length || 0 }} curtidas</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-eye"></i>
              <span>{{ post.views || 0 }} visualizações</span>
            </div>
            <div v-if="isMyPost || isAdminOrSuperAdmin" class="admin-actions-container">
              <button 
                @click="deletePost" 
                class="admin-action-button delete-button"
                title="Excluir post"
              >
                <i class="fas fa-trash-alt"></i>
                Excluir Post
              </button>
              <button 
                v-if="post.propertyInfo" 
                @click="openEditModal" 
                class="admin-action-button edit-button"
                title="Editar informações do imóvel"
              >
                <i class="fas fa-edit"></i>
                Editar Informações
              </button>
            </div>
          </div>
          
          <!-- Detalhes do imóvel -->
          <div v-if="post.propertyInfo" class="property-details">
            <div class="section-header">
              <h3>
                <i class="fas fa-home"></i>
                {{ post.propertyInfo.title || 'Detalhes do Imóvel' }}
              </h3>
              <button 
                @click="showFullDetails = !showFullDetails" 
                class="toggle-details"
              >
                <i :class="showFullDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                {{ showFullDetails ? 'Menos detalhes' : 'Mais detalhes' }}
              </button>
            </div>
            
            <!-- Características principais -->
            <div class="property-highlights">
              <div v-if="post.propertyInfo.price" class="highlight-item">
                <div class="highlight-icon">
                  <i class="fas fa-tag"></i>
                </div>
                <div class="highlight-content">
                  <span class="highlight-label">Preço</span>
                  <span class="highlight-value">{{ formatPrice(post.propertyInfo.price) }}</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.area" class="highlight-item">
                <div class="highlight-icon">
                  <i class="fas fa-ruler-combined"></i>
                </div>
                <div class="highlight-content">
                  <span class="highlight-label">Área</span>
                  <span class="highlight-value">{{ post.propertyInfo.area }}m²</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.rooms" class="highlight-item">
                <div class="highlight-icon">
                  <i class="fas fa-bed"></i>
                </div>
                <div class="highlight-content">
                  <span class="highlight-label">Quartos</span>
                  <span class="highlight-value">{{ post.propertyInfo.rooms }}</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.bathrooms" class="highlight-item">
                <div class="highlight-icon">
                  <i class="fas fa-bath"></i>
                </div>
                <div class="highlight-content">
                  <span class="highlight-label">Banheiros</span>
                  <span class="highlight-value">{{ post.propertyInfo.bathrooms }}</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.garage" class="highlight-item">
                <div class="highlight-icon">
                  <i class="fas fa-car"></i>
                </div>
                <div class="highlight-content">
                  <span class="highlight-label">Vagas</span>
                  <span class="highlight-value">{{ post.propertyInfo.garage }}</span>
                </div>
              </div>
            </div>
            
            <!-- Detalhes adicionais -->
            <div v-if="showFullDetails" class="additional-details">
              <div v-if="post.propertyInfo.address" class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                  <span class="detail-label">Localização</span>
                  <span class="detail-value">{{ post.propertyInfo.address }}</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.mlsId" class="detail-item">
                <i class="fas fa-id-card"></i>
                <div>
                  <span class="detail-label">MLS ID</span>
                  <span class="detail-value">{{ post.propertyInfo.mlsId }}</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.commissionPercentage" class="detail-item">
                <i class="fas fa-percentage"></i>
                <div>
                  <span class="detail-label">Comissão</span>
                  <span class="detail-value">{{ post.propertyInfo.commissionPercentage }}%</span>
                </div>
              </div>
              
              <div v-if="post.propertyInfo.status" class="detail-item">
                <i class="fas fa-info-circle"></i>
                <div>
                  <span class="detail-label">Status</span>
                  <span class="detail-value">{{ post.propertyInfo.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
  
  <!-- Modal de edição -->
  <v-dialog v-model="showEditModal" max-width="500px">
    <div class="edit-modal">
      <h2 class="edit-modal-title">Editar Informações do Imóvel</h2>
      
      <div class="edit-form">
        <div class="form-group">
          <label for="price">Preço</label>
          <div class="price-input">
            <span class="currency-symbol">$</span>
            <input 
              id="price"
              v-model="formattedEditPrice" 
              type="text" 
              @input="formatPriceInput"
              class="form-control"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="mlsId">MLS ID</label>
          <input 
            id="mlsId"
            v-model="editForm.mlsId" 
            type="text" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label for="commission">Comissão (%)</label>
          <input 
            id="commission"
            v-model.number="editForm.commissionPercentage" 
            type="number" 
            min="0" 
            max="100" 
            step="0.1" 
            class="form-control"
          />
        </div>
      </div>
      
      <div class="edit-modal-actions">
        <button @click="showEditModal = false" class="cancel-button">
          Cancelar
        </button>
        <button @click="savePropertyInfo" class="save-button">
          Salvar
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useInstaHubStore } from '../../stores/instaHubStore';
import { openAIService } from '../../services/openai.service';
import emailTemplateService from '../../services/emailTemplate.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const router = useRouter();
const authStore = useAuthStore();
const instaHubStore = useInstaHubStore();

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  post: {
    type: Object,
    default: null
  },
  isInteressado: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'delete', 'goToFeed', 'desmarcarInteresse', 'update']);

// Estado para carrossel de imagens
const currentImageIndex = ref(0);
const allImages = computed(() => {
  if (!props.post) return [];
  
  const images: string[] = [];
  
  try {
    // Adicionar imagens do post
    if (props.post.mediaFiles && Array.isArray(props.post.mediaFiles)) {
      const validMediaFiles = props.post.mediaFiles.filter(url => !!url);
      images.push(...validMediaFiles);
    }
    
    // Adicionar imagens do post (campo alternativo)
    if (props.post.images && Array.isArray(props.post.images)) {
      const validImages = props.post.images.filter(url => !!url);
      images.push(...validImages);
    }
    
    // Adicionar imagens das informações do imóvel
    if (props.post.propertyInfo) {
      // Adicionar imagens do imóvel (array)
      if (props.post.propertyInfo.images && Array.isArray(props.post.propertyInfo.images)) {
        const validPropertyImages = props.post.propertyInfo.images.filter(url => !!url);
        images.push(...validPropertyImages);
      }
      
      // Adicionar imagem do imóvel (URL única)
      if (props.post.propertyInfo.imageUrl) {
        images.push(props.post.propertyInfo.imageUrl);
      }
    }
    
    // Remover duplicatas e valores vazios
    return [...new Set(images)].filter(img => img);
  } catch (error) {
    console.error('Erro ao processar imagens do post:', error);
    return [];
  }
});

// Resetar o índice da imagem quando o post mudar
watch(() => props.post, () => {
  currentImageIndex.value = 0;
});

// Funções para navegação de imagens
function prevImage() {
  if (allImages.value.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value - 1 + allImages.value.length) % allImages.value.length;
}

function nextImage() {
  if (allImages.value.length <= 1) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % allImages.value.length;
}

// Função para formatar datas
function formatDate(timestamp: any) {
  if (!timestamp) return 'Data não disponível';
  
  try {
    // Se for um objeto Timestamp do Firestore
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    }
    
    // Se for um objeto Date ou string/número que pode ser convertido para Date
    return format(new Date(timestamp), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data não disponível';
  }
}

// Função para formatar preços
function formatPrice(price: number | string) {
  if (!price) return 'Preço não disponível';
  
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(numericPrice);
  } catch (error) {
    console.error('Erro ao formatar preço:', error);
    return 'Preço não disponível';
  }
}

// Função para lidar com erros de carregamento de imagem
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  const originalSrc = target.src;
  
  // Evitar loop infinito se a imagem de fallback também falhar
  if (originalSrc.includes('data:image/svg+xml;base64')) {
    return;
  }
  
  console.warn(`Erro ao carregar imagem: ${originalSrc}`);
  
  // Usar uma imagem base64 em vez de um serviço externo
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2VtIG7Do28gZGlzcG9uw612ZWw8L3RleHQ+PC9zdmc+';
}

// Função para sanitizar URLs
function sanitizeUrl(url: string | undefined | null | any): string {
  // Se o valor for nulo, undefined ou não for uma string
  if (!url || typeof url !== 'string') {
    // Usar uma imagem base64 em vez de um serviço externo
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+U2VtIGltYWdlbTwvdGV4dD48L3N2Zz4=';
  }
  
  try {
    // Se a URL já for uma string base64, retorná-la diretamente
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Se for uma URL HTTP/HTTPS normal
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se for uma URL relativa ou caminho de armazenamento do Firebase
    if (url.startsWith('/') || url.startsWith('gs://') || url.includes('firebasestorage')) {
      return url;
    }
    
    // Tentar converter para base64 se for uma string longa (possível base64 sem prefixo)
    if (url.length > 100 && !url.includes(' ')) {
      try {
        return `data:image/jpeg;base64,${url}`;
      } catch (error) {
        console.error('Erro ao processar possível string base64:', error);
      }
    }
    
    return url;
  } catch (error) {
    console.error('Erro ao processar URL:', error, url);
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+RXJybyBuYSBpbWFnZW08L3RleHQ+PC9zdmc+';
  }
}

// Verificar se o post pertence ao usuário logado
const isMyPost = computed(() => {
  if (!props.post || !props.post.authorId || !authStore.user) {
    return false;
  }
  
  if (props.post.authorId && authStore.user.uid === props.post.authorId) {
    return true;
  }
  
  return false;
});

// Verificar se o usuário é admin ou super_admin
const isAdminOrSuperAdmin = computed(() => {
  return authStore.userRole === 'admin' || authStore.userRole === 'super_admin';
});

// Estado para o modal de edição
const showEditModal = ref(false);
const editForm = ref({
  price: 0,
  mlsId: '',
  commissionPercentage: 0,
});
const formattedEditPrice = ref('');

// Função para abrir o modal de edição
function openEditModal() {
  if (!props.post || !props.post.propertyInfo) return;
  
  editForm.value = {
    price: Number(props.post.propertyInfo.price) || 0,
    mlsId: props.post.propertyInfo.mlsId || '',
    commissionPercentage: props.post.propertyInfo.commissionPercentage || 0
  };
  
  formattedEditPrice.value = new Intl.NumberFormat('en-US', { 
    style: 'decimal',
    maximumFractionDigits: 0 
  }).format(editForm.value.price);
  
  showEditModal.value = true;
}

// Função para formatar o input de preço
function formatPriceInput() {
  // Remover todos os caracteres não numéricos
  const numericValue = formattedEditPrice.value.replace(/\D/g, '');
  
  // Converter para número
  const numericPrice = Number(numericValue);
  
  // Atualizar o valor no formulário
  editForm.value.price = numericPrice;
  
  // Formatar para exibição
  if (numericValue) {
    formattedEditPrice.value = new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 0 
    }).format(numericPrice);
  } else {
    formattedEditPrice.value = '';
  }
}

// Função para salvar as informações do imóvel
async function savePropertyInfo() {
  if (!props.post || !props.post.id) return;
  
  try {
    // Preparar os dados atualizados
    const updatedPropertyInfo = {
      ...props.post.propertyInfo,
      price: editForm.value.price,
      mlsId: editForm.value.mlsId,
      commissionPercentage: editForm.value.commissionPercentage
    };
    
    // Atualizar o post
    await instaHubStore.updatePostPropertyInfo(props.post.id, updatedPropertyInfo);
    
    // Emitir evento de atualização
    emit('update', props.post.id);
    
    // Fechar o modal de edição
    showEditModal.value = false;
  } catch (error) {
    console.error('Erro ao salvar informações do imóvel:', error);
    alert('Ocorreu um erro ao salvar as informações do imóvel. Por favor, tente novamente.');
  }
}

// Função para excluir o post
async function deletePost() {
  if (!props.post || !props.post.id) return;
  
  try {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      await instaHubStore.deletePost(props.post.id);
      
      // Emitir evento de exclusão
      emit('delete', props.post.id);
      
      // Fechar o modal
      emit('close');
    }
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    alert('Ocorreu um erro ao excluir o post. Por favor, tente novamente.');
  }
}

// Função para criar email marketing a partir do post
function createEmailMarketing() {
  if (!props.post) return;
  
  // Preparar os dados do post para o template de email
  const postData = {
    id: props.post.id,
    title: props.post.caption,
    description: props.post.description,
    images: allImages.value, // Usar todas as imagens disponíveis
    tags: props.post.tags || [],
    propertyInfo: props.post.propertyInfo || {},
    author: props.post.author || {},
    createdAt: props.post.createdAt
  };
  
  // Armazenar os dados no localStorage para recuperá-los na página de templates
  localStorage.setItem('emailMarketingPostData', JSON.stringify(postData));
  
  // Navegar para a página de templates de email
  router.push('/admin/email-templates?mode=marketing');
}

// Função para compartilhar o post
function sharePost() {
  if (!props.post) return;
  
  // Implementar a lógica de compartilhamento
  // Por exemplo, usando a Web Share API se disponível
  if (navigator.share) {
    navigator.share({
      title: props.post.caption,
      text: props.post.description,
      url: window.location.href
    }).catch(error => {
      console.error('Erro ao compartilhar:', error);
    });
  } else {
    // Fallback para navegadores que não suportam a Web Share API
    alert('Compartilhe este link: ' + window.location.href);
  }
}

// Estado para controle de descrição e detalhes
const showFullDescription = ref(false);
const showFullDetails = ref(false);

// Estado para controlar a geração de template com IA
const isGeneratingTemplate = ref(false);
const loadingMessage = ref('Preparando dados...');
const loadingProgress = ref(0);

/**
 * Gera um template de email marketing usando IA diretamente
 */
async function generateWithAI() {
  if (!props.post) return;
  
  try {
    isGeneratingTemplate.value = true;
    loadingMessage.value = 'Preparando dados...';
    loadingProgress.value = 10;
    
    // Preparar os dados do post para enviar para a API
    const postData = {
      title: props.post.caption || '',
      description: props.post.description || '',
      images: allImages.value, // Usar todas as imagens disponíveis
      propertyInfo: props.post.propertyInfo || {},
      author: props.post.author || {},
      createdAt: props.post.createdAt
    };
    
    // Simular progresso
    loadingMessage.value = 'Conectando à API de IA...';
    loadingProgress.value = 30;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Chamar o serviço OpenAI para gerar o template
    loadingMessage.value = 'Gerando conteúdo personalizado...';
    loadingProgress.value = 50;
    const htmlContent = await openAIService.generateEmailTemplate(postData);
    
    loadingMessage.value = 'Formatando template...';
    loadingProgress.value = 70;
    
    // Criar um novo template com o HTML gerado
    const template = {
      name: `Email Marketing IA - ${postData.title}`,
      description: 'Template gerado automaticamente com IA a partir de um post do InstaHub',
      components: [
        {
          type: 'html',
          content: htmlContent,
          style: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333'
          }
        }
      ]
    };
    
    // Salvar o template
    loadingMessage.value = 'Salvando template...';
    loadingProgress.value = 90;
    await emailTemplateService.createTemplate(template);
    
    loadingMessage.value = 'Concluído!';
    loadingProgress.value = 100;
    
    // Aguardar um momento para mostrar que foi concluído
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fechar o modal
    emit('close');
    
    // Redirecionar para a página de templates
    router.push('/admin/email-templates');
    
  } catch (error: any) {
    console.error('Erro ao gerar template com IA:', error);
    alert(`Erro ao gerar template com IA: ${error.message || 'Tente novamente mais tarde'}`);
  } finally {
    isGeneratingTemplate.value = false;
    loadingProgress.value = 0;
  }
}

// Importar a fonte Montserrat do Google Fonts
const montserratLink = document.createElement('link');
montserratLink.rel = 'stylesheet';
montserratLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap';
document.head.appendChild(montserratLink);

// Importar Font Awesome se ainda não estiver disponível
if (!document.querySelector('link[href*="fontawesome"]')) {
  const fontAwesomeLink = document.createElement('link');
  fontAwesomeLink.rel = 'stylesheet';
  fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(fontAwesomeLink);
}
</script>

<style scoped>
/* Estilos gerais */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  font-family: 'Montserrat', sans-serif;
}

.modal-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modal-appear 0.3s ease-out;
}

.modal-content {
  padding: 20px;
}

/* Botão de fechar */
.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(69, 26, 55, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #451A37;
  transform: scale(1.1);
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 16px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.loading-title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.loading-message {
  color: white;
  font-size: 18px;
  margin-top: 20px;
}

.loading-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 10px;
}

/* Cabeçalho do post */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #01FBA1;
}

.author-details {
  margin-left: 12px;
}

.author-name {
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 3px 0;
  color: #451A37;
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.post-date {
  margin-right: 10px;
}

.property-type {
  display: flex;
  align-items: center;
}

.property-type i {
  margin-right: 4px;
  color: #01FBA1;
}

/* Botões de ação */
.action-buttons {
  display: flex;
  gap: 10px;
}

.admin-actions, .share-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background-color: #f5f5f5;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #451A37;
}

.action-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.delete-button:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.edit-button:hover {
  background-color: #e3f2fd;
  color: #1976d2;
}

.marketing-button:hover, .ai-button:hover {
  background-color: #e0f7fa;
  color: #0097a7;
}

.share-button:hover {
  background-color: #e8f5e9;
  color: #388e3c;
}

/* Galeria de imagens */
.image-gallery {
  margin: 20px 0;
  border-radius: 12px;
  overflow: hidden;
}

.gallery-container {
  display: flex;
  flex-direction: column;
}

.main-image-container {
  position: relative;
  width: 100%;
  height: 450px;
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
  background-color: #000;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(69, 26, 55, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.gallery-nav:hover {
  background-color: #451A37;
  transform: translateY(-50%) scale(1.1);
}

.gallery-nav i {
  font-size: 18px;
}

.prev-button {
  left: 15px;
}

.next-button {
  right: 15px;
}

.thumbnails-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding: 0 10px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #01FBA1 #f5f5f5;
}

.thumbnails-container::-webkit-scrollbar {
  height: 6px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background-color: #01FBA1;
  border-radius: 10px;
}

.thumbnail {
  flex: 0 0 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.thumbnail:hover {
  opacity: 0.9;
}

.thumbnail.active {
  opacity: 1;
  border-color: #01FBA1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-images {
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.no-images i {
  font-size: 48px;
  margin-bottom: 10px;
}

/* Conteúdo do post */
.post-content {
  padding: 0 20px;
}

.post-title {
  font-size: 22px;
  font-weight: 700;
  color: #451A37;
  margin: 0 0 15px 0;
}

.post-description {
  color: #333;
  line-height: 1.6;
  margin-bottom: 20px;
}

.read-more, .read-less {
  background: none;
  border: none;
  color: #01FBA1;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.read-more:hover, .read-less:hover {
  text-decoration: underline;
}

.full-description {
  white-space: pre-line;
}

/* Tags */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.tag {
  background-color: #f0f0f0;
  color: #451A37;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Estatísticas de engajamento */
.engagement-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
  color: #555;
}

.stat-item i {
  margin-right: 8px;
  color: #451A37;
}

.admin-actions-container {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.admin-action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.delete-button {
  background-color: #ffebee;
  color: #d32f2f;
}

.delete-button:hover {
  background-color: #d32f2f;
  color: white;
}

.edit-button {
  background-color: #e3f2fd;
  color: #1976d2;
}

.edit-button:hover {
  background-color: #1976d2;
  color: white;
}

/* Detalhes do imóvel */
.property-details {
  margin-top: 25px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #451A37;
  margin: 0;
}

.section-header h3 i {
  margin-right: 8px;
  color: #01FBA1;
}

.toggle-details {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-details i {
  margin-right: 5px;
}

.property-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.highlight-item {
  display: flex;
  align-items: center;
}

.highlight-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(1, 251, 161, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.highlight-icon i {
  color: #01FBA1;
  font-size: 18px;
}

.highlight-content {
  display: flex;
  flex-direction: column;
}

.highlight-label {
  font-size: 12px;
  color: #666;
}

.highlight-value {
  font-weight: 600;
  color: #333;
}

/* Animações */
@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* Contador de imagens */
.image-counter {
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: rgba(69, 26, 55, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  z-index: 5;
}
</style>
