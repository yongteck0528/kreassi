<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
    editor: { type: Object, required: true },
    uploading: { type: Boolean, default: false },
})
const emit = defineEmits(['link', 'image', 'youtube', 'instagram', 'alt'])

const run = (fn) => fn(props.editor.chain().focus()).run()

const blockType = computed({
    get: () => (props.editor.isActive('heading', { level: 2 }) ? 'h2' : props.editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'),
    set: (value) => run((c) => (value === 'p' ? c.setParagraph() : c.setHeading({ level: value === 'h2' ? 2 : 3 }))),
})

const marks = computed(() => [
    { key: 'bold', icon: 'mdi:format-bold', label: 'Bold (Ctrl+B)', active: props.editor.isActive('bold'), action: () => run((c) => c.toggleBold()) },
    { key: 'italic', icon: 'mdi:format-italic', label: 'Italic (Ctrl+I)', active: props.editor.isActive('italic'), action: () => run((c) => c.toggleItalic()) },
    { key: 'link', icon: 'mdi:link-variant', label: 'Link (Ctrl+K)', active: props.editor.isActive('link'), action: () => emit('link') },
])
const blocks = computed(() => [
    { key: 'bullet', icon: 'mdi:format-list-bulleted', label: 'Bulleted list', active: props.editor.isActive('bulletList'), action: () => run((c) => c.toggleBulletList()) },
    { key: 'ordered', icon: 'mdi:format-list-numbered', label: 'Numbered list', active: props.editor.isActive('orderedList'), action: () => run((c) => c.toggleOrderedList()) },
    { key: 'quote', icon: 'mdi:format-quote-close', label: 'Quote', active: props.editor.isActive('blockquote'), action: () => run((c) => c.toggleBlockquote()) },
    { key: 'hr', icon: 'mdi:minus', label: 'Divider line', active: false, action: () => run((c) => c.setHorizontalRule()) },
])
const btn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40'
</script>

<template>
    <div class="flex items-center gap-0.5 overflow-x-auto" role="toolbar" aria-label="Formatting">
        <label class="sr-only" for="block-type">Text style</label>
        <select id="block-type" v-model="blockType"
            class="mr-1 h-8 shrink-0 rounded-md border border-gray-200 bg-white pl-2 pr-7 text-sm text-gray-700 focus:border-purple-5 focus:outline-none">
            <option value="p">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
        </select>

        <button v-for="b in marks" :key="b.key" type="button" :title="b.label" :aria-label="b.label" :aria-pressed="b.active"
            :class="[btn, b.active && '!bg-purple-5/10 !text-purple-5']" @click="b.action">
            <Icon :icon="b.icon" class="h-5 w-5" />
        </button>
        <span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true"></span>
        <button v-for="b in blocks" :key="b.key" type="button" :title="b.label" :aria-label="b.label" :aria-pressed="b.active"
            :class="[btn, b.active && '!bg-purple-5/10 !text-purple-5']" @click="b.action">
            <Icon :icon="b.icon" class="h-5 w-5" />
        </button>
        <span class="mx-1 h-5 w-px bg-gray-200" aria-hidden="true"></span>

        <button type="button" title="Insert image" aria-label="Insert image" :class="btn" :disabled="uploading" @click="emit('image')">
            <Icon :icon="uploading ? 'mdi:loading' : 'mdi:image-plus-outline'" :class="['h-5 w-5', uploading && 'motion-safe:animate-spin']" />
        </button>
        <button type="button" title="YouTube video" aria-label="Insert YouTube video" :class="btn" @click="emit('youtube')">
            <Icon icon="mdi:youtube" class="h-5 w-5" />
        </button>
        <button type="button" title="Instagram post" aria-label="Insert Instagram post" :class="btn" @click="emit('instagram')">
            <Icon icon="mdi:instagram" class="h-5 w-5" />
        </button>
        <button v-if="editor.isActive('image')" type="button" title="Image alt text" aria-label="Edit image alt text"
            :class="[btn, 'gap-1 border border-amber-300 bg-amber-50 text-xs font-medium text-amber-800']" @click="emit('alt')">
            <Icon icon="mdi:text-box-edit-outline" class="h-4 w-4" />Alt text
        </button>

        <span class="ml-auto flex items-center gap-0.5">
            <button type="button" title="Undo (Ctrl+Z)" aria-label="Undo" :class="btn" :disabled="!editor.can().undo()" @click="run((c) => c.undo())">
                <Icon icon="mdi:undo" class="h-5 w-5" />
            </button>
            <button type="button" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" :class="btn" :disabled="!editor.can().redo()" @click="run((c) => c.redo())">
                <Icon icon="mdi:redo" class="h-5 w-5" />
            </button>
        </span>
    </div>
</template>
