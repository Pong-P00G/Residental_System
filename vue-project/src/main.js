import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initPreferences } from './lib/preferences'
import { useAuthStore } from './stores/auth'

initPreferences()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore(pinia)

auth.initAuth().finally(() => {
  app.use(router)
  app.mount('#app')
})
