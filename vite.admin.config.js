import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

/**
 * Admin area build (/admin) — deliberately separate from the public build
 * (vite.config.js) so admin code, its Vue router/Supabase dependencies and its
 * Tailwind classes never end up in what public visitors download.
 *
 *   npm run dev:admin   → http://localhost:5174/admin/
 *   npm run build       → public build, then this one into the same dist/
 */

// Clean URLs (/admin/posts, /admin/team…) → admin/index.html, mirroring the
// Netlify rewrite, so deep links and refreshes work in dev and preview.
const adminSpaFallback = () => {
  const rewrite = (req, _res, next) => {
    const path = (req.url || '').split('?')[0]
    if (/^\/admin(\/|$)/.test(path) && !path.includes('.')) req.url = '/admin/index.html'
    next()
  }
  return {
    name: 'admin-spa-fallback',
    configureServer: (server) => { server.middlewares.use(rewrite) },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite) },
  }
}

export default defineConfig({
  plugins: [vue(), adminSpaFallback()],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: './tailwind.admin.config.js' }), autoprefixer()],
    },
  },
  publicDir: false, // public/ is already copied by the main build
  server: { port: 5174, open: '/admin/' },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // runs after the public build — keep its output
    rollupOptions: {
      input: { admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)) },
    },
  },
})
