import type { EmailConfirmer } from '@/platform/payload/emailConfirmer'

import { parseEmailAddress } from '../domain/address'
import { logFailure } from './logFailure'
import { withOwnTransaction } from './ownTransaction'
import { requestConfirmation } from './requestConfirmation'
import { getConfirmationByEmail } from './store'

/**
 * The site's email confirmation (#183), for `payload.config.ts` to hand to the modules that need
 * it (decision 0008). It never throws, so a failure here never loses the message or sign-up
 * that asked: an unknown state counts as unconfirmed, and why a link wasn't sent goes to the
 * log, never to the person and never with the address. It works in a transaction of its own
 * (`withOwnTransaction`), so a failure in it can never roll back the caller's.
 */
export const emailConfirmer: EmailConfirmer = {
  async isConfirmed(value, req) {
    const email = parseEmailAddress(value)
    if (!email) return false
    try {
      return Boolean((await getConfirmationByEmail(withOwnTransaction(req), email))?.confirmedAt)
    } catch (error) {
      logFailure(req, 'Checking an email confirmation', error)
      return false
    }
  },

  async request(value, req) {
    try {
      const outcome = await requestConfirmation(value, withOwnTransaction(req))
      if (outcome !== 'sent' && outcome !== 'already-confirmed') {
        req.payload.logger.warn(`No confirmation email sent: ${outcome}`)
      }
    } catch (error) {
      logFailure(req, 'Requesting an email confirmation', error)
    }
  },
}
