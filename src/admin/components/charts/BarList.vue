<script setup>
import { computed } from 'vue'

// Ranked horizontal bars: label + exact value + a thin single-hue bar.
// Values are always printed, so nothing depends on hovering.
const props = defineProps({
    rows: { type: Array, required: true }, // [{ key?, label, value, display, sub? }]
    max: { type: Number, default: 0 },    // scale bars to this instead of the largest row (e.g. a total)
    empty: { type: String, default: 'No data for this period yet.' },
})

const scale = computed(() => props.max || Math.max(0, ...props.rows.map((r) => r.value)) || 1)
const width = (value) => `${Math.max(value > 0 ? 1.5 : 0, (value / scale.value) * 100)}%`
</script>

<template>
    <p v-if="!rows.length" class="py-6 text-center text-sm text-gray-500">{{ empty }}</p>
    <ul v-else class="space-y-3">
        <li v-for="row in rows" :key="row.key ?? row.label">
            <div class="flex items-baseline justify-between gap-4 text-sm">
                <span class="min-w-0 truncate text-gray-800" :title="row.label">{{ row.label }}</span>
                <span class="shrink-0 tabular-nums text-gray-900">
                    <span class="font-semibold">{{ row.display }}</span>
                    <span v-if="row.sub" class="ml-1.5 text-xs text-gray-500">{{ row.sub }}</span>
                </span>
            </div>
            <div class="mt-1.5 h-1.5" aria-hidden="true">
                <div class="h-full rounded-r bg-purple-5" :style="{ width: width(row.value) }"></div>
            </div>
        </li>
    </ul>
</template>
