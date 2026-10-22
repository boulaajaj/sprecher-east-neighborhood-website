import type { PayloadRequest } from 'payload'

import { getServerSideURL } from '@/platform/lib/getURL'
import type { EmailConfirmedListener } from '@/platform/payload/emailConfirmer'

import { toWelcomeEmail } from '../domain/emails'
import { checkLink, toUnconfirmedCutoff } from '../domain/rules'
import { hashConfirmationToken } from '../domain/token'
import { parseConfirmationToken } from '../domain/tokenFormat'
import type { ConfirmOutcome } from '../domain/types'
import { logFailure } from './logFailure'
import { deleteUnconfirmedBefore, getConfirmationByTokenHash, markConfirmed } from './store'

/**
 * Follows a confirmation link. The first valid click within 24 hours confirms the address, runs
 * the listeners (each failure is logged, and doesn't stop the others or the confirmation), then
 * sends the welcome email once. A later click answers `already-confirmed`.
 */
export async function confirmEmail(
  value: unknown,
  req: PayloadRequest,
  listeners: readonly EmailConfirmedListener[],
): Promise<ConfirmOutcome> {
  const token = parseConfirmationToken(value)
  if (!token) return 'invalid'

  const now = Date.now()
  await deleteUnconfirmedBefore(req, toUnconfirmedCutoff(now))

  const record = await getConfirmationByTokenHash(req, hashConfirmationToken(token))
  if (!record) return 'invalid'

  const check = checkLink(record, now)
  if (check !== 'confirm') return check
  if (!(await markConfirmed(req, record.id, new Date(now).toISOString()))) {
    return 'already-confirmed'
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
  return 'confirmed'
}
