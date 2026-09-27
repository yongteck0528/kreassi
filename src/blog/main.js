import { createApp } from 'vue'
import Blog from './Blog.vue'
import '../style.css'
import { i18n } from '../i18n'
import reveal from '../directives/reveal'

// Separate Vite entry point (blog.html) so the homepage bundle stays untouched.
const app = createApp(Blog)
app.use(i18n)
app.directive('reveal', reveal)
app.mount('#blog-app')
