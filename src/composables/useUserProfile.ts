import { ref, Ref } from 'vue';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { useInstaHubStore } from '../stores/instaHubStore';

export function useUserProfile(userId: string) {
  const authStore = useAuthStore();
  const instaHubStore = useInstaHubStore();
  
  const userProfile: Ref<any> = ref({});
  const isLoadingProfile = ref(true);
  const error = ref('');
  
  const isLoadingUserPosts = ref(false);
  const userPosts: Ref<any[]> = ref([]);
  
  const isLoadingInteresse = ref(false);
  const interessePosts: Ref<any[]> = ref([]);
  
  const isEditing = ref(false);
  const editedProfile: Ref<any> = ref({});
  
  // Buscar dados do perfil do usuário
  async function fetchUserProfile() {
    isLoadingProfile.value = true;
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        userProfile.value = { id: userDoc.id, ...userDoc.data() } as any;
        
        // Se o usuário autenticado está visualizando seu próprio perfil
        // e a foto no auth é diferente da foto no perfil do InstaHub
        if (authStore.user && 
            (authStore.user.id === userId || authStore.user.uid === userId) && 
            authStore.user.photoURL && 
            authStore.user.photoURL !== userProfile.value.avatar) {
          
          // Atualizar o avatar do perfil do InstaHub com a foto do perfil principal
          await updateDoc(userDocRef, {
            avatar: authStore.user.photoURL
          });
          
          // Atualizar o estado local
          userProfile.value.avatar = authStore.user.photoURL;
        }
      } else {
        console.error('Usuário não encontrado');
        error.value = 'Usuário não encontrado';
      }
    } catch (err: any) {
      console.error('Erro ao buscar perfil:', err);
      error.value = `Erro ao buscar perfil: ${err.message}`;
    } finally {
      isLoadingProfile.value = false;
    }
  }

  // Buscar posts criados pelo usuário do perfil
  async function fetchUserPosts() {
    isLoadingUserPosts.value = true;
    try {
      const db = getFirestore();
      console.log(`Buscando posts para o usuário ${userId}`);
      
      // Primeiro, verificar o tipo de usuário
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log(`Usuário ${userId} não encontrado`);
        userPosts.value = [];
        return;
      }
      
      const userData = userDocSnap.data();
      const userType = userData.userType || 'normal';
      console.log(`Tipo de usuário: ${userType}`);
      
      const postsRef = collection(db, 'instahub_posts');
      
      // Verificar se é um broker
      if (userType === 'broker') {
        console.log('Buscando posts para broker pelo createdBy');
        
        // Buscar por createdBy para brokers
        const createdByQuery = query(postsRef, where('createdBy', '==', userId));
        const createdBySnapshot = await getDocs(createdByQuery);
        
        if (!createdBySnapshot.empty) {
          console.log(`Encontrados ${createdBySnapshot.size} posts pelo createdBy`);
          userPosts.value = createdBySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
          console.log('Nenhum post encontrado pelo createdBy, tentando por author.id');
          // Se não encontrar, tentar por author.id
          const authorQuery = query(postsRef, where('author.id', '==', userId));
          const authorSnapshot = await getDocs(authorQuery);
          
          if (!authorSnapshot.empty) {
            console.log(`Encontrados ${authorSnapshot.size} posts pelo author.id`);
            userPosts.value = authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } else {
            // Última tentativa: buscar pela lista de userPosts no documento do usuário
            const userPostsIds = userData.userPosts || [];
            console.log(`Tentando buscar por IDs de posts: ${userPostsIds.length} IDs encontrados`);
            
            if (userPostsIds.length > 0) {
              // Dividir em chunks de 10 para evitar limitações do Firestore
              const chunks: string[][] = [];
              for (let i = 0; i < userPostsIds.length; i += 10) {
                chunks.push(userPostsIds.slice(i, i + 10));
              }
              
              let allPosts: Array<any> = [];
              for (const chunk of chunks) {
                const chunkQuery = query(postsRef, where('__name__', 'in', chunk));
                const chunkSnapshot = await getDocs(chunkQuery);
                const chunkPosts = chunkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                allPosts = [...allPosts, ...chunkPosts];
              }
              
              console.log(`Encontrados ${allPosts.length} posts pelos IDs`);
              userPosts.value = allPosts;
            } else {
              console.log('Nenhum post encontrado para este usuário');
              userPosts.value = [];
            }
          }
        }
      } else {
        // Para usuários normais, buscar pela lista de userPosts
        const userPostsIds = userData.userPosts || [];
        console.log(`Usuário normal: ${userPostsIds.length} IDs de posts encontrados`);
        
        if (userPostsIds.length > 0) {
          // Dividir em chunks de 10 para evitar limitações do Firestore
          const chunks: string[][] = [];
          for (let i = 0; i < userPostsIds.length; i += 10) {
            chunks.push(userPostsIds.slice(i, i + 10));
          }
          
          let allPosts: Array<any> = [];
          for (const chunk of chunks) {
            const chunkQuery = query(postsRef, where('__name__', 'in', chunk));
            const chunkSnapshot = await getDocs(chunkQuery);
            const chunkPosts = chunkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allPosts = [...allPosts, ...chunkPosts];
          }
          
          console.log(`Encontrados ${allPosts.length} posts pelos IDs`);
          userPosts.value = allPosts;
        } else {
          console.log('Nenhum ID de post encontrado, tentando por author.id');
          // Se não encontrar, tentar por author.id
          const authorQuery = query(postsRef, where('author.id', '==', userId));
          const authorSnapshot = await getDocs(authorQuery);
          
          if (!authorSnapshot.empty) {
            console.log(`Encontrados ${authorSnapshot.size} posts pelo author.id`);
            userPosts.value = authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          } else {
            console.log('Nenhum post encontrado para este usuário');
            userPosts.value = [];
          }
        }
      }
      
      console.log(`Total de ${userPosts.value.length} posts encontrados para o usuário ${userId}`);
    } catch (err) {
      console.error('Erro ao buscar posts do usuário:', err);
      userPosts.value = [];
    } finally {
      isLoadingUserPosts.value = false;
    }
  }

  // Buscar posts marcados como "Tenho Interesse" pelo usuário autenticado
  async function fetchInteressePosts() {
    isLoadingInteresse.value = true;
    try {
      const db = getFirestore();
      // Usar o ID do usuário autenticado, não o ID do perfil que está sendo visualizado
      const currentUserId = authStore.user?.uid || authStore.user?.id;
      
      console.log('Buscando posts de interesse para o usuário:', currentUserId);
      
      if (!currentUserId) {
        console.log('Usuário não autenticado, não é possível buscar posts de interesse');
        interessePosts.value = [];
        return;
      }
      
      // Buscar posts que o usuário marcou como interesse
      const postsRef = collection(db, 'instahub_posts');
      const postsQuery = query(postsRef, where('interesseBy', 'array-contains', currentUserId));
      const querySnapshot = await getDocs(postsQuery);
      
      console.log(`Encontrados ${querySnapshot.size} posts de interesse`);
      
      if (!querySnapshot.empty) {
        interessePosts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        // Método alternativo: buscar pelo array interesseBy no documento do usuário
        console.log('Tentando método alternativo: buscar pelo documento do usuário');
        
        const userDocRef = doc(db, 'users', currentUserId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const interessePostsIds = userData.interessePosts || [];
          
          console.log(`Encontrados ${interessePostsIds.length} IDs de posts de interesse no documento do usuário`);
          
          if (interessePostsIds.length > 0) {
            // Firestore tem limite de 10 itens para consultas 'in', então dividimos em lotes se necessário
            const batchSize = 10;
            let allPosts = [];
            
            for (let i = 0; i < interessePostsIds.length; i += batchSize) {
              const batch = interessePostsIds.slice(i, i + batchSize);
              if (batch.length > 0) {
                const batchQuery = query(postsRef, where('__name__', 'in', batch));
                const batchSnapshot = await getDocs(batchQuery);
                const batchPosts = batchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                allPosts = [...allPosts, ...batchPosts];
              }
            }
            
            interessePosts.value = allPosts;
            console.log(`Total de ${interessePosts.value.length} posts de interesse carregados`);
          } else {
            interessePosts.value = [];
          }
        } else {
          console.log('Documento do usuário não encontrado');
          interessePosts.value = [];
        }
      }
    } catch (err) {
      console.error('Erro ao buscar posts de interesse:', err);
      interessePosts.value = [];
    } finally {
      isLoadingInteresse.value = false;
    }
  }

  // Iniciar edição do perfil
  function startEditing() {
    editedProfile.value = { ...userProfile.value };
    isEditing.value = true;
  }

  // Cancelar edição do perfil
  function cancelEditing() {
    isEditing.value = false;
  }

  // Salvar alterações no perfil
  async function saveProfile() {
    isLoadingProfile.value = true;
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userId);
      
      // Se o usuário atual é o dono do perfil e a foto foi alterada
      if (authStore.user && (authStore.user.id === userId || authStore.user.uid === userId)) {
        // Verificar se o avatar foi alterado
        if (editedProfile.value.avatar !== userProfile.value.avatar) {
          // Atualizar a foto no authStore para sincronizar com o perfil principal
          await authStore.updateUserPhoto(editedProfile.value.avatar);
        }
      }
      
      await updateDoc(userDocRef, editedProfile.value);
      userProfile.value = { ...editedProfile.value };
      isEditing.value = false;
      // Mostrar mensagem de sucesso
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      alert(`Erro ao atualizar perfil: ${err.message}`);
    } finally {
      isLoadingProfile.value = false;
    }
  }

  // Desmarcar interesse em um post
  async function desmarcarInteresse(postId: string) {
    try {
      await instaHubStore.toggleInteresse(postId);
      await fetchInteressePosts();
    } catch (err) {
      console.error('Erro ao desmarcar interesse:', err);
    }
  }

  return {
    userProfile,
    isLoadingProfile,
    error,
    isLoadingUserPosts,
    userPosts,
    isLoadingInteresse,
    interessePosts,
    isEditing,
    editedProfile,
    fetchUserProfile,
    fetchUserPosts,
    fetchInteressePosts,
    startEditing,
    cancelEditing,
    saveProfile,
    desmarcarInteresse
  };
}
