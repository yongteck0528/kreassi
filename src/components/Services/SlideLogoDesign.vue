<script setup>
import img1 from '../../assets/Images/Services/Logo Design/1.png'
import img2 from '../../assets/Images/Services/Logo Design/2.png'
import img3 from '../../assets/Images/Services/Logo Design/3.png'

const imgs = [img1, img2, img3]

</script>

<template>
    <div class="h-full grid grid-cols-3 gap-2 place-items-center px-8">
        <img v-for="(src, i) in imgs" :key="i" :src="src" alt=""
            class="max-h-full max-w-full object-contain pointer-events-none select-none lg:scale-75"
            loading="lazy" decoding="async" />
    </div>
</template>
