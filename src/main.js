import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/tailwind.css'
import { Icon } from '@iconify/vue'

document.documentElement.style.scrollBehavior = 'smooth'

const app = createApp(App)
app.component('Icon', Icon)
app.mount('#app')
