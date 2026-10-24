import type { PayloadRequest } from 'payload'

import type { EmailConfirmation } from '@/payload-types'

import type { ConfirmationRecord } from '../domain/types'
import { EMAIL_CONFIRMATIONS } from '../domain/paths'

// Every call here runs for a visitor who may not read this collection (it is admin-only), or for
// the retention task, which runs as nobody, so access is bypassed on purpose: the server decides
// what to do, and the visitor never sees the record. Each call passes `req`, as Payload expects inside a request. No transaction runs today
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

/** The record whose latest link has this token hash, or `null`. */
export async function getConfirmationByTokenHash(
  req: PayloadRequest,
  tokenHash: string,
): Promise<ConfirmationRecord | null> {
  const { docs } = await req.payload.find({
    collection: EMAIL_CONFIRMATIONS,
    where: { tokenHash: { equals: tokenHash } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  return docs[0] ? toConfirmationRecord(docs[0]) : null
}

/**
 * Marks the record confirmed, and its welcome email as claimed, unless it already was. True only
 * for the request that changed it, so two clicks at once confirm, and welcome, once.
 *
 * This one write goes to the database adapter, not the Local API: Payload's `update` with a
 * `where` reads the matching rows first and then updates each by id, so two clicks at once both
 * win. The adapter's `updateOne` with a `where` puts the condition into the UPDATE itself, so
 * only one request changes the row; the other gets `null`. Nothing is skipped by going around
 * the Local API: this collection has no hooks, and access is bypassed here anyway. The adapter
 * doesn't set `updatedAt`, so it is set here.
 */
export async function markConfirmed(req: PayloadRequest, id: number, at: string): Promise<boolean> {
  const doc: unknown = await req.payload.db.updateOne({
    collection: EMAIL_CONFIRMATIONS,
    where: { and: [{ id: { equals: id } }, { confirmedAt: { exists: false } }] },
    data: { confirmedAt: at, welcomeSentAt: at, updatedAt: at },
    req,
  })
  return doc !== null && doc !== undefined
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

/**
 * Deletes unconfirmed records whose last link went out before `cutoff` (an ISO date), and says
 * how many.
 */
export async function deleteUnconfirmedBefore(
  req: PayloadRequest,
  cutoff: string,
): Promise<number> {
  const { docs } = await req.payload.delete({
    collection: EMAIL_CONFIRMATIONS,
    where: {
      and: [{ confirmedAt: { exists: false } }, { lastSentAt: { less_than: cutoff } }],
    },
    depth: 0,
    select: { email: true },
    overrideAccess: true,
    req,
  })
  return docs.length
}

/** Every record confirmed before `cutoff` (an ISO date): the address and its id. */
export async function findConfirmedBefore(
  req: PayloadRequest,
  cutoff: string,
): Promise<Array<{ id: number; email: string }>> {
  const { docs } = await req.payload.find({
    collection: EMAIL_CONFIRMATIONS,
    where: { confirmedAt: { less_than: cutoff } },
    pagination: false,
    depth: 0,
    select: { email: true },
    overrideAccess: true,
    req,
  })
  return docs.map(({ id, email }) => ({ id, email }))
}

/** Deletes these records, and says how many. */
export async function deleteConfirmations(
  req: PayloadRequest,
  ids: readonly number[],
): Promise<number> {
  if (ids.length === 0) return 0
  const { docs } = await req.payload.delete({
    collection: EMAIL_CONFIRMATIONS,
    where: { id: { in: [...ids] } },
    depth: 0,
    select: { email: true },
    overrideAccess: true,
    req,
  })
  return docs.length
}
