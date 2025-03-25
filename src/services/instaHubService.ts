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
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

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
  createdAt: Date;
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
  createdAt: Date;
  category: string;
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
    createdAt: data.createdAt?.toDate() || new Date(),
    category: data.category || 'Geral'
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
      
      // Referência ao arquivo no Storage
      const fileRef = storageRef(storage, path);
      
      // Upload do arquivo
      await uploadBytes(fileRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(fileRef);
      
      // Determinar o tipo de mídia
      const isVideo = file.type.includes('video');
      
      return {
        url: downloadURL,
        type: isVideo ? 'video' : 'image',
        path
      };
    } catch (error) {
      console.error('Erro ao fazer upload de mídia:', error);
      throw new Error('Falha ao fazer upload da mídia. Tente novamente.');
    }
  }
  
  // Criar um novo post
  async createPost(postData: Omit<Post, 'id' | 'likes' | 'likedBy' | 'createdAt'>): Promise<string> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      const newPost = {
        ...postData,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(this.postsCollection, newPost);
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
  
  // Obter posts de um usuário específico
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        this.postsCollection, 
        where('author.id', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertDocToPost);
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
        createdAt: new Date()
      };
      
      await updateDoc(postRef, {
        comments: [...comments, newComment]
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw new Error('Falha ao adicionar o comentário. Tente novamente.');
    }
  }
  
  // Excluir um post
  async deletePost(postId: string): Promise<void> {
    try {
      const postRef = doc(db, 'instahub_posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        throw new Error('Post não encontrado');
      }
      
      // Excluir arquivos de mídia do Storage
      const postData = postSnap.data();
      const mediaFiles = postData.mediaFiles || [];
      
      for (const media of mediaFiles) {
        if (media.path) {
          const fileRef = storageRef(storage, media.path);
          await deleteObject(fileRef);
        }
      }
      
      // Excluir o documento do post
      await deleteDoc(postRef);
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      throw new Error('Falha ao excluir o post. Tente novamente.');
    }
  }
}

export default new InstaHubService();
