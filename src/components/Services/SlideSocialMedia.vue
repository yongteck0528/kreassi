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
</script>

<template>
    <!-- 2 cols mobile, 3 cols tablet, 4 cols desktop; align to bottom -->
    <div class="h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 place-items-end">
        <img v-for="(src, i) in imgs" :key="i" :src="src" alt=""
            class="max-h-full max-w-full object-contain pointer-events-none select-none" :class="visibleClass(i)"
            loading="lazy" decoding="async" />
    </div>
</template>
