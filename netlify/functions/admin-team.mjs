/**
 * Team management (called from /admin → Team). Every admin can use it.
 *
 * There's no email sender yet, so people are added here with a temporary
 * password that gets passed on (e.g. via WhatsApp). They change it after
 * signing in (/admin → Change password).
 *
 *   POST { action: 'add_admin', email }           → { user_id, email, temp_password }
 *   POST { action: 'reset_password', user_id }    → { temp_password }
 *   POST { action: 'remove', user_id }            → { ok: true }
 *
 * The caller must send their Supabase session token and be an admin. Nobody
 * can reset or remove their own account here, so the team can't lock itself out.
 * Needs SUPABASE_SERVICE_ROLE_KEY (Netlify env, Functions scope).
 */
import { randomInt } from 'node:crypto'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../src/config/supabase.js'

const ALLOWED_ORIGINS = new Set(['https://kreassiteam.com', 'https://www.kreassiteam.com'])
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// No look-alike characters (0/O, 1/l/I) — it's read out or typed by hand.
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
export const tempPassword = (length = 14) => Array.from({ length }, () => PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)]).join('')

const serviceHeaders = (key, extra = {}) => ({
    apikey: key,
    ...(key.startsWith('sb_') ? {} : { authorization: `Bearer ${key}` }), // legacy JWT keys
    'content-type': 'application/json',
    ...extra,
})

export default async (req) => {
    if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })
    const origin = req.headers.get('origin')
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json(403, { error: 'Forbidden' })

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
        console.error('[admin-team] SUPABASE_SERVICE_ROLE_KEY is not set')
        return json(500, { error: 'Server is not configured. Add SUPABASE_SERVICE_ROLE_KEY in Netlify.' })
    }

    // 1. Who is calling? Supabase validates the session token.
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
    if (!token) return json(401, { error: 'Please sign in again.' })
    const who = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${token}` } })
    if (!who.ok) return json(401, { error: 'Your session has expired. Please sign in again.' })
    const caller = await who.json()

    // 2. Only admins manage the team.
    const rest = (path, init = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: serviceHeaders(key, init.headers) })
    const auth = (path, init = {}) => fetch(`${SUPABASE_URL}/auth/v1/admin/${path}`, { ...init, headers: serviceHeaders(key, init.headers) })
    const roleOf = async (userId) => {
        const res = await rest(`admins?user_id=eq.${userId}&select=role`)
        return res.ok ? (await res.json())[0]?.role ?? null : null
    }
    if (!(await roleOf(caller.id))) return json(403, { error: 'Only admins can manage the team.' })

    let body
    try { body = await req.json() } catch { return json(400, { error: 'Invalid request.' }) }

    // 3. Actions
    if (body.action === 'add_admin') {
        const email = String(body.email || '').trim().toLowerCase()
        if (!EMAIL_RE.test(email)) return json(400, { error: 'Please enter a valid email address.' })
        const password = tempPassword()
        const created = await auth('users', { method: 'POST', body: JSON.stringify({ email, password, email_confirm: true }) })
        if (!created.ok) {
            const detail = await created.json().catch(() => ({}))
            if (created.status === 422 || detail.code === 'email_exists') return json(409, { error: 'An account with this email already exists.' })
            console.error('[admin-team] create user failed', created.status, detail)
            return json(502, { error: 'Could not create the account. Please try again.' })
        }
        const user = await created.json()
        const added = await rest('admins', { method: 'POST', headers: { prefer: 'return=minimal' }, body: JSON.stringify({ user_id: user.id, email, role: 'admin' }) })
        if (!added.ok) {
            await auth(`users/${user.id}`, { method: 'DELETE' }) // roll back the half-created account
            console.error('[admin-team] add admins row failed', added.status, await added.text())
            return json(502, { error: 'Could not add the admin. Please try again.' })
        }
        return json(200, { user_id: user.id, email, temp_password: password })
    }

    if (body.action === 'reset_password' || body.action === 'remove') {
        const userId = String(body.user_id || '')
        if (!UUID_RE.test(userId)) return json(400, { error: 'Invalid user.' })
        if (userId === caller.id) return json(400, { error: 'You can’t change your own account here. Use "Change password".' })
        if (!(await roleOf(userId))) return json(404, { error: 'That person is not on the team.' })

        if (body.action === 'reset_password') {
            const password = tempPassword()
            const res = await auth(`users/${userId}`, { method: 'PUT', body: JSON.stringify({ password }) })
            if (!res.ok) return json(502, { error: 'Could not reset the password. Please try again.' })
            return json(200, { temp_password: password })
        }

        // remove: take away admin access, then delete the login. Their posts stay.
        const revoked = await rest(`admins?user_id=eq.${userId}`, { method: 'DELETE' })
        if (!revoked.ok) return json(502, { error: 'Could not remove this person. Please try again.' })
        const deleted = await auth(`users/${userId}`, { method: 'DELETE' })
        if (!deleted.ok) console.error('[admin-team] access revoked but login not deleted', deleted.status)
        return json(200, { ok: true })
    }

    return json(400, { error: 'Unknown action.' })
}
