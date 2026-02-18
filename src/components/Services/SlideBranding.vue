<script setup>
import img1 from '../../assets/Images/Services/Branding/1.png'
import img2 from '../../assets/Images/Services/Branding/2.png'
import img3 from '../../assets/Images/Services/Branding/3.png'
</script>

<template>
    <div class="h-full w-full min-h-0 overflow-hidden px-3 sm:px-4 md:px-6 pt-6 md:pt-8">
        <div class="mx-auto h-full max-w-[min(92vw,44rem)] min-h-0 grid grid-cols-2 grid-rows-2 gap-0 scale-75 origin-top">
            <div class="relative min-h-0">
                <img :src="img1" alt="Image 1" class="absolute inset-0 h-full w-full rounded-lg object-cover" />
            </div>

            <div class="relative row-span-2 min-h-0">
                <img :src="img3" alt="Image 3" class="absolute inset-0 h-full w-full rounded-lg object-cover" />
            </div>

            <div class="relative min-h-0">
                <img :src="img2" alt="Image 2" class="absolute inset-0 h-full w-full rounded-lg object-cover" />
            </div>
        </div>
    </div>
</template>
