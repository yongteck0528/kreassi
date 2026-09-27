<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Icon } from '@iconify/vue'
import FormDialog from '../components/FormDialog.vue'
import EditorToolbar from '../components/blog/EditorToolbar.vue'
import SeoChecklist from '../components/blog/SeoChecklist.vue'
import { useFormDialog } from '../composables/useFormDialog'
import { usePosts } from '../composables/usePosts'
import { useCategories } from '../composables/useCategories'
import { useTeam } from '../composables/useTeam'
import { supabase } from '../lib/supabase'
import { createExtensions } from '../editor/extensions'
import { INSTAGRAM_URL_RE } from '../editor/InstagramCard'
import { publicUrl, uploadImage } from '../lib/images'
import { analyzeDoc } from '../lib/seo'
import { formatDate, slugify, SLUG_RE, timeAgo } from '../lib/text'

const props = defineProps({ id: { type: String, required: true } })

// The editable parts of a post. Drafts save them straight into the post;
// published posts save them into `pending` until "Update post".
const FIELDS = ['title', 'slug', 'lang', 'category_id', 'excerpt', 'focus_keyword', 'cover_path', 'cover_alt', 'content']
const EMPTY_DOC = { type: 'doc', content: [] }
const AUTOSAVE_MS = 1200
const YOUTUBE_RE = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]{11}/

const router = useRouter()
const posts = usePosts()
const categories = useCategories()
const team = useTeam()
const { dialog, ask, close } = useFormDialog()

const loading = ref(true)
const loadError = ref('')
const live = ref(null) // the post as stored
const doc = reactive(Object.fromEntries(FIELDS.map((f) => [f, null]))) // the working copy
const saveState = ref('saved') // saved | dirty | saving | error | conflict
const saveError = ref('')
const slugError = ref('')
const slugTouched = ref(false)
const busy = ref('')
const actionError = ref('')
const notice = ref('')
const uploading = ref(false)
const coverUploading = ref(false)
const settingsOpen = ref(false)
const menuOpen = ref(false)
const titleEl = ref(null)
const imageInput = ref(null)
const coverInput = ref(null)

let version = null // updated_at we last saw: an edit elsewhere in between = conflict
let lastSaved = ''
let timer = null
let inFlight = null
let contentApplied = false

const pick = (row) => Object.fromEntries(FIELDS.map((f) => [f, row?.[f] ?? (f === 'content' ? EMPTY_DOC : f === 'lang' ? 'id' : null)]))
const fields = () => Object.fromEntries(FIELDS.map((f) => [f, doc[f]]))
const snapshot = computed(() => JSON.stringify(fields()))
const liveSnapshot = computed(() => JSON.stringify(pick(live.value)))

const isPublished = computed(() => live.value?.status === 'published')
const hasPending = computed(() => isPublished.value && snapshot.value !== liveSnapshot.value)
const stats = computed(() => analyzeDoc(doc.content))
const coverUrl = computed(() => publicUrl(doc.cover_path))

// ---- Editor ------------------------------------------------------------------
const editor = useEditor({
    extensions: createExtensions({ placeholder: 'Start writing your post…' }),
    content: EMPTY_DOC,
    editorProps: {
        attributes: { class: 'kb-prose kb-editor', 'aria-label': 'Post content' },
        handleKeyDown: (_view, event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                editLink()
                return true
            }
            return false
        },
    },
    onUpdate: ({ editor: e }) => {
        if (!contentApplied) return
        doc.content = e.getJSON()
    },
})

const applyContent = () => {
    if (!editor.value || loading.value) return
    contentApplied = false
    editor.value.commands.setContent(doc.content ?? EMPTY_DOC, { emitUpdate: false })
    contentApplied = true
}
watch(editor, applyContent)

// ---- Load --------------------------------------------------------------------
const load = async () => {
    loading.value = true
    loadError.value = ''
    const { data, error } = await supabase.from('posts').select('*').eq('id', props.id).maybeSingle()
    if (error || !data) {
        loadError.value = error ? 'Could not load this post. Please refresh.' : 'This post doesn’t exist anymore.'
        loading.value = false
        return
    }
    live.value = data
    version = data.updated_at
    Object.assign(doc, data.status === 'published' && data.pending ? pick({ ...data, ...data.pending }) : pick(data))
    slugTouched.value = !!doc.slug && doc.slug !== slugify(doc.title)
    lastSaved = snapshot.value
    saveState.value = 'saved'
    loading.value = false
    await nextTick()
    applyContent()
    autosizeTitle()
}

