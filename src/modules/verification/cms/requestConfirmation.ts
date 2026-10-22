import type { PayloadRequest } from 'payload'

import { parseClientIp, SlidingWindowCounter } from '@/platform/lib'
import { getServerSideURL } from '@/platform/lib/getURL'

import { parseEmailAddress } from '../domain/address'
import { toConfirmationEmail, toConfirmationLink } from '../domain/emails'
import { CONFIRMATION_LIMITS } from '../domain/limits'
import { checkAddressLimit, toTokenExpiry, toUnconfirmedCutoff } from '../domain/rules'
import { newConfirmationToken } from '../domain/token'
import type { RequestOutcome } from '../domain/types'
import { deleteUnconfirmedBefore, getConfirmationByEmail, saveLinkSent } from './store'

// In memory, like the form limits: the site runs as one PM2 process.
const connections = new SlidingWindowCounter(CONFIRMATION_LIMITS.connectionWindowMs)
const siteWide = new SlidingWindowCounter(CONFIRMATION_LIMITS.siteWideWindowMs)
const SITE_WIDE = 'site'

/**
 * Sends a confirmation link to an address someone typed, within the limits, and says what
 * happened (for logs; the person always gets the same answer). The record is saved before the
 * email goes out; a failed send throws, and the address can ask again. Unconfirmed records
 * past their keep time are deleted first, as nothing runs scheduled jobs yet (#141).
 */
export async function requestConfirmation(
  value: unknown,
  req: PayloadRequest,
): Promise<RequestOutcome> {
  const email = parseEmailAddress(value)
  if (!email) return 'invalid-address'

  const now = Date.now()
  await deleteUnconfirmedBefore(req, toUnconfirmedCutoff(now))

  const existing = await getConfirmationByEmail(req, email)
  if (existing?.confirmedAt) return 'already-confirmed'

  const addressCheck = checkAddressLimit(existing, now)
  if (!addressCheck.ok) return 'address-limit'
  const ip = parseClientIp(req.headers)
  if (ip && !connections.tryTake(ip, CONFIRMATION_LIMITS.perConnection, now)) {
    return 'connection-limit'
  }
  if (!siteWide.tryTake(SITE_WIDE, CONFIRMATION_LIMITS.siteWide, now)) return 'site-limit'

  const { token, tokenHash } = newConfirmationToken()
  await saveLinkSent(req, email, existing, {
    sendCount: addressCheck.sendCount,
    sendWindowStart: addressCheck.sendWindowStart,
    tokenHash,
    tokenExpiresAt: toTokenExpiry(now),
    lastSentAt: new Date(now).toISOString(),
  })

  await req.payload.sendEmail({
    to: email,
    ...toConfirmationEmail(toConfirmationLink(getServerSideURL(), token)),
  })
  return 'sent'
}
