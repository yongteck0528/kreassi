<script setup>
const props = defineProps({
    title: String,
    subtitle: String
})
</script>

<template>
    <section class="h-full w-full flex flex-col">
        <!-- Header -->
        <header class="px-4 sm:px-6 md:px-8 text-center">
            <h2 class="text-white font-bold leading-tight text-2xl sm:text-3xl md:text-5xl">
                {{ props.title }}
            </h2>
            <p v-if="props.subtitle" class="mt-1.5 text-white/85 text-sm sm:text-base md:text-lg">
                {{ props.subtitle }}
            </p>
        </header>

        <!-- Content area fills remaining height -->
        <div class="flex-1 min-h-0">
            <div class="h-full w-full overflow-hidden">
                <slot />
            </div>
        </div>
    </section>
</template>
