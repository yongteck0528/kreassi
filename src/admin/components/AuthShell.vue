<script setup>
import logo from '../../assets/Logos/Kreassi/Original Kreassi Logo.png'

defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
})
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-darkPurple via-[#4A1A78] to-[#1E0A33]">
        <div class="w-full max-w-sm">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <img :src="logo" alt="Kreassi" class="h-9 w-auto mb-6" />
                <h1 class="text-xl font-bold text-darkPurple">{{ title }}</h1>
                <p v-if="subtitle" class="mt-1 text-sm text-gray-500 break-words">{{ subtitle }}</p>
                <div class="mt-6">
                    <slot />
                </div>
            </div>
            <p class="mt-6 text-center text-xs text-white/60">Kreassi Team · Admin</p>
        </div>
    </div>
</template>
