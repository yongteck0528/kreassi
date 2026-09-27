<script setup>
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabase'
import { activateYoutube } from '../../blog/content.js'
import { articleHtml, postView } from '../../blog/templates.js'
import { useCategories } from '../composables/useCategories'
import logo from '../../assets/Logos/Kreassi/Original Kreassi Logo.png'

// Shows the post as readers will see it — the same article markup the site
// build uses — including unpublished changes to a live post.
const props = defineProps({ id: { type: String, required: true } })
const categories = useCategories()

const post = ref(null)
const error = ref('')

onMounted(async () => {
    const [{ data, error: err }] = await Promise.all([
        supabase.from('posts').select('*').eq('id', props.id).maybeSingle(),
        categories.load(),
    ])
    if (err || !data) { error.value = 'This post couldn’t be loaded.'; return }
    post.value = data.status === 'published' && data.pending ? { ...data, ...data.pending, status: data.status, pendingPreview: true } : data
    document.title = `Preview: ${post.value.title || 'Untitled'} · Kreassi Admin`
})

const html = computed(() => {
    if (!post.value) return ''
    const map = new Map(categories.state.items.map((c) => [c.id, c]))
    return articleHtml(postView({ ...post.value, title: post.value.title || 'Untitled', slug: post.value.slug || 'preview' }, map))
})
const banner = computed(() => (!post.value ? '' : post.value.status === 'draft'
    ? 'Draft preview — not published'
    : post.value.pendingPreview ? 'Preview of unpublished changes' : 'Preview of the published post'))

// Links inside the preview would leave it — only videos stay interactive.
const onClick = (event) => {
    const video = event.target.closest?.('.yt-lite')
    if (video) { activateYoutube(video); return }
    if (event.target.closest?.('a, [data-copy-link]')) event.preventDefault()
}
</script>

<template>
    <div class="min-h-screen bg-white">
        <div class="sticky top-0 z-20 flex items-center gap-3 bg-darkPurple px-4 py-2 text-sm text-white">
            <Icon icon="mdi:eye-outline" class="h-4 w-4" />
            <span class="flex-1">{{ banner || 'Preview' }}</span>
            <router-link :to="{ name: 'post-edit', params: { id } }" class="rounded-md bg-white/15 px-3 py-1 font-medium hover:bg-white/25">Back to editor</router-link>
        </div>

        <p v-if="error" class="p-10 text-center text-sm text-gray-600">{{ error }}</p>

        <template v-else-if="post">
            <header class="bg-white shadow-md">
                <div class="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                    <img :src="logo" alt="Kreassi" class="h-10 w-auto" />
                </div>
            </header>
            <!-- eslint-disable-next-line vue/no-v-html — built by articleHtml, which escapes everything -->
            <div @click="onClick" v-html="html"></div>
        </template>

        <p v-else class="p-10 text-center text-sm text-gray-500">Loading preview…</p>
    </div>
</template>
