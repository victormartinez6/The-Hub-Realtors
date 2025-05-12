import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'
import './assets/css/video-controls.css';
import App from './App.vue'
import router from './router'
import './firebase' // Importa e inicializa o Firebase
import vuetify from './plugins/vuetify'
import { i18n } from './i18n' // Importa o i18n

const app = createApp(App)
const pinia = createPinia()

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Inicializar Google Maps API
const loadGoogleMapsApi = () => {
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
  document.head.appendChild(script);
};

loadGoogleMapsApi();

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)
app.use(vuetify)
app.use(i18n) // Usa o i18n
app.mount('#app')