<script setup>
import { computed } from 'vue'

// KPI tile: label · value · change vs the previous period. Clicking it picks
// the metric shown in the trend chart (aria-pressed marks the current one).
const props = defineProps({
    label: { type: String, required: true },
    value: { type: String, required: true },
    delta: { type: Object, default: null }, // { text, direction: 'up' | 'down' | 'flat' | 'new' }
    hint: { type: String, default: '' },
    active: { type: Boolean, default: false },
})
defineEmits(['select'])

// Every metric here is "more is better": up = good (green), down = red.
// Direction is also spelled out with an arrow, never colour alone.
const deltaClass = computed(() => ({
    up: 'text-[#006300]',
    down: 'text-[#b42318]',
    flat: 'text-gray-500',
    new: 'text-gray-500',
})[props.delta?.direction ?? 'flat'])
const arrow = computed(() => ({ up: '▲', down: '▼' })[props.delta?.direction] ?? '')
</script>

<template>
    <button type="button" :aria-pressed="active" :title="hint"
        :class="['w-full rounded-2xl border bg-white p-4 text-left transition-colors sm:p-5',
            active ? 'border-purple-5 ring-2 ring-purple-5/15' : 'border-gray-200 hover:border-gray-300']"
        @click="$emit('select')">
        <span class="flex items-center gap-2 text-sm text-gray-500">
            <span :class="['h-2 w-2 rounded-full', active ? 'bg-purple-5' : 'bg-gray-300']" aria-hidden="true"></span>
            {{ label }}
        </span>
        <span class="mt-2 block text-2xl font-semibold text-gray-900 sm:text-3xl">{{ value }}</span>
        <span v-if="delta" :class="['mt-1 block text-xs font-medium', deltaClass]">
            <span v-if="arrow" aria-hidden="true">{{ arrow }} </span>{{ delta.text }}
            <span class="font-normal text-gray-500">vs previous period</span>
        </span>
    </button>
</template>
