import type { CollectionAfterChangeHook } from 'payload'

import { getServerSideURL } from '@/platform/lib/getURL'

import { toAcknowledgmentEmail } from '../domain/acknowledgment'
import { capFormEmails } from './rateLimits'

/**
 * A hook that tells a sender whose address is already confirmed that their message arrived
 * (#274). It runs after the form builder's email step, which has just sent the message on to its
 * recipients. An unconfirmed sender gets nothing here: their message waits, and the welcome email
 * that follows their click says it arrived. The email counts toward the site-wide hourly cap;
 * a failed send is logged and the message stays stored. Never throws.
 * Reads `data` (what `recordSenderEmail` set), not `doc`, as `requestSenderConfirmation` does.
 */
export const acknowledgeConfirmedSender: CollectionAfterChangeHook = async ({
  data,
  doc,
  operation,
  req,
}) => {
  const to = data.senderEmail
  if (operation !== 'create' || data.emailConfirmed !== true || typeof to !== 'string' || !to) {
    return doc
  }
  const [email] = capFormEmails(
    [{ to, ...toAcknowledgmentEmail(getServerSideURL()) }],
    req.payload.logger,
  )
  if (!email) return doc
  try {
    await req.payload.sendEmail(email)
  } catch (error) {
    req.payload.logger.error(
      `Acknowledgment of form submission ${doc.id} could not be sent (${error instanceof Error ? error.name : 'error'})`,
    )
  }
  return doc
}