// ---- Autosave ----------------------------------------------------------------
watch(snapshot, (value) => {
    if (loading.value || saveState.value === 'conflict') return
    if (value === lastSaved) { if (saveState.value === 'dirty') saveState.value = 'saved'; return }
    saveState.value = 'dirty'
    clearTimeout(timer)
    timer = setTimeout(save, AUTOSAVE_MS)
})

// New/unpublished posts: the URL follows the title until edited by hand.
// Published posts keep their URL (changing it breaks shared links).
watch(() => doc.title, (title) => {
    if (!loading.value && !slugTouched.value && !isPublished.value) doc.slug = slugify(title) || null
})

const errorMessage = (error) => {
    if (error?.code === '23505') { slugError.value = 'Another post already uses this URL.'; return 'Another post already uses this URL — change it in Post settings.' }
    if (error?.code === '23514') return 'A published post needs a title and a URL.'
    if (/fetch|network/i.test(error?.message ?? '')) return 'You seem to be offline. Changes will save when you’re back.'
    return 'Couldn’t save. Please try again.'
}

const syncList = () => {
    const p = live.value
    posts.patch(p.id, {
        title: p.title, status: p.status, updated_at: p.updated_at, published_at: p.published_at,
        lang: p.lang, category_id: p.category_id, pending_title: p.pending ? (p.pending.title ?? '') : null,
    })
}

/** Run an update guarded by `version`; resolves to the fresh row, null on conflict. */
const guardedUpdate = async (patch) => {
    const { data, error } = await supabase.from('posts').update(patch).eq('id', props.id).eq('updated_at', version).select('*').maybeSingle()
    if (error) throw error
    if (!data) { saveState.value = 'conflict'; return null }
    live.value = data
    version = data.updated_at
    syncList()
    return data
}

const save = async () => {
    clearTimeout(timer)
    timer = null
    if (!live.value || saveState.value === 'conflict') return
    if (inFlight) { await inFlight; return save() }
    const snap = snapshot.value
    if (snap === lastSaved) { saveState.value = 'saved'; return }

    slugError.value = ''
    saveError.value = ''
    if (doc.slug && !SLUG_RE.test(doc.slug)) {
        slugError.value = 'Use lowercase letters, numbers and dashes only.'
        saveError.value = 'Fix the post URL in Post settings to keep saving.'
        saveState.value = 'error'
        return
    }
    saveState.value = 'saving'
    const values = fields()
    const patch = isPublished.value ? { pending: snap === liveSnapshot.value ? null : values } : values
    inFlight = guardedUpdate(patch)
    try {
        const row = await inFlight
        if (!row) return
        lastSaved = snap
        saveState.value = snapshot.value === snap ? 'saved' : 'dirty'
        if (saveState.value === 'dirty') timer = setTimeout(save, AUTOSAVE_MS)
    } catch (error) {
        saveError.value = errorMessage(error)
        saveState.value = 'error'
    } finally {
        inFlight = null
    }
}

/** Save anything outstanding; true when everything is stored. */
const flush = async () => {
    if (timer || ['dirty', 'error'].includes(saveState.value)) await save()
    if (inFlight) await inFlight
    return saveState.value === 'saved'
}

// ---- Publishing actions ------------------------------------------------------------
const run = async (kind, fn) => {
    busy.value = kind
    actionError.value = ''
    notice.value = ''
    try { await fn() } catch (error) { actionError.value = errorMessage(error) } finally { busy.value = '' }
}
const reloadWorkingCopy = async () => {
    Object.assign(doc, live.value.pending ? pick({ ...live.value, ...live.value.pending }) : pick(live.value))
    lastSaved = snapshot.value
    saveState.value = 'saved'
    await nextTick()
    applyContent()
    autosizeTitle()
}

