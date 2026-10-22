/** The collection's slug: its Local API name and its REST path under /api. */
export const EMAIL_CONFIRMATIONS = 'email-confirmations'

/** The page a confirmation link opens, with `?token=…`. */
export const CONFIRM_EMAIL_PATH = '/confirm-email'

/** The collection endpoint that page posts the token to. */
export const CONFIRM_ENDPOINT_PATH = '/confirm'

/** The endpoint's full path, for the browser. */
export const CONFIRM_API_PATH = `/api/${EMAIL_CONFIRMATIONS}${CONFIRM_ENDPOINT_PATH}`
