import 'server-only'

import type { FaqEntry } from '../domain/types'
import * as queries from '../data/queries'

/** Every published FAQ entry, lowest `order` first; `toFaqSections` groups them by category. */
export function findFaqEntries(): Promise<FaqEntry[]> {
  return queries.findFaqEntries()
}
