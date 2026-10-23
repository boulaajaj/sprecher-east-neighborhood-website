// The module's pages, named once for links, redirects and the emails Payload sends.

/** Where a visitor signs in, and where a page that needs an account sends them. */
export const SIGN_IN_PATH = '/login'

/** The signed-in account's own page. */
export const ACCOUNT_PATH = '/account'

/** Where a visitor asks for a link to reset a forgotten password. */
export const FORGOT_PASSWORD_PATH = '/forgot-password'

/** Where that link lands, with `?token=…`. */
export const RESET_PASSWORD_PATH = '/reset-password'

/** Where a visitor creates an account, with `?email=…` when the confirm page sends them. */
export const SIGN_UP_PATH = '/sign-up'

/** Where the link in Payload's verification email lands, with `?token=…`. */
export const VERIFY_ACCOUNT_PATH = '/verify-account'
