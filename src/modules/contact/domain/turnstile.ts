// Shared by the browser widget and the server check (no secrets here).

/** Header the form block uses to send the Cloudflare Turnstile token with a submission. */
export const TURNSTILE_TOKEN_HEADER = 'x-turnstile-token'

/** Action name the widget sends; checked on the server when Cloudflare echoes it back. */
export const TURNSTILE_ACTION = 'form-submission'
