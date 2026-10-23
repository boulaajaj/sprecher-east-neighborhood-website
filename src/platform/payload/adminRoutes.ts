// Where Payload's admin panel lives, set here and passed to `payload.config.ts` (`routes.admin`,
// `admin.routes.forgot`), so code outside the config that links to an admin page reads the same
// values. Payload's own defaults, written out.

/** The admin panel's base path (`routes.admin`). */
export const ADMIN_ROUTE = '/admin'

/** The admin panel's forgot-password page, inside the admin (`admin.routes.forgot`). */
export const ADMIN_FORGOT_ROUTE = '/forgot'

/** The full path of the admin panel's forgot-password page (#282 redirects it to the site's). */
export const ADMIN_FORGOT_PATH = `${ADMIN_ROUTE}${ADMIN_FORGOT_ROUTE}`
