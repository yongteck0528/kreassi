<script setup>
import { sortedImageUrls } from '../../utils/assets'

const imgs = sortedImageUrls(import.meta.glob(
    '../../assets/Images/Services/Social Media Management/*.png',
    { eager: true, query: '?url', import: 'default' }
))
</script>

<template>
    <div class="h-full w-full grid grid-cols-4
                gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-4 md:gap-y-5
                justify-items-center px-2 sm:px-3 md:px-4 items-center">
        <div v-for="(src, i) in imgs" :key="i">
            <img
                :src="src"
                alt="Social media management portfolio example"
                class="w-full h-[clamp(110px,30vh,220px)] md:h-[clamp(260px,48vh,480px)] lg:h-[clamp(300px,52vh,560px)] object-contain"
                loading="lazy"
                decoding="async"
            />
        </div>
    </div>
</template>
