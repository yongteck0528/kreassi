<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Icon } from '@iconify/vue'

/**
 * config: {
 *   title, message?, confirmLabel?, cancelLabel? (null hides it), danger?,
 *   fields?: [{ key, label, type?: 'text' | 'url' | 'email' | 'textarea', value?, placeholder?, help?, required?, validate?(v) → error }],
 *   copy?: { label, value }            — a value to show once with a Copy button (e.g. a temporary password)
 *   links?: [{ label, href, icon? }]   — extra actions (e.g. "Send via WhatsApp")
 * }
 */
const props = defineProps({ config: { type: Object, required: true } })
const emit = defineEmits(['close'])

const values = reactive(Object.fromEntries((props.config.fields ?? []).map((f) => [f.key, f.value ?? ''])))
const errors = reactive({})
const panel = ref(null)
const copied = ref(false)

onMounted(async () => {
    await nextTick()
    panel.value?.querySelector('input, textarea, button[data-confirm]')?.focus()
})

const submit = () => {
    let invalid = false
    for (const f of props.config.fields ?? []) {
        const v = String(values[f.key] ?? '').trim()
        errors[f.key] = f.required && !v ? `${f.label} is required.` : (f.validate?.(v) || '')
        if (errors[f.key]) invalid = true
    }
    if (!invalid) emit('close', Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v).trim()])))
}

const copy = async () => {
    try {
        await navigator.clipboard.writeText(props.config.copy.value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    } catch { /* clipboard blocked: the value is visible to copy by hand */ }
}
const inputClass = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-5 focus:outline-none focus:ring-2 focus:ring-purple-5/20'
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        @mousedown.self="emit('close', null)" @keydown.esc="emit('close', null)">
        <form ref="panel" role="dialog" aria-modal="true" aria-labelledby="form-dialog-title"
            class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" novalidate @submit.prevent="submit">
            <h2 id="form-dialog-title" class="text-lg font-semibold text-gray-900">{{ config.title }}</h2>
            <p v-if="config.message" class="mt-2 whitespace-pre-line text-sm text-gray-600">{{ config.message }}</p>

            <div v-if="config.copy" class="mt-4">
                <p class="mb-1 text-sm font-medium text-gray-700">{{ config.copy.label }}</p>
                <div class="flex items-center gap-2">
                    <code class="min-w-0 flex-1 select-all break-all rounded-lg bg-gray-100 px-3 py-2 font-mono text-base text-gray-900">{{ config.copy.value }}</code>
                    <button type="button" class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50" @click="copy">
                        <Icon :icon="copied ? 'mdi:check' : 'mdi:content-copy'" class="h-4 w-4" />{{ copied ? 'Copied' : 'Copy' }}
                    </button>
                </div>
            </div>

            <div v-for="f in config.fields" :key="f.key" class="mt-4">
                <label :for="`dlg-${f.key}`" class="mb-1 block text-sm font-medium text-gray-700">{{ f.label }}</label>
                <textarea v-if="f.type === 'textarea'" :id="`dlg-${f.key}`" v-model="values[f.key]" rows="3"
                    :placeholder="f.placeholder" :class="inputClass"></textarea>
                <input v-else :id="`dlg-${f.key}`" v-model="values[f.key]" :type="f.type ?? 'text'"
                    :placeholder="f.placeholder" :class="inputClass" autocomplete="off" />
                <p v-if="errors[f.key]" class="mt-1 text-xs text-red-700">{{ errors[f.key] }}</p>
                <p v-else-if="f.help" class="mt-1 text-xs text-gray-500">{{ f.help }}</p>
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-end gap-2">
                <a v-for="l in config.links" :key="l.href" :href="l.href" target="_blank" rel="noopener"
                    class="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-purple-5 hover:underline">
                    <Icon v-if="l.icon" :icon="l.icon" class="h-4 w-4" />{{ l.label }}
                </a>
                <button v-if="config.cancelLabel !== null" type="button"
                    class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" @click="emit('close', null)">
                    {{ config.cancelLabel ?? 'Cancel' }}
                </button>
                <button type="submit" data-confirm
                    :class="['rounded-lg px-4 py-2 text-sm font-semibold text-white', config.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-darkPurple hover:bg-[#4A1A78]']">
                    {{ config.confirmLabel ?? 'OK' }}
                </button>
            </div>
        </form>
    </div>
</template>
