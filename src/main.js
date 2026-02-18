import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/tailwind.css'

document.documentElement.style.scrollBehavior = 'smooth'

const app = createApp(App)
app.mount('#app')
