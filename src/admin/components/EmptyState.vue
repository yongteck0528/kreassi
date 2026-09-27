<script setup>
import { Icon } from '@iconify/vue'

defineProps({
    icon: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, default: '' },
})
</script>

<template>
    <div class="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-5/10 text-purple-5">
            <Icon :icon="icon" class="h-6 w-6" />
        </div>
        <h2 class="mt-4 text-base font-semibold text-gray-900">{{ title }}</h2>
        <p v-if="text" class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ text }}</p>
        <div class="mt-5"><slot /></div>
    </div>
</template>
