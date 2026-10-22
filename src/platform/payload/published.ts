import type { Where } from 'payload'

/**
 * Only published documents. `overrideAccess: false` without a user already limits results to
 * published documents, but filtering on `_status` explicitly keeps drafts out even if a caller
 * later passes a signed-in admin or editor (who can read drafts via the access rule).
 */
export const PUBLISHED: Where = { _status: { equals: 'published' } }
