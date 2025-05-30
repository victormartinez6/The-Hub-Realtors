import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      // Garantir que vue-i18n seja incluído no build
      external: [''],
      output: {
        manualChunks: {
          'vue-i18n': ['vue-i18n'],
          'vue': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue-i18n']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
