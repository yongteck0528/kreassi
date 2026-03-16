const DEFAULT_OPTIONS = {
  threshold: 0.2,
  rootMargin: '0px 0px -10% 0px',
}

const getObserverOptions = (value) => ({
  threshold: value?.threshold ?? DEFAULT_OPTIONS.threshold,
  rootMargin: value?.rootMargin ?? DEFAULT_OPTIONS.rootMargin,
})

const applyTiming = (el, value) => {
  if (value?.delay != null) {
    el.style.transitionDelay = `${value.delay}ms`
  }
  if (value?.duration != null) {
    el.style.transitionDuration = `${value.duration}ms`
  }
}

const createObserver = (el, value) => {
  const once = value?.once !== false
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      el.classList.add('is-visible')
      if (once) observer.unobserve(el)
    })
  }, getObserverOptions(value))

  observer.observe(el)
  return observer
}

export default {
  mounted(el, binding) {
    el.classList.add('reveal')
    applyTiming(el, binding.value)
    el.__revealObserver = createObserver(el, binding.value)
  },
  updated(el, binding) {
    applyTiming(el, binding.value)
  },
  unmounted(el) {
    if (el.__revealObserver) {
      el.__revealObserver.disconnect()
      delete el.__revealObserver
    }
  },
}
