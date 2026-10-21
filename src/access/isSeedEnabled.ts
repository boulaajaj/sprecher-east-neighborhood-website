/**
 * Whether the demo seed may run. The seed deletes nearly all content, so it is off on the live
 * site (any production build) and only works in local development (#147). There is no switch to
 * turn it back on in production on purpose: wiping the site must never be one click away.
 */
export const isSeedEnabled = (): boolean => process.env.NODE_ENV !== 'production'
