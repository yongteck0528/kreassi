/**
 * Post-build step: turns the published blog posts into static pages.
 *
 * Runs after `vite build`. Reads published posts from Supabase with the public
 * (anon) key — row-level security only lets that key see published posts and
 * whitelisted columns — and writes finished HTML into dist/:
 *
 *   dist/blog/index.html          the post list
 *   dist/blog/<slug>/index.html   one page per post
 *   dist/blog/404.html            unknown /blog/… addresses
 *   dist/sitemap.xml              + the blog URLs
 *   dist/_redirects               + old post URLs → current ones
 *
 * Publishing in /admin triggers a Netlify rebuild, which runs this again.
 *
 * Unlike the prerender step this one is FATAL on purpose: if posts can't be
 * loaded, the build fails and Netlify keeps the current site live — better
 * than deploying a blog with its posts missing.
 *
 * BLOG_API_URL overrides the Supabase URL (used by tests with a local mock).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../src/config/supabase.js'
import { SITE_URL } from '../src/config/site.js'
import { BLOG_PATH, indexPage, notFoundPage, postPage, postView, relatedFor } from '../src/blog/templates.js'
import { SLUG_RE } from '../src/utils/slug.js'

const DIST = 'dist'
const API = process.env.BLOG_API_URL || SUPABASE_URL
// Explicit columns: the anon key may only read these (see migrations 0004/0005).
const POST_COLUMNS = 'id,title,slug,lang,category_id,excerpt,cover_path,cover_alt,content,updated_at,published_at,old_slugs'

async function api(path, attempt = 1) {
    try {
        const res = await fetch(`${API}/rest/v1/${path}`, {
            headers: { apikey: SUPABASE_ANON_KEY, ...(SUPABASE_ANON_KEY.startsWith('sb_') ? {} : { authorization: `Bearer ${SUPABASE_ANON_KEY}` }) },
            signal: AbortSignal.timeout(20000),
        })
        if (!res.ok) {
            const detail = await res.text()
            const error = new Error(`HTTP ${res.status}: ${detail.slice(0, 300)}`)
            error.permanent = res.status < 500
            throw error
        }
        return await res.json()
    } catch (error) {
        if (error.permanent || attempt >= 3) throw error
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
        return api(path, attempt + 1)
    }
}

/** The PNG the homepage build emitted for a logo (shared cache with the homepage). */
function builtAsset(prefix) {
    const name = readdirSync(join(DIST, 'assets')).find((n) => n.startsWith(prefix) && n.endsWith('.png'))
    if (!name) throw new Error(`Couldn't find the built logo "${prefix}*.png" in dist/assets.`)
    const png = readFileSync(join(DIST, 'assets', name))
    return { src: `/assets/${encodeURI(name)}`, width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}

const write = (path, content) => {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content, 'utf8')
}
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const day = (iso) => new Date(iso).toISOString().slice(0, 10)

// ---------------------------------------------------------------------------
let posts
let categories
try {
    ;[posts, categories] = await Promise.all([
        api(`posts?select=${POST_COLUMNS}&status=eq.published&order=published_at.desc`),
        api('categories?select=id,slug,name'),
    ])
} catch (error) {
    console.error(`\n[blog] Could not load posts from Supabase: ${error.message}`)
    if (/old_slugs/.test(error.message)) console.error('[blog] Run supabase/migrations/0005_blog_public.sql in the Supabase SQL Editor.')
    console.error('[blog] Build stopped so the live site keeps its current blog.\n')
    process.exit(1)
}

const categoryMap = new Map(categories.map((c) => [c.id, c]))
const views = posts
    .filter((p) => {
        const ok = p.title?.trim() && SLUG_RE.test(p.slug || '')
        if (!ok) console.warn(`[blog] skipped post ${p.id}: missing title or invalid URL`)
        return ok
    })
    .map((p) => postView(p, categoryMap))

const assets = {
    logo: builtAsset('Original Kreassi Logo-'),
    logoWhite: builtAsset('White - Kreassi Logo-'),
}
const shellPath = join(DIST, 'blog.html')
if (!existsSync(shellPath)) throw new Error('dist/blog.html not found — run `vite build` first (this step consumes it).')
const shell = readFileSync(shellPath, 'utf8')
if (!shell.includes('<!--blog:head-->') || !shell.includes('<!--blog:body-->')) throw new Error('dist/blog.html is missing the blog markers.')
const fill = (page) => shell
    .replace(/<html lang="[^"]*">/, `<html lang="${page.lang}">`)
    .replace(/[ \t]*<!-- Page shell[\s\S]*?-->\r?\n/, '')
    .replace('<!--blog:head-->', () => page.head)
    .replace('<!--blog:body-->', () => page.body)

// Pages
write(join(DIST, 'blog', 'index.html'), fill(indexPage(views, { assets })))
for (const view of views) {
    write(join(DIST, 'blog', view.slug, 'index.html'), fill(postPage(view, { related: relatedFor(view, views), assets })))
}
write(join(DIST, 'blog', '404.html'), fill(notFoundPage(views, { assets })))
rmSync(shellPath) // the shell itself is never served

// Sitemap: the blog list and every post (only once there's something to read).
if (views.length) {
    const newest = views.reduce((max, v) => (v.modified > max ? v.modified : max), views[0].modified)
    const entries = [
        `  <url>\n    <loc>${SITE_URL}${BLOG_PATH}</loc>\n    <lastmod>${day(newest)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
        ...views.map((v) => [
            '  <url>',
            `    <loc>${xml(v.url)}</loc>`,
            `    <lastmod>${day(v.modified)}</lastmod>`,
            '    <priority>0.7</priority>',
            ...(v.cover ? ['    <image:image>', `      <image:loc>${xml(v.cover)}</image:loc>`, '    </image:image>'] : []),
            '  </url>',
        ].join('\n')),
    ]
    const sitemapPath = join(DIST, 'sitemap.xml')
    const sitemap = readFileSync(sitemapPath, 'utf8')
    if (!sitemap.includes('</urlset>')) throw new Error('dist/sitemap.xml has no </urlset>.')
    writeFileSync(sitemapPath, sitemap.replace('</urlset>', `${entries.join('\n')}\n</urlset>`), 'utf8')
}

// Old addresses → current ones (skipping any another post now uses).
const live = new Set(views.map((v) => v.slug))
const moves = views.flatMap((v) => (v.old_slugs ?? [])
    .filter((old) => SLUG_RE.test(old) && !live.has(old))
    .map((old) => `${BLOG_PATH}${old}  ${v.path}  301`))
if (moves.length) {
    const redirectsPath = join(DIST, '_redirects')
    // Netlify uses the first matching rule, so these go above the catch-alls.
    writeFileSync(redirectsPath, `${moves.join('\n')}\n${readFileSync(redirectsPath, 'utf8')}`, 'utf8')
}

console.log(`[blog] built ${views.length} post${views.length === 1 ? '' : 's'}${moves.length ? `, ${moves.length} redirect${moves.length === 1 ? '' : 's'}` : ''} → dist/blog/`)