const publish = () => run('publish', async () => {
    if (!doc.title?.trim()) { actionError.value = 'Add a title before publishing.'; return }
    if (!doc.slug) doc.slug = slugify(doc.title)
    if (!(await flush())) { actionError.value = saveError.value || 'Please fix the errors first.'; return }
    const ok = await ask({
        title: 'Publish this post?',
        message: `It will live at kreassiteam.com/blog/${doc.slug}\n\nPublished posts appear on the website once the public blog launches.`,
        confirmLabel: 'Publish',
    })
    if (!ok) return
    if (await guardedUpdate({ status: 'published' })) notice.value = 'Published.'
})

const updatePost = () => run('update', async () => {
    if (!(await flush())) { actionError.value = saveError.value || 'Please fix the errors first.'; return }
    if (await guardedUpdate({ ...fields(), pending: null })) {
        await reloadWorkingCopy()
        notice.value = 'The live post is updated.'
    }
})

const discard = () => run('discard', async () => {
    const ok = await ask({ title: 'Discard your changes?', message: 'The live post stays exactly as it is now.', confirmLabel: 'Discard changes', danger: true })
    if (!ok) return
    clearTimeout(timer)
    timer = null
    if (inFlight) await inFlight
    if (await guardedUpdate({ pending: null })) await reloadWorkingCopy()
})

const unpublish = () => run('unpublish', async () => {
    menuOpen.value = false
    const ok = await ask({
        title: 'Unpublish this post?',
        message: 'It goes back to Drafts and is taken off the website. Your latest edits are kept in the draft.',
        confirmLabel: 'Unpublish',
    })
    if (!ok || !(await flush())) return
    if (await guardedUpdate({ ...fields(), status: 'draft' })) await reloadWorkingCopy()
})

const deletePost = () => run('delete', async () => {
    menuOpen.value = false
    const ok = await ask({
        title: 'Delete this post?',
        message: `“${doc.title?.trim() || 'Untitled'}” will be permanently deleted${isPublished.value ? ' and taken off the website' : ''}. This can’t be undone.`,
        confirmLabel: 'Delete post',
        danger: true,
    })
    if (!ok) return
    clearTimeout(timer)
    timer = null
    const { error } = await supabase.from('posts').delete().eq('id', props.id)
    if (error) throw error
    live.value = null
    posts.remove(props.id)
    router.push({ name: 'posts' })
})

const openPreview = async () => {
    const tab = window.open('', '_blank') // open now, while it still counts as a click
    await flush()
    const href = router.resolve({ name: 'post-preview', params: { id: props.id } }).href
    if (tab) tab.location.href = href
    else router.push(href)
}

// ---- Inserting content ----------------------------------------------------------------
// Blocks (image, video, Instagram card) go in with an empty paragraph after
// them, so you can keep typing. If a block is currently selected (e.g. the
// card just inserted), the new one goes after it instead of replacing it.
const insertBlock = (node) => {
    const { selection } = editor.value.state
    const content = [node, { type: 'paragraph' }]
    const chain = editor.value.chain().focus()
    ;(selection.node ? chain.insertContentAt(selection.to, content) : chain.insertContent(content)).run()
}

const normalizeUrl = (v) => (/^[\w-]+(\.[\w-]+)+(\/|$)/i.test(v) ? `https://${v}` : v)

async function editLink() {
    const current = editor.value.getAttributes('link').href ?? ''
    const values = await ask({
        title: current ? 'Edit link' : 'Add link',
        fields: [{
            key: 'href', label: 'Link address', value: current, placeholder: 'https://wa.me/628115700777',
            help: 'Tip: link “hubungi kami” to your WhatsApp. Leave empty to remove the link.',
            validate: (v) => (!v || /^(https?:\/\/|mailto:|tel:|\/)/i.test(normalizeUrl(v)) ? '' : 'Start with https://, mailto:, tel: or /'),
        }],
        confirmLabel: 'Save link',
    })
    if (values === null) return
    const href = normalizeUrl(values.href)
    const chain = editor.value.chain().focus().extendMarkRange('link')
    if (!href) chain.unsetLink().run()
    else if (editor.value.state.selection.empty && !current) chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run()
    else chain.setLink({ href }).run()
}

const onImageFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const values = await ask({
        title: 'Describe this image',
        message: 'Alt text is read by Google Images and screen readers.',
        fields: [{ key: 'alt', label: 'Alt text', placeholder: 'e.g. Latte art di sebuah cafe di Pontianak', help: 'Say what the image shows, in the post’s language.' }],
        confirmLabel: 'Insert image',
    })
    if (!values) return
    uploading.value = true
    actionError.value = ''
    try {
        const image = await uploadImage(file, props.id)
        insertBlock({ type: 'image', attrs: { src: image.url, alt: values.alt } })
    } catch (error) {
        actionError.value = error.message
    } finally {
        uploading.value = false
    }
}

const editAlt = async () => {
    const values = await ask({
        title: 'Image alt text',
        fields: [{ key: 'alt', label: 'Alt text', value: editor.value.getAttributes('image').alt ?? '', placeholder: 'Describe what the image shows' }],
        confirmLabel: 'Save',
    })
    if (values) editor.value.chain().focus().updateAttributes('image', { alt: values.alt }).run()
}

const insertYoutube = async () => {
    const values = await ask({
        title: 'Add a YouTube video',
        message: 'Readers see a thumbnail; the video only loads when they tap play — so the page stays fast.',
        fields: [{ key: 'url', label: 'YouTube link', placeholder: 'https://www.youtube.com/watch?v=…', required: true, validate: (v) => (YOUTUBE_RE.test(v) ? '' : 'Paste a YouTube video link.') }],
        confirmLabel: 'Add video',
    })
    if (values) insertBlock({ type: 'youtube', attrs: { src: normalizeUrl(values.url) } })
}

const insertInstagram = async () => {
    const values = await ask({
        title: 'Add an Instagram post',
        message: 'Shown as a light link card (Instagram’s own embed slows pages down).',
        fields: [
            { key: 'url', label: 'Instagram post link', placeholder: 'https://www.instagram.com/p/…', required: true, validate: (v) => (INSTAGRAM_URL_RE.test(v) ? '' : 'Paste a link to an Instagram post or reel.') },
            { key: 'caption', label: 'Card text (optional)', placeholder: 'e.g. Lihat hasil foto produk untuk 2 Points Coffee' },
        ],
        confirmLabel: 'Add card',
    })
    if (values) insertBlock({ type: 'instagramCard', attrs: { url: values.url, caption: values.caption } })
}

const onCoverFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    coverUploading.value = true
    actionError.value = ''
    try {
        const image = await uploadImage(file, props.id)
        doc.cover_path = image.path
    } catch (error) {
        actionError.value = error.message
    } finally {
        coverUploading.value = false
    }
}

// ---- Title field ---------------------------------------------------------------------
const autosizeTitle = () => {
    const el = titleEl.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
}
// Enter in the title jumps to the start of the post body. Move focus right away:
// the editor's own focus command waits a frame, and quick typists' next
// letters would still land in the title.
const titleEnter = () => {
    const e = editor.value
    if (!e) return
    e.commands.setTextSelection(0) // clamped to the first text position
    e.view.focus()
}

// ---- Page lifecycle -----------------------------------------------------------------
const onKeydown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        save()
    }
}
const onBeforeUnload = (event) => {
    if (['dirty', 'saving', 'error'].includes(saveState.value)) event.preventDefault()
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('beforeunload', onBeforeUnload)
    categories.load()
    team.load()
    load()
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('beforeunload', onBeforeUnload)
    if (!live.value || saveState.value === 'conflict') return
    const s = analyzeDoc(doc.content)
    const empty = live.value.status === 'draft' && !doc.title?.trim() && !s.words && !s.images && !doc.cover_path && !doc.excerpt
    if (empty) {
        clearTimeout(timer)
        posts.remove(props.id)
        supabase.from('posts').delete().eq('id', props.id).then(() => {})
    } else if (timer || saveState.value === 'dirty') {
        save()
    }
})

