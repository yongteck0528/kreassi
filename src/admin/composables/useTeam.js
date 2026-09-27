import { reactive } from 'vue'
import { supabase } from '../lib/supabase'

// Team list (every admin can read it) + the server-side team actions, which
// need the secret key and therefore run as a Netlify function.
const state = reactive({ members: [], loaded: false, error: '' })

export function useTeam() {
    const load = async (force = false) => {
        if (state.loaded && !force) return
        const { data, error } = await supabase.from('admins').select('user_id, email, created_at').order('created_at')
        if (error) { state.error = 'Could not load the team. Please refresh.'; return }
        state.members = data
        state.loaded = true
        state.error = ''
    }

    const emailOf = (userId) => state.members.find((m) => m.user_id === userId)?.email ?? ''

    /** Calls netlify/functions/admin-team.mjs with the current session. */
    const act = async (action, payload = {}) => {
        const { data } = await supabase.auth.getSession()
        let res
        try {
            res = await fetch('/.netlify/functions/admin-team', {
                method: 'POST',
                headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` },
                body: JSON.stringify({ action, ...payload }),
            })
        } catch {
            throw new Error('Could not reach the server. Check your connection and try again.')
        }
        const body = await res.json().catch(() => null)
        if (!body) throw new Error('Team changes only work on the live site (kreassiteam.com/admin).')
        if (!res.ok) throw new Error(body.error || 'Something went wrong. Please try again.')
        return body
    }

    return { state, load, emailOf, act }
}
