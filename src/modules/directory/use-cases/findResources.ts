import 'server-only'

import type { ResourceSummary } from '../domain/types'
import * as queries from '../data/queries'

/** Every published resource, lowest `order` first; `toResourceSections` groups them by category. */
export function findResources(): Promise<ResourceSummary[]> {
  return queries.findResources()
}
