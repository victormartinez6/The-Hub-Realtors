<template>
  <!-- Modal de carregamento durante a geração do template -->
  <div class="loading-modal" v-if="isGenerating">
    <div class="loading-content">
      <img src="@/assets/images/simbolo_ia.svg" alt="IA" class="loading-symbol" />
      <h2>Gerando Template com IA</h2>
      <p>Estamos criando um template personalizado para seu imóvel...</p>
      <div class="loading-progress">
        <div class="loading-progress-fill"></div>
      </div>
    </div>
  </div>

  <div class="sidebar-backdrop" @click.self="closeSidebar">
    <aside class="sidebar-panel" :class="{ open: show }">
      <button class="close-btn" @click="closeSidebar">
        <i class="fas fa-times"></i>
      </button>
      <div class="sidebar-content">
        <!-- Galeria de imagens -->
        <div v-if="allImages.length > 0" class="sidebar-gallery">
          <img :src="sanitizeUrl(allImages[currentImageIndex])" alt="Imagem do Imóvel" class="sidebar-main-image" @error="handleImageError" />
          <div v-if="allImages.length > 1" class="sidebar-thumbnails">
            <img v-for="(img, idx) in allImages" :key="idx" :src="sanitizeUrl(img)" :class="{ active: idx === currentImageIndex }" @click="currentImageIndex = idx" @error="handleImageError" alt="Miniatura" />
          </div>
        </div>
        <div v-else class="sidebar-no-image">
          <i class="fas fa-image"></i>
          <p>Nenhuma imagem disponível</p>
        </div>
        <!-- Detalhes do post -->
        <div class="sidebar-details">
          <h2 class="sidebar-title" v-html="formatCaption(post?.caption)"></h2>
          <div class="sidebar-description">{{ post?.description }}</div>
          <div class="sidebar-info">
            <div v-if="post?.propertyInfo?.price" class="sidebar-info-item">
              <i class="fas fa-tag"></i> {{ formatPrice(post.propertyInfo.price) }}
            </div>
            <div v-if="post?.propertyInfo?.address" class="sidebar-info-item">
              <i class="fas fa-map-marker-alt"></i> {{ post.propertyInfo.address }}
            </div>
            <div v-if="post?.propertyInfo?.area" class="sidebar-info-item">
              <i class="fas fa-ruler-combined"></i> {{ post.propertyInfo.area }} m²
            </div>
            <div v-if="post?.propertyInfo?.rooms" class="sidebar-info-item">
              <i class="fas fa-bed"></i> {{ post.propertyInfo.rooms }} quartos
            </div>
            <div v-if="post?.propertyInfo?.bathrooms" class="sidebar-info-item">
              <i class="fas fa-bath"></i> {{ post.propertyInfo.bathrooms }} banheiros
            </div>
            <div v-if="post?.propertyInfo?.garage" class="sidebar-info-item">
              <i class="fas fa-car"></i> {{ post.propertyInfo.garage }} vagas
            </div>
            <div v-if="post?.propertyInfo?.mlsId" class="sidebar-info-item">
              <i class="fas fa-id-card"></i> MLS ID: {{ post.propertyInfo.mlsId }}
            </div>
            <div v-if="post?.propertyInfo?.commissionPercentage" class="sidebar-info-item">
              <i class="fas fa-percentage"></i> Comissão: {{ post.propertyInfo.commissionPercentage }}%
            </div>
            <div v-if="post?.propertyInfo?.status" class="sidebar-info-item">
              <i class="fas fa-info-circle"></i> Status: {{ post.propertyInfo.status }}
            </div>
          </div>
        </div>
        <!-- Tags -->
        <div v-if="post?.tags && post.tags.length" class="sidebar-tags">
          <span v-for="tag in post.tags" :key="tag" class="sidebar-tag">#{{ tag }}</span>
        </div>
        <!-- Autor -->
        <div class="sidebar-author">
          <img :src="sanitizeUrl(post?.author?.avatar)" class="sidebar-author-avatar" @error="handleImageError" alt="Avatar" />
          <span class="sidebar-author-name">{{ post?.author?.name || 'Usuário' }}</span>
        </div>
        <!-- Botões de Template -->
        <div class="sidebar-actions">
          <button class="sidebar-action-btn" @click="generateTemplate()">
            <i class="fas fa-file-alt"></i> Gerar Template
          </button>
          <button class="sidebar-action-btn ai" :disabled="isGenerating" @click="generateTemplateWithAI()">
            <i class="fas fa-robot"></i>
            <span>Gerar Template com IA</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import { openAIService } from '../../services/openai.service';
