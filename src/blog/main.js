import '../style.css'
import './blog.css'
import { activateYoutube } from './content.js'

// Blog pages are finished HTML (built by scripts/build-blog.mjs). This script
// only adds the few interactive bits: click-to-load videos and "Copy link".
const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const field = Object.assign(document.createElement('textarea'), { value: text })
        field.setAttribute('readonly', '')
        field.style.cssText = 'position:fixed;opacity:0'
        document.body.append(field)
        field.select()
        const ok = document.execCommand('copy')
        field.remove()
        return ok
    }
}

document.addEventListener('click', async (event) => {
    const video = event.target.closest?.('.yt-lite')
    if (video) { activateYoutube(video); return }

    const copy = event.target.closest?.('[data-copy-link]')
    if (!copy || !(await copyText(copy.dataset.copyLink))) return
    const label = copy.querySelector('span')
    const original = label.textContent
    label.textContent = copy.dataset.copiedLabel
    setTimeout(() => { label.textContent = original }, 2000)
})

// Analytics load after the page is up, as their own small chunk: if a blocker
// stops them, the site itself is unaffected.
import('../analytics/pulse').then(({ initAnalytics }) => initAnalytics()).catch(() => {})
