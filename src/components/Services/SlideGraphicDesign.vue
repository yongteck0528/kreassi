<script setup>
const modules = import.meta.glob('../../assets/Images/Services/Graphic Design/*.png', { eager: true })

// Extract just the URLs and sort them by filename
const imgs = Object.keys(modules)
  .sort((a, b) => {
    // extract the numbers (1,2,3,...) to keep correct order
    const numA = parseInt(a.match(/(\d+)\.png$/)[1])
    const numB = parseInt(b.match(/(\d+)\.png$/)[1])
    return numA - numB
  })
  .map((key) => modules[key].default)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-8 gap-2 sm:gap-3 px-3 sm:px-4 md:px-10 lg:px-20 mt-4">
    <!-- Left side (desktop only) -->
    <div class="hidden lg:flex lg:col-span-3 lg:flex-col lg:gap-3">
      <img :src="imgs[10]" alt="Image 12" class="object-contain w-full h-24 lg:h-32" />
      <img :src="imgs[11]" alt="Image 13" class="object-contain w-full h-24 lg:h-32" />
      <img :src="imgs[12]" alt="Image 14" class="object-contain w-full h-24 lg:h-32" />
    </div>

    <!-- Right side -->
    <div class="col-span-1 lg:col-span-5 grid grid-cols-5 gap-1.5 sm:gap-2">
      <img v-for="(img, i) in imgs.slice(0, 10)" :key="i" :src="img" :alt="`Image ${i + 1}`"
        class="object-contain w-full h-[clamp(64px,13vh,120px)] sm:h-[clamp(82px,16vh,160px)] md:h-[clamp(140px,22vh,220px)] lg:h-full" />
    </div>
  </div>
</template>
