<script setup>
import { computed } from 'vue'
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import AboutUs from './components/AboutUs.vue'
import Partners from './components/Partners.vue'
import Comments from './components/Comments.vue'
import HowItWorks from './components/HowItWorks.vue'
import CollaborationStep from './components/CollaborationStep.vue'
import CollaborationStep2 from './components/CollaborationStep2.vue'
import OurTeam from './components/OurTeam.vue'
import MeetOurFounder from './components/MeetOurFounder.vue'
import ServiceSection from './components/ServiceSection.vue'
import Footer from './components/Footer.vue'
import { useScrollDirection } from './composables/useScrollDirection'

// Hide the sticky header while scrolling down, show it when scrolling up.
const { scrollingUp, atTop } = useScrollDirection({ threshold: 8, topOffset: 48 })
const showNav = computed(() => atTop.value || scrollingUp.value)
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 transition-transform duration-100 will-change-transform bg-white text-black"
      :class="showNav ? 'translate-y-0' : '-translate-y-full'">
      <Header />
    </header>

    <main class="mx-auto">
      <section id="home" class="section bg-var-7">
        <Hero />
      </section>

      <section id="about" class="section">
        <AboutUs />
      </section>

      <section id="partners" class="section bg-var-gray">
        <Partners />
      </section>

      <section id="comments" class="section bg-gray-300">
        <Comments />
      </section>

      <section id="howitworks" class="section bg-var-purple-gradient">
        <HowItWorks />
      </section>

      <section id="collab1" class="section bg-white">
        <CollaborationStep />
      </section>

      <section id="collab2" class="section bg-white">
        <CollaborationStep2 />
      </section>

      <section id="team" class="section">
        <OurTeam />
      </section>

      <section id="founder" class="section">
        <MeetOurFounder />
      </section>

      <section id="services" class="section">
        <ServiceSection />
      </section>

      <section id="contact" class="section">
        <Footer />
      </section>
    </main>
  </div>
</template>
