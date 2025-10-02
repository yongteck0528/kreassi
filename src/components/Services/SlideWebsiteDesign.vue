<script setup>
const DIR = '../../assets/Images/Services/Website Design';
const img1 = new URL(`${DIR}/1.png`, import.meta.url).href;
const img2 = new URL(`${DIR}/2.png`, import.meta.url).href;
const img3 = new URL(`${DIR}/3.png`, import.meta.url).href;
</script>

<template>
  <div class="w-full px-[16px] md:px-[24px] lg:px-[32px] py-[16px]" style="--panel-h: clamp(360px, 60vh, 720px);">
    <div class="max-w-7xl mx-auto grid grid-cols-1 gap-3 md:grid-cols-[3fr_7fr] md:gap-3">
      <!-- Left Section: Thumbnails (1.png and 2.png) - Horizontal on mobile, vertical on larger screens -->
      <div class="md:h-[var(--panel-h)] min-h-0 min-w-0 flex flex-row md:flex-col gap-3 items-center justify-center">
        <!-- First Thumbnail Panel -->
        <div
          class="flex-1 min-h-0 min-w-0 overflow-hidden grid place-items-center md:place-items-end p-[8px] rounded-[10px]">
          <img :src="img1" alt="Website thumbnail 1"
            class="thumbnail-img block object-contain max-h-full max-w-full [transform-origin:center]" loading="lazy"
            decoding="async" />
        </div>
        <!-- Second Thumbnail Panel -->
        <div
          class="flex-1 min-h-0 min-w-0 overflow-hidden grid place-items-center md:place-items-start p-[8px] rounded-[10px]">
          <img :src="img2" alt="Website thumbnail 2"
            class="thumbnail-img block object-contain max-h-full max-w-full [transform-origin:center]" loading="lazy"
            decoding="async" />
        </div>
      </div>

      <!-- Right Section: Full image (3.png) - Full width on mobile, matches height on larger screens -->
      <div class="md:h-[var(--panel-h)] min-h-0 min-w-0 overflow-hidden grid place-items-center p-[8px] rounded-[10px]">
        <img :src="img3" alt="Website full preview" class="block object-contain max-h-full max-w-full" loading="lazy"
          decoding="async" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.thumbnail-img {
  scale: 1.06;
}

@media (max-width: 767.98px) {
  .thumbnail-img {
    scale: 1.03;
  }
}
</style>