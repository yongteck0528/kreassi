<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { usePosts } from '../../composables/usePosts'
import { timeAgo } from '../../lib/text'

const { state, load, create, drafts, published } = usePosts()
const router = useRouter()

const query = ref('')
const creating = ref(false)
const error = ref('')

onMounted(() => { if (!state.loaded) load() })

const titleOf = (p) => (p.pending_title ?? p.title ?? '').trim()
const matches = (p) => !query.value.trim() || titleOf(p).toLowerCase().includes(query.value.trim().toLowerCase())
const groups = computed(() => [
    { key: 'draft', label: 'Drafts', empty: 'No drafts', items: drafts.value.filter(matches) },
    { key: 'published', label: 'Published', empty: 'Nothing published yet', items: published.value.filter(matches) },
])

const newPost = async () => {
    creating.value = true
    error.value = ''
    try {
        const post = await create()
        router.push({ name: 'post-edit', params: { id: post.id } })
    } catch {
        error.value = 'Could not create a post. Please try again.'
    } finally {
        creating.value = false
    }
}
</script>

<template>
    <div class="flex h-full min-h-0 flex-col">
        <div class="border-b border-gray-200 p-4">
            <div class="flex items-center justify-between gap-3">
                <h1 class="text-lg font-bold text-darkPurple">Blog</h1>
                <button type="button" :disabled="creating"
                    class="inline-flex items-center gap-1.5 rounded-lg bg-darkPurple px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#4A1A78] disabled:opacity-60"
                    @click="newPost">
                    <Icon icon="mdi:plus" class="h-4 w-4" />New post
                </button>
            </div>
            <div class="relative mt-3">
                <Icon icon="mdi:magnify" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input v-model="query" type="search" placeholder="Search posts" aria-label="Search posts"
                    class="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-purple-5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-5/20" />
            </div>
            <p v-if="error || state.error" role="alert" class="mt-2 text-xs text-red-700">{{ error || state.error }}</p>
        </div>

        <nav class="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Posts">
            <p v-if="state.loading && !state.loaded" class="p-4 text-sm text-gray-500">Loading…</p>
            <template v-for="g in groups" v-else :key="g.key">
                <h2 class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {{ g.label }} <span class="font-normal text-gray-400">{{ g.items.length }}</span>
                </h2>
                <p v-if="!g.items.length" class="px-3 py-2 text-sm text-gray-400">{{ query ? 'No matches' : g.empty }}</p>
                <router-link v-for="p in g.items" :key="p.id" :to="{ name: 'post-edit', params: { id: p.id } }"
                    class="block rounded-lg px-3 py-2 transition-colors hover:bg-gray-100" active-class="!bg-purple-5/10">
                    <span :class="['block truncate text-sm font-medium', titleOf(p) ? 'text-gray-900' : 'italic text-gray-400']">
                        {{ titleOf(p) || 'Untitled' }}
                    </span>
                    <span class="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <template v-if="p.status === 'published' && p.pending_title != null">
                            <span class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
                            <span class="text-amber-700">Unpublished changes</span> ·
                        </template>
                        {{ timeAgo(p.updated_at) }}
                    </span>
                </router-link>
            </template>
        </nav>
    </div>
</template>
