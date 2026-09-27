import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// Multi-page build: the homepage (index.html) and the blog (blog.html) are
// separate entry points, so the homepage bundle is unaffected by blog changes.
// The admin area is a separate build entirely (vite.admin.config.js) so it
// can't change what public pages download.
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        blog: fileURLToPath(new URL('./blog.html', import.meta.url)),
      },
    },
  },
})
