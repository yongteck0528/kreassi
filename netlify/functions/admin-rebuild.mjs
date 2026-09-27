/**
 * Rebuilds the website so blog changes go live (called from /admin whenever a
 * post is published, updated, unpublished or deleted). The build reads the
 * published posts and regenerates the blog pages — see scripts/build-blog.mjs.
 *
 *   POST (no body) → { ok: true }
 *
 * The caller must send their Supabase session token and be an admin.
 * Needs NETLIFY_BUILD_HOOK_URL (Netlify → Site configuration → Build & deploy →
 * Build hooks) and SUPABASE_SERVICE_ROLE_KEY, both as Netlify env vars
 * (Functions scope). The hook URL stays server-side: anyone holding it could
 * trigger builds.
 */
import { json, requireAdmin } from '../lib/admin.mjs'

const HOOK_RE = /^https:\/\/api\.netlify\.com\/build_hooks\/[A-Za-z0-9]+$/

export default async (req) => {
    const { response } = await requireAdmin(req, { name: 'admin-rebuild' })
    if (response) return response

    const hook = (process.env.NETLIFY_BUILD_HOOK_URL || '').trim()
    if (!HOOK_RE.test(hook)) {
        console.error('[admin-rebuild] NETLIFY_BUILD_HOOK_URL is missing or not a Netlify build hook URL')
        return json(500, { error: 'Automatic website updates aren’t set up yet (NETLIFY_BUILD_HOOK_URL).' })
    }

    const res = await fetch(`${hook}?trigger_title=${encodeURIComponent('Blog update from /admin')}`, { method: 'POST', body: '{}' })
    if (!res.ok) {
        console.error('[admin-rebuild] build hook failed', res.status)
        return json(502, { error: 'The website update couldn’t be started. Please try again.' })
    }
    return json(200, { ok: true })
}
