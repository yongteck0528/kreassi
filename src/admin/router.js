import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from './composables/useAuth'
import AdminLayout from './components/AdminLayout.vue'
import LoginView from './views/LoginView.vue'

// Routes marked `public` are reachable signed out. Everything else needs an
// admins row. (The database enforces the same rule on every query — these
// guards are for UX, not security.) One role: every admin sees everything.
const routes = [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true, title: 'Sign in' } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('./views/ForgotPasswordView.vue'), meta: { public: true, title: 'Reset password' } },
    { path: '/set-password', name: 'set-password', component: () => import('./views/SetPasswordView.vue'), meta: { public: true, title: 'Set password' } },
    { path: '/no-access', name: 'no-access', component: () => import('./views/NoAccessView.vue'), meta: { public: true, title: 'No access' } },
    // Full-screen preview of a post (outside the admin layout).
    { path: '/posts/:id/preview', name: 'post-preview', component: () => import('./views/PostPreviewView.vue'), props: true, meta: { title: 'Preview' } },
    {
        path: '/',
        component: AdminLayout,
        children: [
            { path: '', name: 'home', redirect: { name: 'dashboard' } },
            { path: 'dashboard', name: 'dashboard', component: () => import('./views/DashboardView.vue'), meta: { title: 'Dashboard' } },
            {
                path: 'posts',
                component: () => import('./views/BlogLayout.vue'),
                meta: { title: 'Blog', fullWidth: true },
                children: [
                    { path: '', name: 'posts', component: () => import('./views/BlogHomeView.vue') },
                    { path: ':id', name: 'post-edit', component: () => import('./views/PostEditorView.vue'), props: true, meta: { title: 'Edit post' } },
                ],
            },
            { path: 'categories', name: 'categories', component: () => import('./views/CategoriesView.vue'), meta: { title: 'Categories' } },
            { path: 'team', name: 'team', component: () => import('./views/TeamView.vue'), meta: { title: 'Team' } },
        ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
    history: createWebHistory('/admin/'),
    routes,
})

router.beforeEach(async (to) => {
    const { state, init } = useAuth()
    await init()

    if (to.meta.public) {
        if (to.name === 'login' && state.session && state.role) return { name: 'dashboard' }
        return true
    }
    if (!state.session) {
        return { name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
    }
    if (!state.role) return { name: 'no-access' }
    return true
})

router.afterEach((to) => {
    document.title = `${to.meta.title ?? 'Admin'} · Kreassi Admin`
})
