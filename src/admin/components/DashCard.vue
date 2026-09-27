<script setup>
defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
})
</script>

<template>
    <section class="rounded-2xl border border-gray-200 bg-white p-5">
        <header class="mb-4">
            <h2 class="text-sm font-semibold text-gray-900">{{ title }}</h2>
            <p v-if="subtitle" class="mt-0.5 text-xs text-gray-500">{{ subtitle }}</p>
        </header>
        <slot />
    </section>
</template>
