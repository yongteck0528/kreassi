<template>
    <section
        class="w-full mx-auto px-6 py-8 lg:p-16 grid gap-4 md:grid-cols-10 lg:grid-cols-10 items-center bg-var-8 bg-full">
        <!-- Left text -->
        <div class="text-center leading-tight px-8 pb-5 md:pb-0 md:col-span-4 lg:text-left md:text-left lg:pb-4">
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-normal">
                {{ t('partners.titleLine1') }}
            </h1>
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-normal uppercase">
                {{ t('partners.titleLine2Prefix') }} <span class="font-bold">{{ t('partners.titleLine2Highlight') }}</span>
            </h1>
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-bold">
                {{ t('partners.titleLine3') }}
            </h1>
            <h1 class="font-uppercase-title mb-0 text-2xl sm:text-3xl md:text-5xl text-[#371055] font-bold">
                {{ t('partners.titleLine4') }}
            </h1>
        </div>

        <!-- Right logos grid -->
        <div class="w-full md:col-span-6">
            <div class="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 items-start"
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// case-sensitive and relative to this file:
const files = import.meta.glob('../assets/Logos/*.png', { eager: true, as: 'url' })

// Manual order by logo base filename (without extension).
// Unlisted logos are appended in alphabetical order.
const preferredOrder = [
    'Qubu Resort',
    'Asiang',
    'Abyss',
    'Elements Refloxology',
    'Local Kitchen',
    'Fi_enti',
    'Putra Borneo Pontianak ',
    'Pesona Pack',
    'Hotel Q',
    'Ayam Senang',
    'UP 2 U Food & Life Junction',
    'Buzz Cafe',
    'Bells',
    'Ada Jahit',
    'Nasi Goreng Bistik Parama',
    'Bumboe RiceBox',
    'Bakso Cuanki Kang Gelo',
    'Bubur Ayam Rinjani',
    'Sosmed Cafe',
    'Ayam Bebek Pak Boss',
    'JAM',
    'BARA RAMEN',
    'Glow Billiard',
    'Maison By Model',
    'Incredibowl',
    'RND Motor',
    'UdaOlshop',
    'Kreasi Motor',
    '2 Points Coffee',
    'Xiang Wei',
    'JMJ',
    'Kopling Go',
    'Warung Kopi Sumber Segar',
    'TechLab',
    'Max Outlet',
    'Kopi Gaol',
    'Koto Curry House',
    'Otopia Coating & Detailing',
    'CV Buanna Energi Lokastara',
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
