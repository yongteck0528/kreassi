import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { i18n } from './i18n'
import reveal from './directives/reveal'

const app = createApp(App)
app.use(i18n)
app.directive('reveal', reveal)
app.mount('#app')
// Analytics load after the page is up, as their own small chunk: if a blocker
// stops them, the site itself is unaffected.
import('./analytics/pulse').then(({ initAnalytics }) => initAnalytics()).catch(() => {})
