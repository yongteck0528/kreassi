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
  <div class="grid grid-cols-1 md:grid-cols-8 lg:gap-0 gap-4 px-4 md:px-10 lg:px-20 mt-5">
    <!-- Left side (only visible on md and above) -->
    <div class="hidden md:flex md:col-span-3 flex-col">
      <img :src="imgs[10]" alt="Image 12" class="object-contain w-full h-24 lg:h-32" />
      <img :src="imgs[11]" alt="Image 13" class="object-contain w-full h-24 lg:h-32" />
      <img :src="imgs[12]" alt="Image 14" class="object-contain w-full h-24 lg:h-32" />
    </div>

    <!-- Right side -->
    <div class="col-span-5 grid grid-cols-5 gap-3">
      <img v-for="(img, i) in imgs.slice(0, 10)" :key="i" :src="img" :alt="`Image ${i + 1}`"
        class="object-contain w-full lg:h-full h-full" />
    </div>
  </div>
</template>
