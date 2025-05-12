// Script para testar o envio de notificações de alta prioridade
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  // Sua configuração do Firebase será usada automaticamente
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para enviar uma notificação de teste de alta prioridade
async function sendHighPriorityTestNotification() {
  try {
    // Dados da notificação
    const notificationData = {
      title: 'ATENÇÃO: Notificação de Alta Prioridade',
      message: 'Esta é uma notificação de teste de alta prioridade que bloqueia o sistema até que seja lida. Por favor, confirme a leitura para continuar usando o sistema.',
      timestamp: Timestamp.fromDate(new Date()),
      read: false,
      type: 'error',
      highPriority: true,
      sender: {
        id: 'system',
        name: 'Sistema de Teste',
        role: 'system'
      },
      recipient: { 
        role: 'all' // Enviar para todos os usuários
      }
    };

    // Adicionar ao Firestore
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log('Notificação de alta prioridade enviada com sucesso, ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    throw error;
  }
}

// Executar a função
sendHighPriorityTestNotification()
  .then(id => console.log('ID da notificação:', id))
  .catch(error => console.error('Erro:', error));