// ---- Display helpers -------------------------------------------------------------------
const status = computed(() => (!isPublished.value
    ? { label: 'Draft', dot: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-100' }
    : hasPending.value
        ? { label: 'Published · unpublished changes', dot: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50' }
        : { label: 'Published', dot: 'bg-[#0a7d0a]', text: 'text-[#0a5d0a]', bg: 'bg-green-50' }))
const saveLabel = computed(() => ({ saved: 'Saved', dirty: 'Editing…', saving: 'Saving…', error: 'Not saved', conflict: 'Not saved' })[saveState.value])
const descriptionLength = computed(() => doc.excerpt?.length ?? 0)
const slugChangedOnLive = computed(() => isPublished.value && live.value?.slug && doc.slug !== live.value.slug)
const inputClass = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-5 focus:outline-none focus:ring-2 focus:ring-purple-5/20'
const btnSecondary = 'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
const btnPrimary = 'inline-flex items-center gap-1.5 rounded-lg bg-darkPurple px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#4A1A78] disabled:opacity-50'
</script>

<template>
    <div v-if="loadError" class="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p class="text-sm text-gray-600">{{ loadError }}</p>
        <router-link :to="{ name: 'posts' }" class="text-sm font-medium text-purple-5 hover:underline">Back to posts</router-link>
    </div>

    <div v-else class="flex h-full min-h-0">
        <div class="flex min-w-0 flex-1 flex-col">
            <!-- Top bar -->
            <header class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 bg-white px-4 py-2.5">
                <router-link :to="{ name: 'posts' }" class="-ml-1 rounded-md p-1 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Back to posts">
                    <Icon icon="mdi:arrow-left" class="h-5 w-5" />
                </router-link>
                <span v-if="live" :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', status.bg, status.text]">
                    <span :class="['h-1.5 w-1.5 rounded-full', status.dot]" aria-hidden="true"></span>{{ status.label }}
                </span>
                <span class="inline-flex items-center gap-1 text-xs text-gray-500" role="status" aria-live="polite">
                    <Icon v-if="saveState === 'saved'" icon="mdi:check" class="h-3.5 w-3.5" />
                    <Icon v-else-if="saveState === 'saving'" icon="mdi:loading" class="h-3.5 w-3.5 motion-safe:animate-spin" />
                    {{ saveLabel }}
                </span>

                <div class="ml-auto flex flex-wrap items-center gap-2">
                    <button type="button" :class="btnSecondary" :disabled="loading" @click="openPreview">
                        <Icon icon="mdi:eye-outline" class="h-4 w-4" />Preview
                    </button>
                    <template v-if="live && !isPublished">
                        <button type="button" :class="btnPrimary" :disabled="!!busy || loading" @click="publish">
                            <Icon icon="mdi:send-outline" class="h-4 w-4" />{{ busy === 'publish' ? 'Publishing…' : 'Publish' }}
                        </button>
                    </template>
                    <template v-else-if="hasPending">
                        <button type="button" :class="btnSecondary" :disabled="!!busy" @click="discard">Discard changes</button>
                        <button type="button" :class="btnPrimary" :disabled="!!busy" @click="updatePost">
                            <Icon icon="mdi:upload-outline" class="h-4 w-4" />{{ busy === 'update' ? 'Updating…' : 'Update post' }}
                        </button>
                    </template>
                    <button type="button" :class="[btnSecondary, '2xl:hidden']" :aria-expanded="settingsOpen" @click="settingsOpen = !settingsOpen">
                        <Icon icon="mdi:tune-variant" class="h-4 w-4" />Settings
                    </button>
                    <div class="relative">
                        <button type="button" class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="More actions" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
                            <Icon icon="mdi:dots-horizontal" class="h-5 w-5" />
                        </button>
                        <div v-if="menuOpen" class="fixed inset-0 z-30" @click="menuOpen = false"></div>
                        <div v-if="menuOpen" class="absolute right-0 z-40 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg" role="menu">
                            <button v-if="isPublished" type="button" role="menuitem" class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" @click="unpublish">
                                <Icon icon="mdi:eye-off-outline" class="h-4 w-4" />Unpublish
                            </button>
                            <button type="button" role="menuitem" class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50" @click="deletePost">
                                <Icon icon="mdi:trash-can-outline" class="h-4 w-4" />Delete post
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Notices -->
            <div v-if="saveState === 'conflict'" role="alert" class="flex flex-wrap items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                <Icon icon="mdi:account-multiple-outline" class="h-5 w-5 shrink-0" />
                <span class="flex-1">This post was changed somewhere else (another admin or another tab), so your latest edits weren’t saved.</span>
                <button type="button" class="rounded-lg bg-white px-3 py-1 font-medium text-red-800 ring-1 ring-red-300 hover:bg-red-100" @click="load">Load latest version</button>
            </div>
            <div v-else-if="hasPending" class="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                <Icon icon="mdi:information-outline" class="h-4 w-4 shrink-0" />
                Your edits are saved but not live yet. <strong class="font-semibold">Update post</strong> publishes them.
            </div>
            <div v-if="actionError || saveError" role="alert" class="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                <Icon icon="mdi:alert-circle-outline" class="h-4 w-4 shrink-0" />
                <span class="flex-1">{{ actionError || saveError }}</span>
                <button v-if="saveError && saveState === 'error'" type="button" class="font-medium underline" @click="save">Retry</button>
            </div>
            <div v-else-if="notice" role="status" class="flex items-center gap-2 border-b border-green-200 bg-green-50 px-4 py-2 text-sm text-green-900">
                <Icon icon="mdi:check-circle-outline" class="h-4 w-4 shrink-0" />{{ notice }}
            </div>

            <!-- Document -->
            <div class="min-h-0 flex-1 overflow-y-auto">
                <p v-if="loading" class="p-10 text-center text-sm text-gray-500">Loading post…</p>
                <div v-show="!loading" class="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-10">
                    <!-- Cover -->
                    <div v-if="coverUrl" class="group relative mb-6 overflow-hidden rounded-2xl bg-gray-100">
                        <img :src="coverUrl" :alt="doc.cover_alt || ''" class="aspect-[1.91/1] w-full object-cover" />
                        <div class="absolute right-3 top-3 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                            <button type="button" class="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 shadow hover:bg-white" @click="coverInput.click()">Change</button>
                            <button type="button" class="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 shadow hover:bg-white" @click="doc.cover_path = null; doc.cover_alt = null">Remove</button>
                        </div>
                    </div>
                    <div v-if="coverUrl" class="-mt-3 mb-6">
                        <label for="cover-alt" class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Cover alt text</label>
                        <input id="cover-alt" v-model="doc.cover_alt" type="text" maxlength="200" placeholder="Describe the cover image (alt text)"
                            class="w-full border-0 border-b border-dashed border-gray-300 bg-transparent px-0 py-1 text-sm text-gray-600 placeholder-gray-400 focus:border-purple-5 focus:outline-none focus:ring-0" />
                    </div>
                    <button v-else type="button" :disabled="coverUploading"
                        class="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        @click="coverInput.click()">
                        <Icon :icon="coverUploading ? 'mdi:loading' : 'mdi:image-outline'" :class="['h-4 w-4', coverUploading && 'motion-safe:animate-spin']" />
                        {{ coverUploading ? 'Uploading…' : 'Add cover image' }}
                    </button>

                    <!-- Title -->
                    <label for="post-title" class="sr-only">Title</label>
                    <textarea id="post-title" ref="titleEl" v-model="doc.title" rows="1" maxlength="200" placeholder="Post title"
                        class="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-3xl font-bold leading-tight text-darkPurple placeholder-gray-300 focus:outline-none focus:ring-0 sm:text-4xl"
                        @input="autosizeTitle" @keydown.enter.prevent="titleEnter"></textarea>

                    <!-- Toolbar + content -->
                    <div v-if="editor" class="sticky top-0 z-10 -mx-2 mt-6 border-b border-gray-100 bg-white/95 px-2 py-1.5 backdrop-blur">
                        <EditorToolbar :editor="editor" :uploading="uploading" @link="editLink" @image="imageInput.click()"
                            @youtube="insertYoutube" @instagram="insertInstagram" @alt="editAlt" />
                    </div>
                    <EditorContent :editor="editor" class="mt-6" />
                </div>
            </div>
        </div>

        <!-- Settings panel: a column on very wide screens, a drawer otherwise (more room to write) -->
        <div v-if="settingsOpen" class="fixed inset-0 z-30 bg-black/30 2xl:hidden" @click="settingsOpen = false"></div>
        <aside :class="['min-h-0 w-full max-w-sm shrink-0 overflow-y-auto border-l border-gray-200 bg-white 2xl:static 2xl:block 2xl:w-80',
            settingsOpen ? 'fixed inset-y-0 right-0 z-40 block shadow-2xl' : 'hidden']" aria-label="Post settings">
            <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <h2 class="text-sm font-semibold text-gray-900">Post settings</h2>
                <button type="button" class="rounded-md p-1 text-gray-500 hover:bg-gray-100 2xl:hidden" aria-label="Close settings" @click="settingsOpen = false">
                    <Icon icon="mdi:close" class="h-5 w-5" />
                </button>
            </div>
            <div class="space-y-5 px-5 py-5">
                <div>
                    <label for="post-slug" class="mb-1 block text-sm font-medium text-gray-700">URL</label>
                    <div class="flex items-center rounded-lg border border-gray-300 focus-within:border-purple-5 focus-within:ring-2 focus-within:ring-purple-5/20">
                        <span class="pl-3 text-xs text-gray-400">/blog/</span>
                        <input id="post-slug" v-model.trim="doc.slug" type="text" maxlength="100" placeholder="post-url"
                            class="min-w-0 flex-1 rounded-r-lg border-0 bg-transparent py-2 pl-0.5 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-0"
                            @input="slugTouched = true" />
                    </div>
                    <p v-if="slugError" class="mt-1 text-xs text-red-700">{{ slugError }}</p>
                    <p v-else-if="slugChangedOnLive" class="mt-1 text-xs text-amber-700">Changing a published post’s URL breaks links people already shared.</p>
                    <p v-else class="mt-1 text-xs text-gray-500">Follows the title until you edit it.</p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="post-lang" class="mb-1 block text-sm font-medium text-gray-700">Language</label>
                        <select id="post-lang" v-model="doc.lang" :class="inputClass">
                            <option value="id">Indonesian</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div>
                        <label for="post-category" class="mb-1 block text-sm font-medium text-gray-700">Category</label>
                        <select id="post-category" v-model="doc.category_id" :class="inputClass">
                            <option :value="null">None</option>
                            <option v-for="c in categories.state.items" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <div class="mb-1 flex items-baseline justify-between">
                        <label for="post-excerpt" class="block text-sm font-medium text-gray-700">Description</label>
                        <span :class="['text-xs tabular-nums', descriptionLength && (descriptionLength < 70 || descriptionLength > 160) ? 'text-amber-700' : 'text-gray-400']">{{ descriptionLength }}/160</span>
                    </div>
                    <textarea id="post-excerpt" v-model="doc.excerpt" rows="3" maxlength="300" :class="inputClass"
                        placeholder="A one or two sentence summary. Shown under the title in Google and when shared."></textarea>
                </div>

                <div>
                    <label for="post-keyword" class="mb-1 block text-sm font-medium text-gray-700">Focus keyword</label>
                    <input id="post-keyword" v-model="doc.focus_keyword" type="text" maxlength="80" :class="inputClass" placeholder="e.g. ide konten cafe pontianak" />
                    <p class="mt-1 text-xs text-gray-500">The search phrase this post should rank for. Only used for the checklist.</p>
                </div>

                <div class="border-t border-gray-100 pt-5">
                    <SeoChecklist :post="doc" :stats="stats" />
                </div>

                <dl v-if="live" class="space-y-1.5 border-t border-gray-100 pt-5 text-xs text-gray-500">
                    <div class="flex justify-between gap-3"><dt>Created</dt><dd class="text-right text-gray-700">{{ formatDate(live.created_at) }}<span v-if="team.emailOf(live.author_id)"> · {{ team.emailOf(live.author_id) }}</span></dd></div>
                    <div class="flex justify-between gap-3"><dt>Last edited</dt><dd class="text-right text-gray-700">{{ timeAgo(live.updated_at) }}<span v-if="team.emailOf(live.updated_by)"> · {{ team.emailOf(live.updated_by) }}</span></dd></div>
                    <div v-if="live.published_at" class="flex justify-between gap-3"><dt>First published</dt><dd class="text-gray-700">{{ formatDate(live.published_at) }}</dd></div>
                    <div class="flex justify-between gap-3"><dt>Words</dt><dd class="text-gray-700">{{ stats.words }}</dd></div>
                </dl>
            </div>
        </aside>

        <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImageFile" />
        <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverFile" />
        <FormDialog v-if="dialog" :config="dialog" @close="close" />
    </div>
</template>
