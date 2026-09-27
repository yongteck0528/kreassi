import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './admin.css'

// Separate Vite entry (admin/index.html): nothing here ships to public pages.
createApp(App).use(router).mount('#admin-app')
