import type { PayloadRequest } from 'payload'

import type { EmailConfirmation } from '@/payload-types'

import type { ConfirmationRecord } from '../domain/types'
import { EMAIL_CONFIRMATIONS } from './emailConfirmations'

// Every call here runs for a visitor who may not read this collection (it is admin-only), so
// access is bypassed on purpose: the server decides what to do, and the visitor never sees the
// record. Each call passes `req`, as Payload expects inside a request. No transaction runs today
// (the SQLite adapter has no `transactionOptions`); callers outside this folder go through
// `withOwnTransaction`, so if one ever does, a failure here can't undo the caller's work.

/** Maps a stored document to the record the rules read. */
export function toConfirmationRecord(doc: EmailConfirmation): ConfirmationRecord {
  return {
    id: doc.id,
    email: doc.email,
    confirmedAt: doc.confirmedAt || null,
    tokenExpiresAt: doc.tokenExpiresAt || null,
    sendCount: doc.sendCount ?? 0,
    sendWindowStart: doc.sendWindowStart || null,
    welcomeSentAt: doc.welcomeSentAt || null,
  }
}

/** The record for this (already normalized) address, or `null`. */
export async function getConfirmationByEmail(
  req: PayloadRequest,
  email: string,
): Promise<ConfirmationRecord | null> {
  const { docs } = await req.payload.find({
    collection: EMAIL_CONFIRMATIONS,
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    pagination: false,
    // The per-address window is in hidden fields
    showHiddenFields: true,
    overrideAccess: true,
    req,
  })
  return docs[0] ? toConfirmationRecord(docs[0]) : null
}

/** What a new link changes on a record. */
export type LinkSent = Pick<ConfirmationRecord, 'sendCount' | 'sendWindowStart'> & {
  tokenHash: string
  tokenExpiresAt: string
  lastSentAt: string
}

/** Stores a new link for the address: creates its record, or updates the one there is. */
export async function saveLinkSent(
  req: PayloadRequest,
  email: string,
  existing: ConfirmationRecord | null,
  link: LinkSent,
): Promise<void> {
  if (existing) {
    await req.payload.update({
      collection: EMAIL_CONFIRMATIONS,
      id: existing.id,
      data: link,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return
  }
  await req.payload.create({
    collection: EMAIL_CONFIRMATIONS,
    data: { email, ...link },
    depth: 0,
    overrideAccess: true,
    req,
  })
}

/** Deletes unconfirmed records whose last link went out before `cutoff` (an ISO date). */
export async function deleteUnconfirmedBefore(req: PayloadRequest, cutoff: string): Promise<void> {
  await req.payload.delete({
    collection: EMAIL_CONFIRMATIONS,
    where: {
      and: [{ confirmedAt: { exists: false } }, { lastSentAt: { less_than: cutoff } }],
    },
    depth: 0,
    overrideAccess: true,
    req,
  })
}
