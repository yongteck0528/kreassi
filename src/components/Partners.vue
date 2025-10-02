<template>
    <section class="max-w-screen-xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-10 lg:grid-cols-10 items-center">
        <!-- Left text -->
        <div class="text-center leading-tight px-8 md:col-span-4 lg:text-left md:text-left">
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-normal">WORKING
            </h1>
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-normal">
                WITH THE <span class="font-bold">BEST</span>
            </h1>
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-bold">CLIENTS AND
            </h1>
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-bold">PARTNERS
            </h1>
        </div>

        <!-- Right logos grid -->
        <div class="w-full md:col-span-6">
            <div class="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-4 items-start"
                style="min-height: 250px; content-visibility:auto; contain-intrinsic-size: 250px;">
                <div v-for="(logo, i) in logos" :key="logo.url + i"
                    class="flex items-center justify-center p-2 select-none bg-transparent"
                    style="aspect-ratio: 3 / 1;">
                    <img :src="logo.url" :alt="logo.alt" width="180" height="60"
                        class="max-w-full max-h-[60px] object-contain pointer-events-none mix-blend-multiply"
                        loading="lazy" decoding="async" fetchpriority="low" draggable="false" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// case-sensitive and relative to this file:
const files = import.meta.glob('../assets/Logos/*.png', { eager: true, as: 'url' })

const logos = Object.entries(files)
    .map(([path, url]) => {
        const filename = (path.split('/').pop() || '').trim()
        const base = filename.replace(/\.[^.]+$/, '').trim()
        const alt = base.replace(/\s+/g, ' ').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        return { url, alt }
    })
    .sort((a, b) => a.alt.localeCompare(b.alt))
</script>
