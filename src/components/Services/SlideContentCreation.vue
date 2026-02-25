<script setup>
import img1 from '../../assets/Images/Services/Content Creation/1.png'
import img2 from '../../assets/Images/Services/Content Creation/2.png'
import img3 from '../../assets/Images/Services/Content Creation/3.png'

const imgs = [img1, img2, img3]
</script>

<template>
  <div class="h-full w-full grid grid-cols-3
           gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-6
           justify-items-center px-2 sm:px-4 md:px-6 items-center ">
    <div v-for="(src, i) in imgs" :key="i">
        <img
          :src="src"
          alt=""
          class="w-full h-[clamp(100px,32vh,220px)] md:h-[clamp(280px,54vh,560px)] lg:h-[clamp(340px,56vh,620px)] object-contain rounded-lg"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
</template>
