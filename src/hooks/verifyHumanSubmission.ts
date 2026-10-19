import { APIError, type CollectionBeforeChangeHook } from 'payload'

import type { User } from '@/payload-types'
import { hasAdminOrEditor } from '@/access/roles'
import { clientIpFromHeaders } from '@/utilities/clientIp'
import { TURNSTILE_TOKEN_HEADER } from '@/utilities/turnstileHeader'
import { isTurnstileEnabled, verifyTurnstileToken } from '@/utilities/turnstile'

/**
 * Rejects public form submissions that don't carry a valid Cloudflare Turnstile token.
 * Off unless both Turnstile keys are configured. Signed-in admins and editors are exempt.
 * Everything else is checked, including Local API calls made without a user (they have no
 * token, so they are rejected — pass an admin user if trusted server code ever needs to).
 */
export const verifyHumanSubmission: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data
  if (hasAdminOrEditor(req.user as User | null)) return data
  if (!isTurnstileEnabled()) return data

  const result = await verifyTurnstileToken(
    req.headers?.get(TURNSTILE_TOKEN_HEADER),
    clientIpFromHeaders(req.headers),
  )

  if (!result.ok) {
    // Why it failed goes to the log (a wrong secret looks like a bot otherwise);
    // the visitor gets a fixed message.
    req.payload.logger.warn(`Turnstile rejected a form submission: ${result.reason}`)
    throw new APIError('We couldn’t confirm you’re not a robot. Please try again.', 400, null, true)
  }

  return data
}
