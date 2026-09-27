<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAuth } from '../composables/useAuth'
import logo from '../../assets/Logos/Kreassi/White - Kreassi Logo.png'

const { email, signOut } = useAuth()
const route = useRoute()
const router = useRouter()

const drawerOpen = ref(false)
watch(() => route.fullPath, () => { drawerOpen.value = false })

const nav = [
    { to: { name: 'dashboard' }, label: 'Dashboard', icon: 'mdi:chart-box-outline' },
    { to: { name: 'posts' }, label: 'Blog', icon: 'mdi:file-document-edit-outline' },
    { to: { name: 'categories' }, label: 'Categories', icon: 'mdi:shape-outline' },
    { to: { name: 'team' }, label: 'Team', icon: 'mdi:account-group-outline' },
]

const onSignOut = async () => {
    await signOut()
    router.replace({ name: 'login' })
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 lg:flex">
        <!-- Mobile top bar -->
        <header class="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between bg-darkPurple px-4">
            <img :src="logo" alt="Kreassi" class="h-6 w-auto" />
            <button type="button" class="p-2 text-white" :aria-expanded="drawerOpen" aria-label="Toggle menu"
                @click="drawerOpen = !drawerOpen">
                <Icon :icon="drawerOpen ? 'mdi:close' : 'mdi:menu'" class="h-6 w-6" />
            </button>
        </header>
        <div v-if="drawerOpen" class="lg:hidden fixed inset-0 z-30 bg-black/40" @click="drawerOpen = false" />

        <!-- Sidebar (drawer on mobile) -->
        <aside
            :class="['fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-darkPurple text-white transition-transform duration-200',
                'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0', drawerOpen ? 'translate-x-0' : '-translate-x-full']">
            <div class="flex h-16 items-center gap-2 border-b border-white/10 px-6">
                <img :src="logo" alt="Kreassi" class="h-7 w-auto" />
                <span class="text-[11px] uppercase tracking-widest text-white/60">Admin</span>
            </div>

            <nav class="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
                <router-link v-for="item in nav" :key="item.label" :to="item.to"
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                    active-class="!bg-white/15 !text-white">
                    <Icon :icon="item.icon" class="h-5 w-5" />
                    {{ item.label }}
                </router-link>
                <a href="/" target="_blank" rel="noopener"
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white">
                    <Icon icon="mdi:open-in-new" class="h-5 w-5" />
                    View website
                </a>
            </nav>

            <div class="border-t border-white/10 p-4">
                <p class="truncate text-sm" :title="email">{{ email }}</p>
                <router-link :to="{ name: 'set-password' }" class="mt-1 inline-block text-xs text-white/60 hover:text-white">Change password</router-link>
                <button type="button"
                    class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm transition-colors hover:bg-white/10"
                    @click="onSignOut">
                    <Icon icon="mdi:logout" class="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>

        <main class="min-w-0 flex-1">
            <!-- The blog is a full-height workspace; other pages get the standard frame. -->
            <router-view v-if="route.meta.fullWidth" />
            <div v-else class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
                <h1 class="text-2xl font-bold text-darkPurple">{{ route.meta.title }}</h1>
                <div class="mt-6">
                    <router-view />
                </div>
            </div>
        </main>
    </div>
</template>
