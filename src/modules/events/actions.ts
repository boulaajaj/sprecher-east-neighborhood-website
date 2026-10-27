'use server'

import { parseCursor } from '@/platform/lib'

import { isEventScope } from './domain/scope'
import { findEventsAfter } from './use-cases/findEventsAfter'

/**
 * The next published upcoming or past events for the /events listing ("Load more"): those after
 * `cursor`, the opaque string the previous page returned (#125).
 */
export async function loadMoreEvents(scope: unknown, cursor: unknown) {
  const after = parseCursor(cursor)
  if (!isEventScope(scope) || after === null) throw new Error('Invalid request')
  return findEventsAfter(scope, after)
}
