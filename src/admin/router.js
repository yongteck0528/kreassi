import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from './composables/useAuth'
import AdminLayout from './components/AdminLayout.vue'
import LoginView from './views/LoginView.vue'

// Routes marked `public` are reachable signed out. Everything else needs an
// admins row; `roles` narrows further. (The database enforces the same rules
// on every query — these guards are for UX, not security.)
const routes = [
    { path: '/login', name: 'login', component: LoginView, meta: { public: true, title: 'Sign in' } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('./views/ForgotPasswordView.vue'), meta: { public: true, title: 'Reset password' } },
    { path: '/set-password', name: 'set-password', component: () => import('./views/SetPasswordView.vue'), meta: { public: true, title: 'Set password' } },
    { path: '/no-access', name: 'no-access', component: () => import('./views/NoAccessView.vue'), meta: { public: true, title: 'No access' } },
    {
        path: '/',
        component: AdminLayout,
        children: [
            { path: '', name: 'home', component: { render: () => null } }, // resolved by role in the guard
            { path: 'dashboard', name: 'dashboard', component: () => import('./views/DashboardView.vue'), meta: { roles: ['owner'], title: 'Dashboard' } },
            { path: 'posts', name: 'posts', component: () => import('./views/PostsView.vue'), meta: { roles: ['owner', 'writer'], title: 'Blog posts' } },
            { path: 'team', name: 'team', component: () => import('./views/TeamView.vue'), meta: { roles: ['owner'], title: 'Team' } },
        ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
    history: createWebHistory('/admin/'),
    routes,
})

const homeFor = (role) => ({ name: role === 'owner' ? 'dashboard' : 'posts' })

router.beforeEach(async (to) => {
    const { state, init } = useAuth()
    await init()

    if (to.meta.public) {
        if (to.name === 'login' && state.session && state.role) return homeFor(state.role)
        return true
    }
    if (!state.session) {
        return { name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
    }
    if (!state.role) return { name: 'no-access' }
    if (to.name === 'home') return homeFor(state.role)
    if (to.meta.roles && !to.meta.roles.includes(state.role)) return homeFor(state.role)
    return true
})

router.afterEach((to) => {
    document.title = `${to.meta.title ?? 'Admin'} · Kreassi Admin`
})
