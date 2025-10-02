<script setup>
const DIR = '../../assets/Images/Services/Logo Design'
const imgs = [1, 2, 3].map(n => new URL(`${DIR}/${n}.png`, import.meta.url).href)

</script>

<template>
    <div class="h-full grid grid-cols-3 gap-2 place-items-center px-8">
        <img v-for="(src, i) in imgs" :key="i" :src="src" alt=""
            class="max-h-full max-w-full object-contain pointer-events-none select-none lg:scale-75"
            loading="lazy" decoding="async" />
    </div>
</template>
