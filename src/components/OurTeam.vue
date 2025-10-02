<template>
    <!-- OUTER WRAPPER (lets the paper hang across the boundary) -->
    <section class="relative overflow-x-clip overflow-y-visible">

        <!-- UPPER: Purple bg + content -->
        <div class="relative bg-cover bg-center bg-var-3">
            <!-- top padding for headings -->
            <div class="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20 pt-12 sm:pt-12 lg:pt-20 text-center">
                <h2 class="text-white font-bold tracking-wide text-3xl sm:text-4xl lg:text-5xl">OUR TEAM</h2>
                <p class="text-white/90 mt-2 uppercase tracking-widest text-sm sm:text-base lg:text-lg">
                    A TEAM THAT FEELS LIKE YOURS
                </p>
                <p class="text-white/90 mt-4 max-w-2xl mx-auto text-xs sm:text-sm lg:text-base leading-relaxed">
                    Behind Kreassi Team is a group of passionate creatives — designers, editors, strategists, and
                    marketers — who thrive on teamwork, trends, and turning visions into visuals.
                </p>
            </div>

            <!-- big team photo -->
            <div class="mt-6 sm:mt-8 lg:mt-10">
                <img :src="teamImg" alt="Kreassi Team group" class="block mx-auto w-full h-auto max-w-[min(96vw,1366px)]
                 drop-shadow-[0_30px_60px_rgba(0,0,0,.35)]" loading="lazy" decoding="async" />
            </div>

            <!-- reserve space so the paper (50% down) doesn't collide with the photo -->
            <div class="pb-16 sm:pb-20 lg:pb-24"></div>

            <figure class="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0
         translate-y-[calc(50%-1.75rem)]
         sm:translate-y-[calc(50%-1.5rem)]
         md:translate-y-[calc(50%-2rem)]
         lg:translate-y-[calc(50%-2.5rem)]
         xl:translate-y-[calc(50%-3.75rem)]
         w-[120vw] max-w-none z-30 select-none">
                <div class="absolute inset-x-0 bottom-0 h-[55%] bg-white -z-10"></div>
                <img :src="paperBg" alt="" class="block w-full h-auto" />
                <figcaption class="absolute inset-0 flex items-center justify-center px-4">
                    <p class="font-bold text-darkPurple text-center leading-tight
              text-[15px] sm:text-[18px] md:text-[28px] lg:text-[34px] xl:text-[38px]">
                        “We don’t just work for you — we work with you.”
                    </p>
                </figcaption>
            </figure>

        </div>

        <!-- LOWER: pure white background (no content) -->
        <div class="bg-white">
            <!-- give top padding equal to ~half the paper’s height so it doesn’t overlap future content -->
            <div class="pt-16 sm:pt-20 lg:pt-24"></div>
            <!-- optional: a small spacer so the white section is visible even without next content -->
            <!-- <div class="h-8 sm:h-10 lg:h-12"></div> -->
        </div>

    </section>
</template>

<script setup>
const teamImg = new URL('../assets/Images/AboutUs/ourteam.png', import.meta.url).href
const paperBg = new URL('../assets/Backgrounds/paperbg.png', import.meta.url).href
</script>
