import 'server-only'

import { cache } from 'react'

import { getSessionUser } from '../data/session'
import type { CurrentUser } from '../domain/types'

/**
 * Who is signed in for this request, or null, checked by Payload's Local API. Cached per request,
 * so a page, its metadata and the checks it makes ask Payload once.
 */
export const getCurrentUser = cache((): Promise<CurrentUser | null> => getSessionUser())
