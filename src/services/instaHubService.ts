import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db } from '../firebase';
import { getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Inicializa o Storage
const storage = getStorage();

// Interfaces
export interface MediaFile {
  url: string;
  type: string;
  path?: string; // Caminho no storage para possível exclusão
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface Post {
  id?: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  caption: string;
  mediaFiles: MediaFile[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: number;
  category: string;
  newComment?: string;
  currentMediaIndex?: number;
  propertyInfo?: {
    address: string;
    type: string;
    status: string;
    timeOnMarket: string;
    price: string | number;
    commission: number;
    commissionPercentage?: number;
    features: {
      bedrooms: number;
      bathrooms: number;
      garageSpaces: number;
      squareFootage: string;
      hasPool: boolean;
      hasGarden: boolean;
      hasAirConditioning: boolean;
      hasSecurity: boolean;
    };
    hoaFees: number;
    observations: string;
    mlsId?: string;
  };
  interesseBy?: string[];
}

// Função auxiliar para converter documento do Firestore para objeto Post
const convertDocToPost = (doc: QueryDocumentSnapshot<DocumentData>): Post => {
  const data = doc.data();
  return {
    id: doc.id,
    author: data.author,
    caption: data.caption,
    mediaFiles: data.mediaFiles || [],
    likes: data.likes || 0,
    likedBy: data.likedBy || [],
    comments: data.comments || [],
    createdAt: data.createdAt?.toDate().getTime() || new Date().getTime(),
    category: data.category || 'Geral',
    newComment: data.newComment,
    currentMediaIndex: data.currentMediaIndex,
    propertyInfo: data.propertyInfo,
    interesseBy: data.interesseBy
  };
};

// Classe de serviço para o InstaHub
class InstaHubService {
  // Referência à coleção de posts no Firestore
  private postsCollection = collection(db, 'instahub_posts');
  
  // Upload de mídia para o Firebase Storage
  async uploadMedia(file: File): Promise<MediaFile> {
    try {
      // Gerar um nome único para o arquivo
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const path = `instahub/${fileName}`;
      
      console.log('Iniciando upload de arquivo:', fileName);
      console.log('Tipo de arquivo:', file.type);
      
      // Referência ao arquivo no Storage
      const fileRef = storageRef(storage, path);
      
      // Upload do arquivo
      await uploadBytes(fileRef, file);
      console.log('Upload concluído para:', path);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(fileRef);
      console.log('URL de download obtida:', downloadURL);
      
      // Determinar o tipo de mídia com mais precisão
      let mediaType = 'image'; // Padrão é imagem
      
      // Verificar se é um vídeo pelo tipo MIME
      if (file.type.includes('video')) {
        mediaType = 'video';
      } 
      // Verificar pela extensão do arquivo
      else if (fileExtension) {
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
        if (videoExtensions.includes(fileExtension.toLowerCase())) {
          mediaType = 'video';
        }
      }
      
      console.log('Tipo de mídia detectado:', mediaType);
      
      return {
        url: downloadURL,
        type: mediaType,
        path
      };
    } catch (error) {
      console.error('Erro ao fazer upload de mídia:', error);
      throw new Error(`Falha ao fazer upload da mídia: ${error instanceof Error ? error.message : 'Tente novamente.'}`);
    }
  }
  
  // Criar um novo post
  async createPost(postData: Omit<Post, 'id' | 'likes' | 'likedBy' | 'createdAt' | 'interesseBy'>): Promise<string> {
    try {
      // Simulação de autenticação para ambiente de desenvolvimento
      // Em um ambiente real, isso seria verificado pelo Firebase Auth
      // Garantindo que o autor tenha um ID único se não for fornecido
      if (!postData.author?.id) {
        postData.author = {
          ...postData.author,
          id: 'user-' + Date.now(),
        };
      }
      
      const newPost = {
        ...postData,
        likes: 0,
        likedBy: [],
        interesseBy: [],
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(this.postsCollection, newPost);

      // Atualizar o usuário para adicionar o ID do post criado
      const userRef = doc(db, 'users', postData.author.id);
      await updateDoc(userRef, {
        userPosts: arrayUnion(docRef.id)
      });

      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw new Error('Falha ao criar o post. Tente novamente.');
    }
  }
  
  // Obter todos os posts
  async getAllPosts(): Promise<Post[]> {
    try {
      const q = query(this.postsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertDocToPost);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      throw new Error('Falha ao carregar os posts. Tente novamente.');
    }
  }
  
  // Obter posts por categoria
  async getPostsByCategory(category: string): Promise<Post[]> {
    try {
      const q = query(
        this.postsCollection, 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertDocToPost);
    } catch (error) {
      console.error('Erro ao buscar posts por categoria:', error);
      throw new Error('Falha ao carregar os posts. Tente novamente.');
    }
  }
  
  // Buscar posts de um usuário específico
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      // Tentativa 1: Usar a consulta com índice composto (author.id + createdAt)
      try {
        const q = query(
          this.postsCollection, 
          where('author.id', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(convertDocToPost);
      } catch (indexError) {
        console.warn('Erro de índice, usando método alternativo:', indexError);
        
        // Tentativa 2: Buscar todos os posts do usuário sem ordenação
        const q2 = query(
          this.postsCollection, 
          where('author.id', '==', userId)
        );
        const querySnapshot = await getDocs(q2);
        
        // Ordenar manualmente os resultados
        const posts = querySnapshot.docs.map(convertDocToPost);
        return posts.sort((a, b) => {
          const dateA = a.createdAt;
          const dateB = b.createdAt;
          return dateB - dateA; // Ordenação decrescente
        });
      }
    } catch (error) {
      console.error('Erro ao buscar posts do usuário:', error);
      throw new Error('Falha ao carregar os posts. Tente novamente.');
    }
  }
  
  // Curtir/descurtir um post
  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'instahub_posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post não encontrado');
      }
      
      const postData = postSnap.data();
      const likedBy = postData.likedBy || [];
      const isLiked = likedBy.includes(userId);
      
      if (isLiked) {
        // Remover curtida
        await updateDoc(postRef, {
          likes: postData.likes - 1,
          likedBy: likedBy.filter((id: string) => id !== userId)
        });
      } else {
        // Adicionar curtida
        await updateDoc(postRef, {
          likes: postData.likes + 1,
          likedBy: [...likedBy, userId]
        });
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir post:', error);
      throw new Error('Falha ao processar a curtida. Tente novamente.');
    }
  }
  
  // Toggle "Tenho Interesse" em um post
  async toggleInteresse(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'instahub_posts', postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        throw new Error('Post não encontrado');
      }
      const postData = postSnap.data();
      const interesseBy = postData.interesseBy || [];
      const isInterested = interesseBy.includes(userId);
      const userRef = doc(db, 'users', userId);
      if (isInterested) {
        // Remover interesse
        await Promise.all([
          updateDoc(postRef, {
            interesseBy: interesseBy.filter((id: string) => id !== userId)
          }),
          updateDoc(userRef, {
            interessePosts: arrayRemove(postId)
          })
        ]);
      } else {
        // Adicionar interesse
        await Promise.all([
          updateDoc(postRef, {
            interesseBy: [...interesseBy, userId]
          }),
          updateDoc(userRef, {
            interessePosts: arrayUnion(postId)
          })
        ]);
      }
    } catch (error) {
      console.error('Erro ao marcar/desmarcar interesse:', error);
      throw new Error('Falha ao processar interesse. Tente novamente.');
    }
  }
  
  // Adicionar comentário a um post
  async addComment(postId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<void> {
    try {
      const postRef = doc(db, 'instahub_posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post não encontrado');
      }
      
      const postData = postSnap.data();
      const comments = postData.comments || [];
      
      const newComment = {
        ...comment,
        id: uuidv4(),
        createdAt: new Date().getTime()
      };
      
      await updateDoc(postRef, {
        comments: [...comments, newComment]
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw new Error('Falha ao adicionar o comentário. Tente novamente.');
    }
  }
  
  // Atualiza as informações do imóvel de um post
  async updatePostPropertyInfo(postId: string, propertyInfo: { price: number, mlsId?: string, commissionPercentage: number }): Promise<void> {
    try {
      const postRef = doc(db, 'instahub_posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post não encontrado');
      }
      
      // Calcular a comissão com base no preço e na porcentagem
      const commission = propertyInfo.price * (propertyInfo.commissionPercentage / 100);
      
      // Atualizar apenas as informações do imóvel que foram modificadas
      const updateData: Record<string, any> = {
        'propertyInfo.price': propertyInfo.price,
        'propertyInfo.commissionPercentage': propertyInfo.commissionPercentage,
        'propertyInfo.commission': commission
      };
      
      // Adicionar mlsId se estiver presente
      if (propertyInfo.mlsId !== undefined) {
        updateData['propertyInfo.mlsId'] = propertyInfo.mlsId;
      }
      
      await updateDoc(postRef, updateData);
      
    } catch (error) {
      console.error('Erro ao atualizar informações do imóvel:', error);
      throw new Error('Falha ao atualizar informações do imóvel. Tente novamente.');
    }
  }
  
  // Buscar posts recentes a partir de uma data específica
  async getRecentPosts(fromDate: Date): Promise<Post[]> {
    try {
      const postsRef = collection(db, 'instahub_posts');
      const fromTimestamp = Timestamp.fromDate(fromDate);
      
      // Consulta para buscar posts criados após a data especificada
      const q = query(
        postsRef,
        where('createdAt', '>=', fromTimestamp),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        posts.push({
          id: doc.id,
          ...postData
        } as Post);
      });
      
      return posts;
    } catch (error) {
      console.error('Erro ao buscar posts recentes:', error);
      throw new Error('Falha ao buscar posts recentes. Tente novamente.');
    }
  }
  
  // Deletar um post
  async deletePost(postId: string): Promise<void> {
    try {
      // Referência para o documento do post
      const postRef = doc(this.postsCollection, postId);
      
      // Obter o post para verificar se há mídias para excluir
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) {
        throw new Error('Post não encontrado');
      }
      
      const postData = postSnap.data() as Post;
      
      // Excluir as mídias do storage, se existirem
      if (postData.mediaFiles && postData.mediaFiles.length > 0) {
        for (const media of postData.mediaFiles) {
          try {
            // Se o media for um objeto com url, extrair o caminho do storage
            if (typeof media === 'object' && media.url) {
              // Extrair o caminho do storage da URL
              const mediaUrl = media.url;
              if (mediaUrl.includes('firebase') && mediaUrl.includes('storage')) {
                // Criar uma referência para o arquivo no storage
                const storageRef = ref(this.storage, this.extractPathFromUrl(mediaUrl));
                await deleteObject(storageRef);
                console.log('Mídia excluída com sucesso:', mediaUrl);
              }
            }
          } catch (mediaError) {
            console.error('Erro ao excluir mídia:', mediaError);
            // Continuar excluindo as outras mídias mesmo se uma falhar
          }
        }
      }
      
      // Excluir o documento do post
      await deleteDoc(postRef);
      console.log('Post excluído com sucesso:', postId);
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      throw new Error('Falha ao excluir o post. Tente novamente.');
    }
  }
  
  // Método auxiliar para extrair o caminho do storage a partir da URL
  private extractPathFromUrl(url: string): string {
    try {
      // Exemplo de URL: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?token=...
      const pathRegex = /firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/([^?]+)/;
      const match = url.match(pathRegex);
      
      if (match && match[1]) {
        // Decodificar o caminho (pois na URL ele está codificado)
        return decodeURIComponent(match[1]);
      }
      
      throw new Error('Formato de URL inválido');
    } catch (error) {
      console.error('Erro ao extrair caminho da URL:', error);
      return '';
    }
  }
}

export default new InstaHubService();
