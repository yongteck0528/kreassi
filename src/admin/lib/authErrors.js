/** Turn Supabase auth errors into plain-language messages for the admin UI. */
export const authErrorMessage = (error) => {
    const message = String(error?.message || '').toLowerCase()
    if (error?.status === 429 || message.includes('rate limit')) return 'Too many attempts. Please wait a few minutes and try again.'
    if (message.includes('invalid login credentials')) return 'Email or password is incorrect.'
    if (message.includes('email not confirmed')) return 'This account has not been confirmed yet.'
    if (message.includes('should be different')) return 'Choose a password different from your current one.'
    if (message.includes('failed to fetch') || message.includes('network')) return 'Could not reach the server. Check your connection and try again.'
    return error?.message || 'Something went wrong. Please try again.'
}

/** Shared form styles for the sign-in pages. */
export const inputClass = 'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-5 focus:outline-none focus:ring-2 focus:ring-purple-5/20'
export const buttonClass = 'flex w-full items-center justify-center rounded-lg bg-darkPurple px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4A1A78] disabled:cursor-not-allowed disabled:opacity-60'
