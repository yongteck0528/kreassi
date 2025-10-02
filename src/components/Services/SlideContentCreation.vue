<script setup>
import img1 from '../../assets/Images/Services/Content Creation/1.png'
import img2 from '../../assets/Images/Services/Content Creation/2.png'
import img3 from '../../assets/Images/Services/Content Creation/3.png'

const imgs = [img1, img2, img3]

const visibleClass = (i) => {
  if (i === 2) return 'hidden lg:block'   // #3: desktop only
  if (i === 1) return 'hidden md:block'   // #2: tablet+ only
  return ''                               // #1: always
}
</script>

<template>
    <!-- 1 col mobile, 2 cols tablet, 3 cols desktop -->
    <div class="w-full pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
           gap-2 sm:gap-3 md:gap-4
           px-2 sm:px-3 md:px-6 lg:px-20
           items-start justify-items-center">
        <div v-for="(src, i) in imgs" :key="i" class="w-full" :class="visibleClass(i)">
            <!-- Mobile: gently limit height & width so the solo image fits the space -->
            <div class="flex items-center justify-center
               h-[clamp(140px,32vh,220px)]    <!-- mobile cap -->
               sm:h-[clamp(160px,34vh,240px)]
               md:h-auto">
                <img :src="src" alt="" class="object-contain
                 max-h-full
                 max-w-[clamp(180px,72vw,340px)]   <!-- keep width in check on mobile -->
                 sm:max-w-[clamp(220px,70vw,380px)]
                 md:max-w-full" loading="lazy" decoding="async" />
            </div>
        </div>
    </div>
</template>
