import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import router from './router'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primeicons/primeicons.css'
import App from './App.vue'
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

console.log('Starting application...')

// Initialize Firebase Auth
let app: ReturnType<typeof createApp>

// Wait for Firebase Auth to initialize before mounting the app
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'No user')
  
  if (!app) {
    console.log('Creating Vue app...')
    app = createApp(App)
    
    app.use(createPinia())
    app.use(router)
    app.use(PrimeVue)
    app.use(ToastService)

    // Register PrimeVue components
    app.component('Accordion', Accordion)
    app.component('AccordionTab', AccordionTab)

    // Registrar diretiva do Tooltip
    app.directive('tooltip', Tooltip)
    
    console.log('Mounting app...')
    app.mount('#app')
    console.log('App mounted!')
  }
})