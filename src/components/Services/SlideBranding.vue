<script setup>
const DIR = '../../assets/Images/Services/Branding';
import img1 from '../../assets/Images/Services/Branding/1.png'
import img2 from '../../assets/Images/Services/Branding/2.png'
import img3 from '../../assets/Images/Services/Branding/3.png'
</script>

<template>
    <div class="flex items-center justify-center mt-2">
        <div class="grid grid-cols-2 gap-4 md:gap-2 w-full p-4 sm:p-6 max-w-md sm:max-w-lg md:max-w-2xl">
            <!-- Left Column -->
            <div class="flex flex-col gap-4">
                <img :src="img1" alt="Image 1" class="rounded-lg object-cover w-full h-full md:h-40 sm:h-32" />
                <img :src="img2" alt="Image 2" class="rounded-lg object-cover w-full h-full md:h-40 sm:h-32" />
            </div>

            <!-- Right Column -->
            <img :src="img3" alt="Image 3" class="rounded-lg object-cover w-full h-full" />
        </div>
    </div>
</template>

<style scoped></style>
