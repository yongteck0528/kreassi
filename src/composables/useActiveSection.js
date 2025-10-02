import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useActiveSection(ids, { rootMargin = '-45% 0px -45% 0px', threshold = [0, 0.25, 0.5, 0.75, 1] } = {}) {
  const active = ref(ids[0] || null)
  let obs

  onMounted(() => {
    const sections = ids
      .map(id => document.getElementById(id))
      .filter(Boolean)

    // Set initial active by current scroll position
    const inView = sections
      .map(el => ({ id: el.id, top: el.getBoundingClientRect().top }))
      .filter(x => x.top >= 0)
      .sort((a, b) => a.top - b.top)
    if (inView[0]) active.value = inView[0].id

    obs = new IntersectionObserver(entries => {
      // Pick the entry most centered in the viewport
      let best = { ratio: 0, id: active.value }
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= best.ratio) {
          best = { ratio: e.intersectionRatio, id: e.target.id }
        }
      }
      if (best.id) active.value = best.id
    }, { root: null, rootMargin, threshold })

    sections.forEach(el => obs.observe(el))

    // Keep in sync if user jumps via hash
    const onHash = () => {
      const id = (location.hash || '#').slice(1) || ids[0]
      if (ids.includes(id)) active.value = id
    }
    window.addEventListener('hashchange', onHash, { passive: true })
    // store to remove later
    obs._onHash = onHash
  })

  onBeforeUnmount(() => {
    if (obs) {
      obs.disconnect()
      window.removeEventListener('hashchange', obs._onHash || (()=>{}))
    }
  })

  return { active }
}
