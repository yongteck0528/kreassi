<script setup>
import img1 from '../../assets/Images/Services/Motion Graphic/1.mp4'
import img2 from '../../assets/Images/Services/Motion Graphic/2.mp4'
import img3 from '../../assets/Images/Services/Motion Graphic/3.mp4'
import FramedVideoGrid from './FramedVideoGrid.vue'

const videos = [img1, img2, img3]
</script>

<template>
  <FramedVideoGrid :videos="videos" />
</template>
