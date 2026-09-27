<script setup>
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../lib/supabase'
import { publicUrl } from '../lib/images'
import { activateYoutube, readingMinutes, renderPostHtml } from '../lib/render'
import { analyzeDoc } from '../lib/seo'
import { formatDate } from '../lib/text'
import { useCategories } from '../composables/useCategories'
import { CONTACT } from '../../config/site'
import logo from '../../assets/Logos/Kreassi/Original Kreassi Logo.png'

// Shows the post exactly as readers will see it — including unpublished
// changes to a live post. This layout is the proposal for the public blog.
const props = defineProps({ id: { type: String, required: true } })
const categories = useCategories()

const post = ref(null)
const error = ref('')

onMounted(async () => {
    categories.load()
    const { data, error: err } = await supabase.from('posts').select('*').eq('id', props.id).maybeSingle()
    if (err || !data) { error.value = 'This post couldn’t be loaded.'; return }
    post.value = data.status === 'published' && data.pending ? { ...data, ...data.pending, status: data.status, pendingPreview: true } : data
    document.title = `Preview: ${post.value.title || 'Untitled'} · Kreassi Admin`
})

const html = computed(() => (post.value ? renderPostHtml(post.value.content) : ''))
const minutes = computed(() => (post.value ? readingMinutes(analyzeDoc(post.value.content).words) : 0))
const coverUrl = computed(() => publicUrl(post.value?.cover_path))
const category = computed(() => categories.nameOf(post.value?.category_id))
const isId = computed(() => post.value?.lang !== 'en')
const whatsapp = `https://wa.me/${CONTACT.inquiries[0].number.replace(/\D/g, '')}`
const banner = computed(() => (!post.value ? '' : post.value.status === 'draft'
    ? 'Draft preview — not published'
    : post.value.pendingPreview ? 'Preview of unpublished changes' : 'Preview of the published post'))

const onContentClick = (event) => {
    const button = event.target.closest?.('.yt-lite')
    if (button) activateYoutube(button)
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
            <header class="border-b border-gray-100">
                <div class="mx-auto flex h-16 max-w-5xl items-center gap-3 px-5">
                    <img :src="logo" alt="Kreassi" class="h-8 w-auto" />
                    <span class="text-sm font-medium text-gray-400">/ Blog</span>
                </div>
            </header>

            <article :lang="post.lang" class="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:pt-14">
                <p v-if="category" class="mb-4">
                    <span class="rounded-full bg-purple-5/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-5">{{ category }}</span>
                </p>
                <h1 class="text-3xl font-bold leading-tight text-darkPurple sm:text-[2.6rem] sm:leading-[1.15]">{{ post.title || 'Untitled' }}</h1>
                <p class="mt-4 text-sm text-gray-500">
                    Kreassi Team · {{ formatDate(post.published_at || post.updated_at) }} · {{ minutes }} {{ isId ? 'menit baca' : 'min read' }}
                </p>

                <img v-if="coverUrl" :src="coverUrl" :alt="post.cover_alt || ''" class="mt-8 aspect-[1.91/1] w-full rounded-2xl object-cover" />

                <!-- eslint-disable-next-line vue/no-v-html — sanitised in renderPostHtml -->
                <div class="kb-prose mt-10" @click="onContentClick" v-html="html"></div>

                <aside class="mt-14 rounded-2xl bg-darkPurple p-6 text-white sm:p-8">
                    <h2 class="text-xl font-bold">{{ isId ? 'Butuh bantuan konten untuk bisnis Anda?' : 'Need help with content for your business?' }}</h2>
                    <p class="mt-2 text-sm text-white/80">
                        {{ isId
                            ? 'Kreassi Team membantu cafe, F&B, dan UMKM di Pontianak tumbuh lewat media sosial, konten, dan branding.'
                            : 'Kreassi Team helps cafes, F&B and small businesses grow through social media, content and branding.' }}
                    </p>
                    <a :href="whatsapp" target="_blank" rel="noopener"
                        class="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-darkPurple hover:bg-gray-100">
                        <Icon icon="mdi:whatsapp" class="h-5 w-5" />{{ isId ? 'Konsultasi gratis via WhatsApp' : 'Free consultation on WhatsApp' }}
                    </a>
                </aside>
            </article>
        </template>

        <p v-else class="p-10 text-center text-sm text-gray-500">Loading preview…</p>
    </div>
</template>
