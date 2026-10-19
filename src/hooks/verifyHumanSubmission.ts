import { APIError, type CollectionBeforeChangeHook } from 'payload'

import type { User } from '@/payload-types'
import { ROLES } from '@/access/roles'
import { TURNSTILE_TOKEN_HEADER } from '@/utilities/turnstileHeader'
import {
  clientIpFromHeaders,
  isTurnstileEnabled,
  verifyTurnstileToken,
} from '@/utilities/turnstile'

let warnedDisabled = false

/**
 * Rejects public form submissions that don't carry a valid Cloudflare Turnstile token.
 * Off when TURNSTILE_SECRET_KEY isn't set (local dev, CI). Admins and editors creating a
 * submission from the admin panel or the Local API are not checked.
 */
export const verifyHumanSubmission: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const role = (req.user as User | null)?.role
  if (role === ROLES.admin || role === ROLES.editor) return data

  if (!isTurnstileEnabled()) {
    if (!warnedDisabled && process.env.NODE_ENV === 'production') {
      req.payload.logger.warn('Turnstile is not configured; form submissions are not spam-checked')
      warnedDisabled = true
    }
    return data
  }

  const headers = req.headers
  const token = headers?.get(TURNSTILE_TOKEN_HEADER)
  const ok = await verifyTurnstileToken(token, headers ? clientIpFromHeaders(headers) : null)

  if (!ok) {
    // Fixed message only: don't reveal why verification failed
    throw new APIError('We couldn’t confirm you’re not a robot. Please try again.', 400, null, true)
  }

  return data
}
