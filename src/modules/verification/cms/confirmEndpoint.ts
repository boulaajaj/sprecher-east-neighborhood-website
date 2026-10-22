import type { Endpoint } from 'payload'

import { parseClientIp, SlidingWindowCounter } from '@/platform/lib'
import type { EmailConfirmedListener } from '@/platform/payload/emailConfirmer'

import { CONFIRM_ENDPOINT_PATH } from '../domain/paths'
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
 * answers `{ outcome }`. A POST, never the page load, because mail scanners open links and would
 * use them up. Public on purpose: the token is the proof.
 */
export const confirmEndpoint = (listeners: readonly EmailConfirmedListener[]): Endpoint => ({
  path: CONFIRM_ENDPOINT_PATH,
  method: 'post',
  handler: async (req) => {
    const ip = parseClientIp(req.headers)
    if (ip && !attempts.tryTake(ip, CONFIRMATION_LIMITS.confirmAttemptsPerConnection, Date.now())) {
      return Response.json({ error: 'Too many tries. Please wait and try again.' }, { status: 429 })
    }
    try {
      const outcome = await confirmEmail(await readToken(req.json?.bind(req)), req, listeners)
      return Response.json({ outcome })
    } catch (error) {
      logFailure(req, 'Confirming an email', error)
      return Response.json({ error: 'Something went wrong.' }, { status: 500 })
    }
  },
})
