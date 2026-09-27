<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { seoChecks } from '../../lib/seo'

const props = defineProps({
    post: { type: Object, required: true },
    stats: { type: Object, required: true },
})

const checks = computed(() => seoChecks(props.post, props.stats))
const applicable = computed(() => checks.value.filter((c) => c.ok !== null))
const passed = computed(() => applicable.value.filter((c) => c.ok).length)
</script>

<template>
    <section aria-labelledby="seo-title">
        <div class="flex items-baseline justify-between">
            <h3 id="seo-title" class="text-sm font-semibold text-gray-900">SEO checklist</h3>
            <span class="text-xs text-gray-500"><span class="font-semibold text-gray-900">{{ passed }}</span> of {{ applicable.length }} done</span>
        </div>
        <ul class="mt-3 space-y-2.5">
            <li v-for="c in checks" :key="c.id" class="flex gap-2 text-sm">
                <Icon v-if="c.ok === true" icon="mdi:check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-[#0a7d0a]" aria-label="Done" />
                <Icon v-else-if="c.ok === false" icon="mdi:alert-circle-outline" class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-label="To do" />
                <Icon v-else icon="mdi:circle-outline" class="mt-0.5 h-4 w-4 shrink-0 text-gray-300" aria-label="Optional" />
                <span class="min-w-0">
                    <span :class="c.ok === true ? 'text-gray-600' : 'text-gray-900'">{{ c.label }}</span>
                    <span v-if="c.ok !== true" class="block text-xs text-gray-500">{{ c.hint }}</span>
                </span>
            </li>
        </ul>
    </section>
</template>
