<script setup>
const DIR = '../../assets/Images/Services/Website Design';
const img1 = new URL(`${DIR}/1.png`, import.meta.url).href;
const img2 = new URL(`${DIR}/2.png`, import.meta.url).href;
const img3 = new URL(`${DIR}/3.png`, import.meta.url).href;
</script>

<template>
  <section class="w-full px-4 md:px-6 lg:px-8 py-4" style="--panel-h: clamp(360px, 60vh, 720px);">
    <div class="max-w-7xl mx-auto">

      <!-- Mobile: show only img3 -->
      <div class="block md:hidden">
        <img :src="img3" alt="Website full preview" class="block w-full object-contain rounded-lg" loading="lazy"
          decoding="async" />
      </div>

      <!-- Tablet & up: show thumbnails + full preview -->
      <div class="hidden md:grid gap-3 md:grid-cols-[3fr_7fr] scale-95 lg:scale-100">

        <!-- Thumbnails -->
        <div class="flex flex-col gap-4 items-center justify-center md:h-[var(--panel-h)]">
          <img :src="img1" alt="Website thumbnail 1" class="rounded-lg" loading="lazy" decoding="async" />
          <img :src="img2" alt="Website thumbnail 2" class="rounded-lg" loading="lazy" decoding="async" />
        </div>

        <!-- Full Preview -->
        <div class="grid place-items-center p-2 md:h-[var(--panel-h)] overflow-hidden rounded-lg">
          <img :src="img3" alt="Website full preview" class="rounded-lg" loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