import emailTemplateService from '../../services/emailTemplate.service';

const props = defineProps({
  show: Boolean,
  post: Object,
});
const emit = defineEmits(['close', 'generateTemplate', 'generateTemplateAI']);

const router = useRouter();
const authStore = useAuthStore();
const currentImageIndex = ref(0);
const isGenerating = ref(false);

const PLACEHOLDER_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxNTAlIiB5PSIxNTAlIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5TZW0gaW1hZ2VtPC90ZXh0Pjwvc3ZnPg=='

const allImages = computed(() => {
  if (!props.post) return [];
  
  const images: string[] = [];
  
  // Buscar imagens de mediaFiles (formato correto após criação do post)
  if (props.post.mediaFiles && Array.isArray(props.post.mediaFiles)) {
    props.post.mediaFiles.forEach(media => {
      if (media && media.url) {
        images.push(media.url);
      }
    });
  }
  
  // Fallback para outros formatos possíveis
  if (images.length === 0) {
    if (props.post.images && Array.isArray(props.post.images)) {
      images.push(...props.post.images.filter(Boolean));
    }
    
    if (props.post.propertyInfo) {
      if (props.post.propertyInfo.images && Array.isArray(props.post.propertyInfo.images)) {
        images.push(...props.post.propertyInfo.images.filter(Boolean));
      }
      if (props.post.propertyInfo.imageUrl) {
        images.push(props.post.propertyInfo.imageUrl);
      }
    }
  }
  
  return [...new Set(images)].filter(Boolean);
});
watch(() => props.post, (newPost) => {
  console.log('Sidebar recebeu post:', newPost); // Log para depuração
  currentImageIndex.value = 0;
});

function closeSidebar() {
  emit('close');
}

function sanitizeUrl(url: string | undefined | null | any): string {
  if (!url || typeof url !== 'string') {
    // Sempre usa o SVG como fallback
    return PLACEHOLDER_SVG;
  }
  try {
    if (url.startsWith('data:image') || url.startsWith('http')) return url;
    return url;
  } catch (error) {
    return PLACEHOLDER_SVG;
  }
}
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (!target) return;

  // Sempre usa o SVG como fallback
  target.src = PLACEHOLDER_SVG;
}
function formatPrice(price: number | string) {
  if (!price) return 'Preço não disponível';
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numericPrice);
  } catch {
    return 'Preço não disponível';
  }
}
function formatCaption(caption: string) {
  if (!caption) return '';
  // Exemplo: transformar hashtags em destaque, links clicáveis, etc.
  // Aqui apenas convertemos \n para <br> para simular a quebra de linha
  return caption.replace(/\n/g, '<br>');
}

/**
 * Função para criar um template de email marketing a partir do post
 */
