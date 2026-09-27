import { supabase } from './supabase'
import { SITE_URL } from '../../config/site'

/** Where a published post lives on the website. */
export const livePostUrl = (slug) => `${SITE_URL}/blog/${slug}/`

/** How long a rebuild usually takes, for messages. */
export const REBUILD_TIME = 'about 2–3 minutes'

/**
 * Ask Netlify to rebuild the website so blog changes go live
 * (netlify/functions/admin-rebuild.mjs). Never throws: resolves to '' when the
 * update started, otherwise to a warning to show next to the (saved) change.
 */
export async function rebuildSite() {
    const { data } = await supabase.auth.getSession()
    let res
    try {
        res = await fetch('/.netlify/functions/admin-rebuild', {
            method: 'POST',
            headers: { authorization: `Bearer ${data.session?.access_token ?? ''}` },
        })
    } catch {
        return 'Your change is saved, but the website couldn’t be updated (no connection). It will show after the next site update.'
    }
    const body = await res.json().catch(() => null)
    if (!body) return 'Your change is saved. The website only updates automatically from the live admin (kreassiteam.com/admin).'
    if (!res.ok) return `Your change is saved, but the website wasn’t updated: ${body.error || 'unknown error'}`
    return ''
}
