import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/tailwind.css'
import { i18n } from './i18n'
import reveal from './directives/reveal'

document.documentElement.style.scrollBehavior = 'smooth'

const app = createApp(App)
app.use(i18n)
app.directive('reveal', reveal)
app.mount('#app')
