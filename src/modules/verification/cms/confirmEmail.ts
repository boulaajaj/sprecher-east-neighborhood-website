import type { PayloadRequest } from 'payload'

import { getServerSideURL } from '@/platform/lib/getURL'
import type { EmailConfirmedListener } from '@/platform/payload/emailConfirmer'

import { toWelcomeEmail } from '../domain/emails'
import { checkLink } from '../domain/rules'
import { hashConfirmationToken } from './token'
import { parseConfirmationToken } from '../domain/tokenFormat'
import type { ConfirmResult } from '../domain/types'
import { logFailure } from './logFailure'
import { getConfirmationByTokenHash, markConfirmed } from './store'

/**
 * Follows a confirmation link. The first valid click within 24 hours confirms the address, runs
 * the listeners (each failure is logged, and doesn't stop the others or the confirmation), then
 * sends the welcome email once. A later click answers `already-confirmed`. A confirmed answer
 * carries the address (see `ConfirmResult`).
 */
export async function confirmEmail(
  value: unknown,
  req: PayloadRequest,
  listeners: readonly EmailConfirmedListener[],
): Promise<ConfirmResult> {
  const token = parseConfirmationToken(value)
  if (!token) return { outcome: 'invalid' }

  const now = Date.now()
  const record = await getConfirmationByTokenHash(req, hashConfirmationToken(token))
  if (!record) return { outcome: 'invalid' }

  const check = checkLink(record, now)
  if (check === 'expired') return { outcome: check }
  if (check === 'already-confirmed') return { outcome: check, email: record.email }
  if (!(await markConfirmed(req, record.id, new Date(now).toISOString()))) {
    return { outcome: 'already-confirmed', email: record.email }
  }

  for (const listener of listeners) {
    try {
      await listener(record.email, req)
    } catch (error) {
      logFailure(req, 'A step after confirming an email', error)
    }
  }

  try {
    await req.payload.sendEmail({ to: record.email, ...toWelcomeEmail(getServerSideURL()) })
  } catch (error) {
    logFailure(req, 'Sending the welcome email', error)
  }
  return { outcome: 'confirmed', email: record.email }
}
