import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

console.log('[Firebase Config] Iniciando configuração do Firebase...')
console.log('[Firebase Config] Configuração:', {
  apiKey: firebaseConfig.apiKey ? 'Presente' : 'Ausente',
  authDomain: firebaseConfig.authDomain ? 'Presente' : 'Ausente',
  projectId: firebaseConfig.projectId ? 'Presente' : 'Ausente',
  storageBucket: firebaseConfig.storageBucket ? 'Presente' : 'Ausente',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Presente' : 'Ausente',
  appId: firebaseConfig.appId ? 'Presente' : 'Ausente'
})

let app;
let db;
let auth;

try {
  console.log('[Firebase Config] Inicializando app...')
  app = initializeApp(firebaseConfig)
  console.log('[Firebase Config] App inicializado:', app.name)

  console.log('[Firebase Config] Inicializando Firestore...')
  db = getFirestore(app)
  console.log('[Firebase Config] Firestore inicializado')

  console.log('[Firebase Config] Inicializando Auth...')
  auth = getAuth(app)
  console.log('[Firebase Config] Auth inicializado')

  // Initialize auth persistence
  console.log('[Firebase Config] Configurando persistência...')
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('[Firebase Config] Persistência configurada com sucesso')
    })
    .catch((error) => {
      console.error('[Firebase Config] Erro ao configurar persistência:', error)
    })
} catch (error) {
  console.error('[Firebase Config] Erro ao inicializar Firebase:', {
    error,
    message: error instanceof Error ? error.message : 'Erro desconhecido',
    stack: error instanceof Error ? error.stack : undefined,
    config: {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId
    }
  })
  throw error
}

export { db, auth }