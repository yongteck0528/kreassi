<script setup>
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import FormDialog from '../components/FormDialog.vue'
import { useFormDialog } from '../composables/useFormDialog'
import { useCategories } from '../composables/useCategories'
import { supabase } from '../lib/supabase'
import { slugify, SLUG_RE } from '../lib/text'

const categories = useCategories()
const { dialog, ask, close } = useFormDialog()
const counts = ref({})
const error = ref('')
const busy = ref(false)

const loadCounts = async () => {
    const { data } = await supabase.from('posts').select('category_id')
    counts.value = (data ?? []).reduce((acc, p) => ({ ...acc, [p.category_id]: (acc[p.category_id] ?? 0) + 1 }), {})
}
onMounted(() => { categories.load(true); loadCounts() })

const items = computed(() => categories.state.items)
const failed = (err) => {
    error.value = err?.code === '23505' ? 'Another category already uses that URL name.' : 'Couldn’t save. Please try again.'
}
const fieldsFor = (c = {}) => [
    { key: 'name', label: 'Name', value: c.name ?? '', required: true, placeholder: 'e.g. Tips & Strategi' },
    { key: 'slug', label: 'URL name', value: c.slug ?? '', placeholder: 'auto from the name', help: 'Used in web addresses. Lowercase letters, numbers and dashes.',
        validate: (v) => (!v || SLUG_RE.test(v) ? '' : 'Use lowercase letters, numbers and dashes only.') },
]

const add = async () => {
    const values = await ask({ title: 'New category', fields: fieldsFor(), confirmLabel: 'Add category' })
    if (!values) return
    busy.value = true
    error.value = ''
    const sortOrder = Math.max(0, ...items.value.map((c) => c.sort_order)) + 10
    const { error: err } = await supabase.from('categories').insert({ name: values.name, slug: values.slug || slugify(values.name), sort_order: sortOrder })
    busy.value = false
    if (err) return failed(err)
    categories.load(true)
}

const rename = async (c) => {
    const values = await ask({ title: 'Edit category', fields: fieldsFor(c), confirmLabel: 'Save' })
    if (!values) return
    error.value = ''
    const { error: err } = await supabase.from('categories').update({ name: values.name, slug: values.slug || slugify(values.name) }).eq('id', c.id)
    if (err) return failed(err)
    categories.load(true)
}

const move = async (index, direction) => {
    const a = items.value[index]
    const b = items.value[index + direction]
    if (!a || !b) return
    busy.value = true
    error.value = ''
    const [ra, rb] = await Promise.all([
        supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    busy.value = false
    if (ra.error || rb.error) failed(ra.error || rb.error)
    categories.load(true)
}

const remove = async (c) => {
    const n = counts.value[c.id] ?? 0
    const ok = await ask({
        title: `Delete “${c.name}”?`,
        message: n ? `${n} post${n === 1 ? '' : 's'} in this category will have no category.` : 'No posts use this category.',
        confirmLabel: 'Delete category',
        danger: true,
    })
    if (!ok) return
    error.value = ''
    const { error: err } = await supabase.from('categories').delete().eq('id', c.id)
    if (err) return failed(err)
    categories.load(true)
    loadCounts()
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-500">Group blog posts by topic. Readers can browse by category, and Google sees how your posts relate.</p>
            <button type="button" :disabled="busy"
                class="inline-flex items-center gap-1.5 rounded-lg bg-darkPurple px-3 py-2 text-sm font-semibold text-white hover:bg-[#4A1A78] disabled:opacity-60" @click="add">
                <Icon icon="mdi:plus" class="h-4 w-4" />New category
            </button>
        </div>
        <p v-if="error || categories.state.error" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error || categories.state.error }}</p>

        <ul class="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <li v-if="!items.length" class="px-5 py-6 text-sm text-gray-500">No categories yet.</li>
            <li v-for="(c, i) in items" :key="c.id" class="flex items-center gap-3 px-5 py-3">
                <div class="flex flex-col">
                    <button type="button" class="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30" :disabled="i === 0 || busy" :aria-label="`Move ${c.name} up`" @click="move(i, -1)">
                        <Icon icon="mdi:chevron-up" class="h-4 w-4" />
                    </button>
                    <button type="button" class="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30" :disabled="i === items.length - 1 || busy" :aria-label="`Move ${c.name} down`" @click="move(i, 1)">
                        <Icon icon="mdi:chevron-down" class="h-4 w-4" />
                    </button>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-gray-900">{{ c.name }}</p>
                    <p class="truncate text-xs text-gray-500">/blog/category/{{ c.slug }} · {{ counts[c.id] ?? 0 }} post{{ (counts[c.id] ?? 0) === 1 ? '' : 's' }}</p>
                </div>
                <button type="button" class="rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100" @click="rename(c)">Edit</button>
                <button type="button" class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-700" :aria-label="`Delete ${c.name}`" @click="remove(c)">
                    <Icon icon="mdi:trash-can-outline" class="h-5 w-5" />
                </button>
            </li>
        </ul>
        <FormDialog v-if="dialog" :config="dialog" @close="close" />
    </div>
</template>
