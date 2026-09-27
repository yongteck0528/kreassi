/**
 * Post-build prerender step.
 *
 * The site is a client-rendered Vue SPA, so the shipped HTML is an empty
 * <div id="app">. Crawlers that don't run JS (and many that do, unreliably)
 * therefore see no content. This script loads the *already-built* site in a
 * real headless browser, lets it render, and writes the resulting HTML back
 * into dist/ — one file per language URL — so every crawler gets full markup.
 *
 * It touches no application source: it runs entirely against dist/ after
 * `vite build`. The client bundle still boots and re-mounts for interactivity.
 *
 * It is intentionally NON-FATAL: if a headless browser can't launch in the
 * build environment, it logs a warning and leaves the normal SPA build in
 * place, so the deploy still succeeds. Prerendering can then be verified/fixed
 * separately rather than blocking a release.
 */
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const PORT = 4199
// Blog is intentionally empty + noindex, so it isn't prerendered.
const ROUTES = [
  { path: '/', out: 'dist/index.html', lang: 'en' },
  { path: '/id/', out: 'dist/id/index.html', lang: 'id' },
]

const render = async (browser, route) => {
  // Fresh context per route: no shared localStorage (saved language) between renders.
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.setViewport({ width: 1366, height: 1024, deviceScaleFactor: 1 })
  const url = `http://localhost:${PORT}${route.path}`

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 })
  } catch {
    // Don't stall on a slow external fetch (e.g. testimonials sheet) that
    // never settles — the app renders its bundled fallback content anyway.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  }

  // Wait until Vue has mounted into #app in the expected language.
  await page.waitForFunction(
    (lang) => document.documentElement.lang === lang
      && document.querySelector('#app')?.children.length > 0,
    { timeout: 30000 },
    route.lang,
  )

  // Scroll through the page so IntersectionObserver-driven reveals fire and
  // all sections end up in their visible state before we capture.
  await page.evaluate(async () => {
    await new Promise((done) => {
      let y = 0
      const step = () => {
        window.scrollTo(0, y)
        y += window.innerHeight
        if (y < document.body.scrollHeight) setTimeout(step, 120)
        else { window.scrollTo(0, 0); setTimeout(done, 400) }
      }
      step()
    })
  })

  const html = await page.content()
  await context.close()
  return html
}

let server
let browser
try {
  server = await preview({ preview: { port: PORT, strictPort: true } })
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US'], // sandbox flags required on CI/Netlify
  })

  // Render every route before writing anything, so each render starts from
  // the untouched vite build output.
  const results = []
  for (const route of ROUTES) results.push({ route, html: await render(browser, route) })

  for (const { route, html } of results) {
    const outPath = resolve(route.out)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html, 'utf8')
    console.log(`prerendered ${route.path} (${route.lang}) -> ${route.out} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`)
  }
} catch (err) {
  console.warn('\n[prerender] SKIPPED — could not prerender in this environment:')
  console.warn('[prerender] ' + (err?.message || err))
  console.warn('[prerender] The site still ships as a normal SPA. Verify/fix prerendering separately.\n')
} finally {
  if (browser) await browser.close().catch(() => {})
  if (server) await server.httpServer.close()
}
