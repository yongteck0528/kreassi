<script setup>
import img1 from '../../assets/Images/Services/Website Design/1.png'
import img2 from '../../assets/Images/Services/Website Design/2.png'
import img3 from '../../assets/Images/Services/Website Design/3.png'

</script>

<template>
  <section class="h-full w-full min-h-0 overflow-hidden px-3 md:px-6 lg:px-8 py-2 md:py-4" style="--panel-h: min(100%, clamp(360px, 60vh, 720px));">
    <div class="h-full max-w-7xl mx-auto min-h-0">

      <!-- Mobile: show only img3 -->
      <div class="block md:hidden h-full min-h-0">
        <img :src="img3" alt="Website full preview" class="block h-full max-h-full w-auto max-w-full mx-auto object-contain rounded-lg" loading="lazy"
          decoding="async" />
      </div>

      <!-- Tablet & up: show thumbnails + full preview -->
      <div class="hidden md:grid h-full min-h-0 gap-3 md:grid-cols-[3fr_7fr] scale-95 lg:scale-100">

        <!-- Thumbnails -->
        <div class="flex flex-col gap-4 items-center justify-center md:h-[var(--panel-h)] min-h-0">
          <img :src="img1" alt="Website thumbnail 1" class="rounded-lg object-contain max-h-[44%]" loading="lazy" decoding="async" />
          <img :src="img2" alt="Website thumbnail 2" class="rounded-lg object-contain max-h-[44%]" loading="lazy" decoding="async" />
        </div>

        <!-- Full Preview -->
        <div class="grid place-items-center p-2 md:h-[var(--panel-h)] min-h-0 overflow-hidden rounded-lg">
          <img :src="img3" alt="Website full preview" class="rounded-lg object-contain max-h-full max-w-full" loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  </section>
</template>
