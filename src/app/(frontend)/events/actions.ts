'use server'

import { findPublishedEvents, isEventScope, parsePageNumber } from '@/utilities/feeds'

/** Next page of published upcoming or past events for the /events listing. */
export async function loadEventsPage(scope: unknown, page: unknown) {
  const pageNumber = parsePageNumber(page)
  if (!isEventScope(scope) || pageNumber === null) throw new Error('Invalid request')
  return findPublishedEvents(scope, pageNumber)
}
