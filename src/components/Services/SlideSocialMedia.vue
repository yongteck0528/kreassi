<script setup>
const files = import.meta.glob(
    '../../assets/Images/Services/Social Media Management/*.png',
    { eager: true, as: 'url' }
)

const imgs = Object.entries(files)
    .sort((a, b) => Number(a[0].match(/(\d+)\.png$/)[1]) - Number(b[0].match(/(\d+)\.png$/)[1]))
    .map(([_, url]) => url)

const visibleClass = (i) => {
    if (i === 2) return 'hidden lg:block'   // #3: desktop only
    if (i === 1) return 'hidden md:block'   // #2: tablet+ only
    return ''                               // #1 and #4: always
}

const itemClass = 'relative h-full min-h-0 flex items-end justify-center overflow-visible'
const imageClass = [
    'pointer-events-none select-none object-contain object-bottom',
    'h-[86%] md:h-[90%] lg:h-[94%]',
    'w-[120%] md:w-[118%] lg:w-[115%] max-w-none',
    // Push the image slightly below the visible canvas so hands feel anchored.
    'translate-y-[7%] md:translate-y-[9%] lg:translate-y-[11%]',
].join(' ')
</script>

<template>
    <div class="h-full w-full px-2 md:px-4 lg:px-6 overflow-hidden">
        <div class="h-full w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 md:gap-2 lg:gap-4 items-end">
            <div v-for="(src, i) in imgs" :key="i" :class="[itemClass, visibleClass(i)]">
                <img :src="src" alt="" :class="imageClass" loading="lazy" decoding="async" />
            </div>
        </div>
    </div>
</template>
