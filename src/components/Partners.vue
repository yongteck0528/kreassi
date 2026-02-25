<template>
    <section class="w-full mx-auto px-6 py-8 lg:p-16 grid gap-4 md:grid-cols-10 lg:grid-cols-10 items-center bg-var-8 bg-full">
        <!-- Left text -->
        <div class="text-center leading-tight px-8 pb-5 md:pb-0 md:col-span-4 lg:text-left md:text-left lg:pb-4">
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
            <div class="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2 items-start"
                style="min-height: 250px; content-visibility:auto; contain-intrinsic-size: 250px;">
                <div v-for="(logo, i) in logos" :key="logo.url + i"
                    class="flex items-center justify-center p-2 select-none bg-transparent"
                    style="aspect-ratio: 3 / 1;">
                    <img :src="logo.url" :alt="logo.alt" width="180" height="60"
                        class="max-w-full max-h-[80px] object-contain pointer-events-none mix-blend-multiply"
                        loading="lazy" decoding="async" fetchpriority="low" draggable="false" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// case-sensitive and relative to this file:
const files = import.meta.glob('../assets/Logos/*.png', { eager: true, as: 'url' })

// Manual order by logo base filename (without extension).
// Unlisted logos are appended in alphabetical order.
const preferredOrder = [
    '2 Points Coffee', 
    'Ada Jahit', 
    'Ayam Bebek Pak Boss', 
    'Ayam Senang', 
    'Bakso Cuanki Kang Gelo', 
    'BARA RAMEN', 
    'Bells', 
    'Bubur Ayam Rinjani', 
    'Bumboe RiceBox', 
    'Buzz Cafe', 
    'CV Buanna Energi Lokastara', 
    'Elements Reflexology', 
    'Glow Billiard', 
    'Hotel Q', 
    'Incredibowl', 
    'JAM', 
    'JMJ', 
    'Koto Curry House', 
    'Kreasi Motor', 
    'Maison By Model', 
    'Nasi Goreng Bistik Parama', 
    'Natrindo USrya Prima', 
    'Otopia Coating & Detailing', 
    'Pesona Pack', 
    'Qubu Resort', 
    'RND Motor', 
    'Sosmed Cafe', 
    'TechLab', 
    'UdaOlshop', 
    'UP 2 U Food & Life Junction', 
    'Xiang Wei'
]

const normalize = (value) => value.trim().replace(/\s+/g, ' ')
const collator = new Intl.Collator('en', { sensitivity: 'base' })
const orderRank = new Map(preferredOrder.map((name, index) => [normalize(name), index]))

const logos = Object.entries(files)
    .map(([path, url]) => {
        const filename = (path.split('/').pop() || '').trim()
        const base = normalize(filename.replace(/\.[^.]+$/, ''))
        const alt = base.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        return { url, alt, sortKey: base }
    })
    .sort((a, b) => {
        const aRank = orderRank.get(a.sortKey)
        const bRank = orderRank.get(b.sortKey)
        const aHasRank = aRank !== undefined
        const bHasRank = bRank !== undefined

        if (aHasRank && bHasRank) return aRank - bRank
        if (aHasRank) return -1
        if (bHasRank) return 1
        return collator.compare(a.sortKey, b.sortKey)
    })
</script>
