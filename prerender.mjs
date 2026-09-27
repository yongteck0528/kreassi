/**
 * Post-build prerender step.
 *
 * The site is a client-rendered Vue SPA, so the shipped HTML is an empty
 * <div id="app">. Crawlers that don't run JS (and many that do, unreliably)
 * therefore see no content. This script loads the *already-built* site in a
 * real headless browser, lets it render, and writes the resulting HTML back
 * into dist/index.html — so every crawler gets full markup.
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
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PORT = 4199
const ROUTES = [{ path: '/', out: 'dist/index.html' }] // blog is intentionally empty + noindex

let server
let browser
try {
  server = await preview({ preview: { port: PORT, strictPort: true } })
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // required on CI/Netlify
  })

  for (const route of ROUTES) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1366, height: 1024, deviceScaleFactor: 1 })
    const url = `http://localhost:${PORT}${route.path}`

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 })
    } catch {
      // Don't stall on a slow external fetch (e.g. testimonials sheet) that
      // never settles — the app renders its bundled fallback content anyway.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    }

    // Wait until Vue has mounted something into #app.
    await page.waitForFunction(
      () => document.querySelector('#app') && document.querySelector('#app').children.length > 0,
      { timeout: 30000 },
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
    const outPath = resolve(route.out)
    writeFileSync(outPath, html, 'utf8')
    const bytes = readFileSync(outPath).length
    console.log(`prerendered ${route.path} -> ${route.out} (${(bytes / 1024).toFixed(1)} KB)`)
    await page.close()
  }
} catch (err) {
  console.warn('\n[prerender] SKIPPED — could not prerender in this environment:')
  console.warn('[prerender] ' + (err?.message || err))
  console.warn('[prerender] The site still ships as a normal SPA. Verify/fix prerendering separately.\n')
} finally {
  if (browser) await browser.close().catch(() => {})
  if (server) await server.httpServer.close()
}