async function generateTemplate() {
  if (!props.post) return;
  
  // Obter dados do usuário e configurações de marketing
  const userData = authStore.userData || {};
  // Corrigir o erro de tipagem definindo explicitamente o tipo
  const marketingConfig = (userData as any).marketingConfig || {};
  
  // Verificar se existe uma logo da empresa para usar como header caso não tenha header padrão
  const hasHeaderImage = !!marketingConfig.headerImageUrl;
  const hasLogoImage = !!marketingConfig.logoUrl;
  
  // Se não tiver nem header nem logo, solicitar configuração
  if (!hasHeaderImage && !hasLogoImage) {
    alert('Você precisa configurar uma Imagem de Header Padrão ou Logo da Empresa no seu perfil antes de gerar um template.');
    router.push('/profile');
    return;
  }
  
  // Preparar os dados do post para o template de email
  const postData = {
    id: props.post.id,
    title: props.post.caption,
    description: props.post.description,
    images: allImages.value,
    tags: props.post.tags || [],
    propertyInfo: props.post.propertyInfo || {},
    author: props.post.author || {},
    createdAt: props.post.createdAt
  };
  
  // Criar array de componentes para o template
  const components: any[] = [];
  
  // 1. Adicionar o componente de imagem para o cabeçalho
  // Se tiver header padrão, usa ele. Senão, usa a logo da empresa com largura de 250px
  if (hasHeaderImage) {
    components.push({
      type: 'image',
      content: marketingConfig.headerImageUrl,
      style: {
        width: '100%',
        maxWidth: '600px',
        margin: '0',
        borderRadius: '8px 8px 0 0',
        display: 'block'
      }
    });
  } else {
    // Usar a logo como header com largura fixa de 250px
    components.push({
      type: 'image',
      content: marketingConfig.logoUrl,
      style: {
        width: '250px',
        height: 'auto',
        margin: '20px auto',
        display: 'block',
        borderRadius: '8px 8px 0 0'
      }
    });
  }
  
  // 2. Adicionar o componente de título (substituindo o H1)
  components.push({
    type: 'title',
    content: postData.title || 'Imóvel Exclusivo',
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: marketingConfig.primaryColor || '#012928',
      textAlign: 'center',
      margin: '20px 0',
      padding: '10px 0'
    }
  });
  
  // 3. Adicionar o componente de texto para a descrição
  if (postData.description) {
    components.push({
      type: 'text',
      content: postData.description,
      style: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#333',
        margin: '0 0 20px'
      }
    });
  }
  
  // 4. Criar o template HTML para os detalhes do imóvel
  const bodyHtml = `
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
      <h2 style="color: ${marketingConfig.primaryColor || '#012928'}; font-size: 20px; margin: 0 0 20px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Detalhes do Imóvel</h2>
      
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
        ${postData.propertyInfo.price ? `
          <div style="flex: 0 0 48%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">$</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Preço</div>
                <div style="font-size: 16px;">${formatPrice(postData.propertyInfo.price)}</div>
              </div>
            </div>
          </div>` : ''}
        
        ${postData.propertyInfo.type ? `
          <div style="flex: 0 0 48%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">🏠</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Tipo</div>
                <div style="font-size: 16px;">${postData.propertyInfo.type}</div>
              </div>
            </div>
          </div>` : ''}
        
        ${postData.propertyInfo.area ? `
          <div style="flex: 0 0 48%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">📏</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Área</div>
                <div style="font-size: 16px;">${postData.propertyInfo.area} m²</div>
              </div>
            </div>
          </div>` : ''}
        
        ${postData.propertyInfo.rooms ? `
          <div style="flex: 0 0 48%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">🛏️</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Quartos</div>
                <div style="font-size: 16px;">${postData.propertyInfo.rooms}</div>
              </div>
            </div>
          </div>` : ''}
        
        ${postData.propertyInfo.bathrooms ? `
          <div style="flex: 0 0 48%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">🚿</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Banheiros</div>
                <div style="font-size: 16px;">${postData.propertyInfo.bathrooms}</div>
              </div>
            </div>
          </div>` : ''}
        
        ${postData.propertyInfo.garage ? `
          <div style="flex: 0 0 48%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">🚗</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Vagas</div>
                <div style="font-size: 16px;">${postData.propertyInfo.garage}</div>
              </div>
            </div>
          </div>` : ''}
        
        ${postData.propertyInfo.address ? `
          <div style="flex: 0 0 100%; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <div style="width: 30px; height: 30px; background-color: ${marketingConfig.primaryColor || '#012928'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <span style="color: white; font-size: 14px;">📍</span>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 14px; color: #555;">Endereço</div>
                <div style="font-size: 16px;">${postData.propertyInfo.address}</div>
              </div>
            </div>
          </div>` : ''}
      </div>
    </div>
  `;
  
  // 5. Adicionar o HTML dos detalhes como um componente HTML
  components.push({
    type: 'html',
    content: bodyHtml,
    style: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#333',
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto'
    }
  });
  
  // 6. Adicionar título para a seção de imagens
  if (postData.images && postData.images.length > 0) {
    // Adicionar um título para a seção de imagens
    components.push({
      type: 'title',
      content: 'Imagens do Imóvel',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: marketingConfig.primaryColor || '#012928',
        textAlign: 'center',
        margin: '20px 0 10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }
    });
    
    // 7. Adicionar cada imagem como um componente de imagem separado
    postData.images.forEach((imageUrl) => {
      components.push({
        type: 'image',
        content: imageUrl,
        style: {
          width: '100%',
          maxWidth: '560px',
          margin: '0 auto 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      });
    });
  }
  
  // 8. Criar o HTML do rodapé com melhor contraste e novo layout
  const footerHtml = `
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0; width: 100%; max-width: 600px; margin: 0 auto;">
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
        <!-- Logo -->
        <div style="flex-shrink: 0; width: 100px;">
          ${marketingConfig.logoUrl ? `<img src="${marketingConfig.logoUrl}" alt="Logo" style="max-height: 50px; max-width: 100px; object-fit: contain;">` : ''}
        </div>
        
        <!-- Informações de contato com foto do perfil -->
        <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
          <div style="flex-shrink: 0;">
            ${(userData as any).photoURL ? `<img src="${(userData as any).photoURL}" alt="${(userData as any).displayName || 'The Hub Realtors'}" style="height: 48px; width: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #e0e0e0;">` : ''}
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 500; color: #333;">
              ${(userData as any).displayName || 'The Hub Realtors'}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${(userData as any).email || ''}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${(userData as any).phoneNumber || ''}
            </div>
          </div>
        </div>
        
        <!-- Ícones de redes sociais -->
        <div style="display: flex; gap: 8px;">
          ${(userData as any).instagram ? `
          <a href="${(userData as any).instagram}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;" title="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#666"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
          ` : ''}
          
          ${(userData as any).website ? `
          <a href="${(userData as any).website.startsWith('http') ? (userData as any).website : 'https://' + (userData as any).website}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;" title="Website"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="#666"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"/></svg></a>
          ` : ''}
        </div>
      </div>
      
      <div style="margin-top: 16px; font-size: 12px; color: #999; text-align: center;">
        &copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.
      </div>
    </div>
  `;
  
  // 9. Adicionar o rodapé como componente HTML
  components.push({
    type: 'html',
    content: footerHtml,
    style: {
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#666',
      width: '100%',
      maxWidth: '600px',
      margin: '20px auto 0'
    }
  });
  
  // Criar um novo template
  const template = {
    name: `Email Marketing - ${postData.title || 'Imóvel Exclusivo'}`,
    description: 'Template gerado a partir de um post do InstaHub',
    components: components
  };
  
  try {
    // Salvar o template
    await emailTemplateService.createTemplate(template);
    
    // Fechar a sidebar
    closeSidebar();
    
    // Navegar para a página de templates de email
    router.push('/admin/email-templates');
  } catch (error: any) {
    console.error('Erro ao criar template:', error);
    alert(`Erro ao criar template: ${error.message || 'Tente novamente mais tarde'}`);
  }
}

/**
 * Função para gerar um template de email marketing usando IA
 */
async function generateTemplateWithAI() {
  if (!props.post) return;
  
  try {
    isGenerating.value = true;
    
    // Obter dados do perfil do usuário para cabeçalho e rodapé
    const userData = authStore.userData || {};
    // Corrigir o erro de tipagem definindo explicitamente o tipo
    const marketingConfig = (userData as any).marketingConfig || {};
    
    // Verificar se existe uma logo da empresa para usar como header caso não tenha header padrão
    const hasHeaderImage = !!marketingConfig.headerImageUrl;
    const hasLogoImage = !!marketingConfig.logoUrl;
    
    // Se não tiver nem header nem logo, solicitar configuração
    if (!hasHeaderImage && !hasLogoImage) {
      alert('Você precisa configurar uma Imagem de Header Padrão ou Logo da Empresa no seu perfil antes de gerar um template.');
      router.push('/profile');
      return;
    }
    
    // Preparar os dados do post para enviar para a API
    const postData = {
      title: props.post.caption || '',
      description: props.post.description || '',
      images: allImages.value,
      propertyInfo: props.post.propertyInfo || {},
      author: props.post.author || {},
      createdAt: props.post.createdAt
    };
    
    // Chamar o serviço OpenAI para gerar o template
    const htmlContent = await openAIService.generateEmailTemplate(postData);
    
    // Criar um array de componentes para o template
    const components = [];
    
    // Criar um container principal para envolver todo o conteúdo e garantir alinhamento consistente
    const containerStyle = {
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };
    
    // 1. Adicionar o componente de imagem para o cabeçalho
    // Se tiver header padrão, usa ele. Senão, usa a logo da empresa com largura de 250px
    if (hasHeaderImage) {
      components.push({
        type: 'image',
        content: marketingConfig.headerImageUrl,
        style: {
          width: '100%',
          maxWidth: '600px',
          margin: '0',
          borderRadius: '8px 8px 0 0',
          display: 'block'
        }
      });
    } else {
      // Usar a logo como header com largura fixa de 250px
      components.push({
        type: 'image',
        content: marketingConfig.logoUrl,
        style: {
          width: '250px',
          height: 'auto',
          margin: '20px auto',
          display: 'block',
          borderRadius: '8px 8px 0 0'
        }
      });
    }
    
    // 2. Adicionar o componente HTML para o conteúdo gerado pela IA
    // Processar o conteúdo HTML para garantir que fique dentro dos limites do container e tenha bom contraste
    const processedHtmlContent = htmlContent
      // Remover divs com width ou max-width que possam afetar o alinhamento
      .replace(/<div[^>]*style=['"](.*?)width:[^'"]*['"](.*?)>/gi, '<div>')
      .replace(/<div[^>]*style=['"](.*?)max-width:[^'"]*['"](.*?)>/gi, '<div>')
      // Remover atributos de alinhamento
      .replace(/align=['"](.*?)['"]|text-align:[^;]*;/gi, '')
      // Limitar a largura de todas as tabelas
      .replace(/<table/gi, '<table style="max-width:560px;width:100%;margin:0 auto;"')
      // Limitar a largura de todas as imagens
      .replace(/<img/gi, '<img style="max-width:100%;height:auto;"')
      // Limitar a largura de todos os elementos div
      .replace(/<div(?![^>]*style)/gi, '<div style="max-width:100%;"')
      // Forçar quebra de palavra para evitar overflow
      .replace(/<p/gi, '<p style="word-wrap:break-word;overflow-wrap:break-word;"')
      // Melhorar o contraste de cores em fundos escuros
      .replace(/background-color:\s*#([0-9a-f]{6}|[0-9a-f]{3});?\s*color:\s*#([0-9a-f]{6}|[0-9a-f]{3});?/gi, (match, bgColor, textColor) => {
        // Verificar se o fundo é escuro
        const isBackgroundDark = isDarkColor(bgColor);
        // Definir a cor do texto com base no fundo
        const newTextColor = isBackgroundDark ? '#ffffff' : '#333333';
        return `background-color:#${bgColor};color:${newTextColor};`;
      })
      // Garantir que fundos escuros sempre tenham texto claro
      .replace(/background-color:\s*#([0-9a-f]{6}|[0-9a-f]{3});/gi, (match, bgColor) => {
        // Verificar se o fundo é escuro
        const isBackgroundDark = isDarkColor(bgColor);
        // Se for escuro, adicionar cor de texto clara
        return isBackgroundDark ? `background-color:#${bgColor};color:#ffffff;` : match;
      });
    
    // Função auxiliar para determinar se uma cor é escura
    function isDarkColor(color) {
      // Expandir cores de 3 dígitos para 6 dígitos
      if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
      }
      
      // Converter para RGB
      const r = parseInt(color.substr(0, 2), 16);
      const g = parseInt(color.substr(2, 2), 16);
      const b = parseInt(color.substr(4, 2), 16);
      
      // Calcular luminosidade (fórmula YIQ)
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      
      // Retorna true se a cor for escura (YIQ < 128)
      return yiq < 128;
    }
    
    const wrappedHtmlContent = `
      <div style="padding: 0; width: 100%; max-width: 560px; margin: 0 auto; overflow: hidden;">
        ${processedHtmlContent}
      </div>
    `;
    
    components.push({
      type: 'html',
      content: wrappedHtmlContent,
      style: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#333',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }
    });
    
    // Verificar se a cor primária é escura para garantir bom contraste
    const primaryColor = marketingConfig.primaryColor || '#012928';
    const primaryColorIsDark = primaryColor.startsWith('#') && isDarkColor(primaryColor.substring(1));
    
    // 3. Adicionar bloco de detalhes do imóvel
    if (postData.propertyInfo && Object.keys(postData.propertyInfo).length > 0) {
      // Criar o template HTML para os detalhes do imóvel
      const propertyDetailsHtml = `
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          <h2 style="color: ${primaryColor}; font-size: 20px; margin: 0 0 20px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Detalhes do Imóvel</h2>
          
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between;">
            ${postData.propertyInfo.price ? `
              <div style="flex: 0 0 48%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">$</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Preço</div>
                    <div style="font-size: 16px;">${formatPrice(postData.propertyInfo.price)}</div>
                  </div>
                </div>
              </div>` : ''}
            
            ${postData.propertyInfo.type ? `
              <div style="flex: 0 0 48%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">🏠</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Tipo</div>
                    <div style="font-size: 16px;">${postData.propertyInfo.type}</div>
                  </div>
                </div>
              </div>` : ''}
            
            ${postData.propertyInfo.area ? `
              <div style="flex: 0 0 48%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">📏</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Área</div>
                    <div style="font-size: 16px;">${postData.propertyInfo.area} m²</div>
                  </div>
                </div>
              </div>` : ''}
            
            ${postData.propertyInfo.rooms ? `
              <div style="flex: 0 0 48%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">🛏️</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Quartos</div>
                    <div style="font-size: 16px;">${postData.propertyInfo.rooms}</div>
                  </div>
                </div>
              </div>` : ''}
            
            ${postData.propertyInfo.bathrooms ? `
              <div style="flex: 0 0 48%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">🚿</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Banheiros</div>
                    <div style="font-size: 16px;">${postData.propertyInfo.bathrooms}</div>
                  </div>
                </div>
              </div>` : ''}
            
            ${postData.propertyInfo.garage ? `
              <div style="flex: 0 0 48%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">🚗</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Vagas</div>
                    <div style="font-size: 16px;">${postData.propertyInfo.garage}</div>
                  </div>
                </div>
              </div>` : ''}
            
            ${postData.propertyInfo.address ? `
              <div style="flex: 0 0 100%; margin-bottom: 15px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 30px; height: 30px; background-color: ${primaryColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                    <span style="color: ${primaryColorIsDark ? '#ffffff' : '#333333'}; font-size: 14px;">📍</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; font-size: 14px; color: #555;">Endereço</div>
                    <div style="font-size: 16px;">${postData.propertyInfo.address}</div>
                  </div>
                </div>
              </div>` : ''}
          </div>
        </div>
      `;
      
      // Adicionar o HTML dos detalhes como um componente HTML
      components.push({
        type: 'html',
        content: propertyDetailsHtml,
        style: {
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#333',
          width: '100%',
          maxWidth: '560px',
          margin: '0 auto'
        }
      });
    }
    
    // 4. Adicionar componentes de imagem para cada foto do imóvel
    if (postData.images && postData.images.length > 0) {
      // Adicionar um título para a seção de imagens
      components.push({
        type: 'title',
        content: 'Imagens do Imóvel',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: primaryColorIsDark ? '#ffffff' : primaryColor,
          backgroundColor: primaryColorIsDark ? primaryColor : 'transparent',
          textAlign: 'center',
          margin: '20px 0 10px',
          padding: primaryColorIsDark ? '10px' : '0',
          borderRadius: primaryColorIsDark ? '8px' : '0',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }
      });
      
      // Adicionar cada imagem como um componente de imagem separado
      postData.images.forEach((imageUrl) => {
        components.push({
          type: 'image',
          content: imageUrl,
          style: {
            width: '100%',
            maxWidth: '560px', // Um pouco menor que o container para dar margem
            margin: '0 auto 15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }
        });
      });
    }
    
    // 4. Adicionar um espaçador antes do rodapé
    components.push({
      type: 'spacer',
      size: 20,
      style: {
        height: '20px'
      }
    });
    
    // 5. Adicionar o rodapé como componente de texto com o mesmo estilo do "config marketing"
    const footerContent = `
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px;">
          <!-- Logo -->
          <div style="flex-shrink: 0; width: 100px;">
            ${marketingConfig.logoUrl ? `<img src="${marketingConfig.logoUrl}" alt="Logo" style="max-height: 50px; max-width: 100px; object-fit: contain;">` : `<div style="font-weight: bold; color: #333;">The Hub Realtors</div>`}
          </div>
          
          <!-- Informações de contato com foto do perfil -->
          <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
            <div style="flex-shrink: 0;">
              <img 
                src="${(userData as any).photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((userData as any).displayName || 'User')}&background=${encodeURIComponent(primaryColorIsDark ? primaryColor : '#f0f0f0')}&color=${encodeURIComponent(primaryColorIsDark ? 'fff' : '333')}" 
                alt="${(userData as any).displayName || 'Corretor'}" 
                style="height: 48px; width: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #e0e0e0;"
              >
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 500; color: #333;">
                ${(userData as any).displayName || 'Nome do Usuário'}
              </div>
              <div style="font-size: 12px; color: #666;">
                ${(userData as any).email || ''}
              </div>
              <div style="font-size: 12px; color: #666;">
                ${(userData as any).phoneNumber || ''}
              </div>
            </div>
          </div>
          
          <!-- Ícones de redes sociais -->
          <div style="display: flex; gap: 8px;">
            ${(userData as any).facebook ? `<a href="${(userData as any).facebook}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;" title="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#666"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>` : ''}
            ${(userData as any).instagram ? `<a href="${(userData as any).instagram}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;" title="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#666"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>` : ''}
            ${(userData as any).linkedin ? `<a href="${(userData as any).linkedin}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;" title="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#666"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : ''}
            ${(userData as any).website ? `<a href="${(userData as any).website.startsWith('http') ? (userData as any).website : 'https://' + (userData as any).website}" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;" title="Website"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="#666"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"/></svg></a>` : ''}
          </div>
        </div>
        
        <div style="margin-top: 16px; font-size: 12px; color: #999; text-align: center;">
          &copy; ${new Date().getFullYear()} The Hub Realtors. Todos os direitos reservados.
        </div>
      </div>
    `;
    
    components.push({
      type: 'html',
      content: footerContent,
      style: {
        fontSize: '12px',
        color: '#666',
        maxWidth: '600px',
        margin: '0 auto'
      }
    });
    
    // Criar um novo template com os componentes
    const template = {
      name: `Email Marketing IA - ${postData.title || 'Imóvel Exclusivo'}`,
      description: 'Template gerado automaticamente com IA a partir de um post do InstaHub',
      components: components
    };
    
    // Salvar o template
    await emailTemplateService.createTemplate(template);
    
    // Fechar a sidebar
    closeSidebar();
    
    // Redirecionar para a página de templates
    router.push('/admin/email-templates');
    
  } catch (error: any) {
    console.error('Erro ao gerar template com IA:', error);
    alert(`Erro ao gerar template com IA: ${error.message || 'Tente novamente mais tarde'}`);
  } finally {
    isGenerating.value = false;
  }
}
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}
.sidebar-panel {
  background: #fff;
  width: 720px;
  max-width: 100vw;
  height: 100vh;
  box-shadow: -2px 0 18px 0 rgba(0,0,0,0.15);
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  display: flex;
  flex-direction: column;
}
.sidebar-panel.open {
  transform: translateX(0);
}
.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: transparent;
  border: none;
  font-size: 1.7rem;
  color: #451A37;
  cursor: pointer;
  z-index: 10;
  background-color: #fff;
  padding: 8px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.sidebar-content {
  padding: 40px 32px 32px 32px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sidebar-gallery {
  width: 100%;
  margin-bottom: 18px;
}
.sidebar-main-image {
  width: 100%;
  height: 320px;
  object-fit: contain;
  border-radius: 12px;
  background: #f5f5f5;
  margin-bottom: 10px;
}
.sidebar-thumbnails {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
}
.sidebar-thumbnails img {
  width: 64px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}
.sidebar-thumbnails img.active {
  border-color: #451A37;
}
.sidebar-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sidebar-action-btn i {
  font-size: 1.1rem;
}

/* Estilos para o modal de carregamento */
.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background-color: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.loading-symbol {
  width: 160px;
  height: 160px;
  margin: 0 auto 30px;
  display: block;
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-content h2 {
  font-size: 24px;
  color: #451A37;
  margin-bottom: 10px;
}

.loading-content p {
  color: #666;
  margin-bottom: 30px;
}

.loading-progress {
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.loading-progress-fill {
  height: 100%;
  background-color: #01FBA1;
  width: 0%;
  border-radius: 3px;
  animation: progress 3s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  80% { width: 85%; }
  100% { width: 95%; }
}
.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #451A37;
  margin: 0;
}
.sidebar-description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
  margin: 0;
  white-space: pre-line;
}
.sidebar-property-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
}
.sidebar-property-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.sidebar-property-item i {
  color: #451A37;
  width: 20px;
  text-align: center;
}
.sidebar-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 8px;
}
.sidebar-author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.sidebar-author-name {
  font-weight: 600;
  color: #451A37;
}
.sidebar-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.sidebar-action-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(69,26,55,0.08);
  transition: background 0.2s;
}
.sidebar-action-btn.ai {
  background: #F59975;
  color: #451A37;
}
.sidebar-action-btn:hover {
  background: #733F63;
  color: #fff;
}
</style>
