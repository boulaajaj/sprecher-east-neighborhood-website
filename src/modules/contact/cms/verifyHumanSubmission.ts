import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { hasAdminOrEditor } from '@/platform/payload/roles'

import { HUMAN_CHECK_TOKEN_HEADER, type HumanVerifier } from '@/platform/lib/humanCheck'

/**
 * A hook that rejects public form submissions the robot check doesn't pass. Off while the
 * verifier is off (Turnstile: unless both keys are configured). Signed-in admins and editors are
 * exempt. Everything else is checked, including Local API calls made without a user (they have
 * no token, so they are rejected — pass an admin user if trusted server code ever needs to).
 */
export const verifyHumanSubmission =
  (verifier: HumanVerifier): CollectionBeforeChangeHook =>
  async ({ data, operation, req }) => {
    if (operation !== 'create') return data
    if (hasAdminOrEditor(req.user)) return data
    if (!verifier.isEnabled()) return data

    const result = await verifier.verify(req.headers?.get(HUMAN_CHECK_TOKEN_HEADER))

    if (!result.ok) {
      // Why it failed goes to the log (a wrong secret looks like a bot otherwise);
      // the visitor gets a fixed message.
      req.payload.logger.warn(`Robot check rejected a form submission: ${result.reason}`)
      throw new APIError(
        'We couldn’t confirm you’re not a robot. Please try again.',
        400,
        null,
        true,
      )
    }

    return data
  }
