import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useScrollDirection(opts = {}) {
  const threshold = opts.threshold ?? 10      // min px before toggling
  const topOffset = opts.topOffset ?? 64      // treat user as "at top" under this y
  const scrollingUp = ref(true)
  const atTop = ref(true)

  let lastY = 0
  let ticking = false

  const onScroll = () => {
    const y = Math.max(window.pageYOffset || 0, 0)
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const dy = y - lastY
        if (Math.abs(dy) >= threshold) {
          scrollingUp.value = dy < 0
          lastY = y
        }
        atTop.value = y <= topOffset
        ticking = false
      })
      ticking = true
    }
  }

  onMounted(() => {
    lastY = Math.max(window.pageYOffset || 0, 0)
    atTop.value = lastY <= topOffset
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { scrollingUp, atTop }
}
