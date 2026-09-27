/**
 * Shared by the admin functions: JSON responses and "is the caller an admin?".
 * Lives outside netlify/functions so Netlify doesn't deploy it as a function.
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../src/config/supabase.js'

const ALLOWED_ORIGINS = new Set(['https://kreassiteam.com', 'https://www.kreassiteam.com'])

export const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

export const serviceHeaders = (key, extra = {}) => ({
    apikey: key,
    ...(key.startsWith('sb_') ? {} : { authorization: `Bearer ${key}` }), // legacy JWT keys
    'content-type': 'application/json',
    ...extra,
})

/** Service-role REST call (bypasses row-level security — server only). */
export const serviceRest = (key, path, init = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: serviceHeaders(key, init.headers) })

export const roleOf = async (key, userId) => {
    const res = await serviceRest(key, `admins?user_id=eq.${userId}&select=role`)
    return res.ok ? (await res.json())[0]?.role ?? null : null
}

/**
 * Checks method, origin and the caller's Supabase session, and that they're on
 * the team. Returns { key, caller } — or { response } to send back as is.
 */
export async function requireAdmin(req, { name }) {
    if (req.method !== 'POST') return { response: json(405, { error: 'Method not allowed' }) }
    const origin = req.headers.get('origin')
    if (origin && !ALLOWED_ORIGINS.has(origin)) return { response: json(403, { error: 'Forbidden' }) }

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
        console.error(`[${name}] SUPABASE_SERVICE_ROLE_KEY is not set`)
        return { response: json(500, { error: 'Server is not configured. Add SUPABASE_SERVICE_ROLE_KEY in Netlify.' }) }
    }

    // Supabase validates the session token and tells us who it belongs to.
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
    if (!token) return { response: json(401, { error: 'Please sign in again.' }) }
    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${token}` } })
    if (!who.ok) return { response: json(401, { error: 'Your session has expired. Please sign in again.' }) }
    const caller = await who.json()

    if (!(await roleOf(key, caller.id))) return { response: json(403, { error: 'Only admins can do this.' }) }
    return { key, caller }
}
