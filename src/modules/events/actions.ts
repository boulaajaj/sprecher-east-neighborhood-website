'use server'

import { parsePageNumber } from '@/platform/lib'

import { isEventScope } from './domain/upcoming'
import { listEventPage } from './use-cases/listEventPage'

/** Next page of published upcoming or past events for the /events listing ("Load more"). */
export async function loadEventsPage(scope: unknown, page: unknown) {
  const pageNumber = parsePageNumber(page)
  if (!isEventScope(scope) || pageNumber === null) throw new Error('Invalid request')
  return listEventPage(scope, pageNumber)
}
