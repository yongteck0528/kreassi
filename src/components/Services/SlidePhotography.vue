<script setup>
const DIR = '../../assets/Images/Services/Photography'
const img1 = new URL(`${DIR}/1.png`, import.meta.url).href
</script>

<template>
  <div class="h-full place-items-center">
    <img :src="img1" alt="" class="block object-contain max-h-full max-w-full" loading="lazy"
      decoding="async" />
  </div>
</template>
