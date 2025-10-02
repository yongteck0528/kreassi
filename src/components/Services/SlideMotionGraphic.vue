<script setup>
// same source as you had
const DIR = '../../assets/Images/Services/Motion Graphic'
const videos = [1, 2, 3].map(n => new URL(`${DIR}/${n}.mp4`, import.meta.url).href)
</script>

<template>
  <div class="h-full w-full grid grid-cols-3
           gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-6
           justify-items-center px-2 sm:px-4 md:px-6 items-center">
    <div v-for="(src, i) in videos" :key="i" class="w-fit h-fit shrink-0 group">
      <!-- scale down ONLY on mobile -->
      <div class="overflow-visible transform-gpu scale-[0.5] sm:scale-100">
        <!-- Fancy frame (unchanged) -->
        <div class="relative rounded-[30px] p-[2px]
                 bg-[conic-gradient(from_140deg_at_30%_10%,#ffffff_0%,#C7B8FF_12%,#7C3DB0_30%,#B76EFA_55%,#DBD6FF_75%,#ffffff_100%)]
                 shadow-[0_18px_35px_-10px_rgba(0,0,0,.45),0_8px_18px_-8px_rgba(0,0,0,.3)]
                 transition-transform duration-300 will-change-transform
                 md:group-hover:scale-[1.015]">
          <!-- satin rim -->
          <div class="rounded-[28px] bg-neutral-900/90 p-[6px]">
            <!-- glass + display -->
            <div class="relative rounded-[24px] overflow-hidden bg-black ring-1 ring-white/5">
              <!-- notch -->
              <div class="absolute top-0 left-1/2 -translate-x-1/2
                       h-5 sm:h-6 w-20 sm:w-24 bg-black rounded-b-2xl z-20
                       shadow-[inset_0_-6px_10px_-6px_rgba(255,255,255,.2)]">
                <div
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-neutral-800 shadow-inner">
                </div>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 h-1 w-10 rounded-full bg-neutral-700/80"></div>
              </div>

              <!-- subtle glass glare -->
              <div class="pointer-events-none absolute inset-0 z-10
                       bg-[linear-gradient(115deg,rgba(255,255,255,.12)_0%,rgba(255,255,255,0)_35%)]
                       mix-blend-screen"></div>

              <!-- display (9:16) -->
              <div class="p-1 sm:p-1.5">
                <div class="aspect-[9/16]
                         h-[clamp(150px,35svh,240px)]
                         md:h-[clamp(170px,38svh,260px)]
                         lg:h-[clamp(190px,40svh,280px)]
                         rounded-[18px] overflow-hidden">
                  <video :src="src" class="h-full w-full object-cover" playsinline autoplay muted loop
                    preload="metadata">
                    <source :src="src" type="video/mp4" />
                  </video>
                </div>
              </div>

              <!-- bottom reflection -->
              <div class="pointer-events-none absolute bottom-0 inset-x-0 h-10
                       bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.06)_80%,rgba(255,255,255,0)_100%)]
                       opacity-80"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- soft floor shadow -->
      <div class="mx-auto w-[80%] h-4 -mt-1 rounded-full bg-black/50 blur-lg opacity-25"></div>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
