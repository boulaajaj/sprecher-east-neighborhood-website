import type { Endpoint } from 'payload'

import { HUMAN_CHECK_TOKEN_HEADER, type HumanVerifier } from '@/platform/lib/humanCheck'
import { parseClientIp, SlidingWindowCounter } from '@/platform/lib'
import type { EmailConfirmedListener } from '@/platform/payload/emailConfirmer'

import { CONFIRM_ENDPOINT_PATH, ROBOT_CHECK_ERROR } from '../domain/paths'
import { CONFIRMATION_LIMITS } from '../domain/limits'
import { confirmEmail } from './confirmEmail'
import { logFailure } from './logFailure'

// Tokens can't be guessed, so this only keeps one connection from hammering the database
const attempts = new SlidingWindowCounter(CONFIRMATION_LIMITS.connectionWindowMs)

/** Reads `{ token }` from a JSON body; anything else is no token. */
async function readToken(json: (() => Promise<unknown>) | undefined): Promise<unknown> {
  try {
    const body = json ? await json() : null
    return body && typeof body === 'object' && 'token' in body ? body.token : null
  } catch {
    return null
  }
}

/**
 * `POST /api/email-confirmations/confirm` with `{ token }`: follows a confirmation link and
 * answers `{ outcome }`, with the `email` once it is confirmed (`ConfirmResult`). A POST sent by
 * the page's Confirm button, never the page load, because mail scanners open links, and some run
 * the page's script (#303). The button also runs the robot check (decision 0003), sent in the
 * `x-turnstile-token` header: without a valid token nothing is confirmed (400). Public on purpose:
 * the link's token is the proof of the mailbox, the robot check the proof of a person.
 */
export const confirmEndpoint = (
  listeners: readonly EmailConfirmedListener[],
  verifier: HumanVerifier,
): Endpoint => ({
  path: CONFIRM_ENDPOINT_PATH,
  method: 'post',
  handler: async (req) => {
    // Without a client IP there is no key, so the limit doesn't apply. Caddy always sets
    // X-Forwarded-For and Node listens on 127.0.0.1 only (#118), so in production every request
    // has one; the same trade-off as the contact form's limits.
    const ip = parseClientIp(req.headers)
    if (ip && !attempts.tryTake(ip, CONFIRMATION_LIMITS.confirmAttemptsPerConnection, Date.now())) {
      return Response.json({ error: 'Too many tries. Please wait and try again.' }, { status: 429 })
    }
    if (verifier.isEnabled()) {
      const check = await verifier.verify(req.headers?.get(HUMAN_CHECK_TOKEN_HEADER))
      if (!check.ok) {
        // Why goes to the log (a wrong secret looks like a bot otherwise); the page gets a code
        req.payload.logger.warn(`Robot check refused an email confirmation: ${check.reason}`)
        return Response.json({ error: ROBOT_CHECK_ERROR }, { status: 400 })
      }
    }
    try {
      return Response.json(await confirmEmail(await readToken(req.json?.bind(req)), req, listeners))
    } catch (error) {
      logFailure(req, 'Confirming an email', error)
      return Response.json({ error: 'Something went wrong.' }, { status: 500 })
    }
  },
})
