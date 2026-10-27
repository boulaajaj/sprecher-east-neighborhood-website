import { expect } from 'vitest'

import type { FeedMore, FeedPage } from '@/platform/lib'

type Listed = { id: number }

/**
 * Reads a listing to its end as "Load more" does (#125): the first numbered page, then the items
 * after each cursor. `between` runs after the first page, while the reader is looking at it, and
 * may change content. Returns every id in the order received, repeats included (the client drops
 * them; the tests check there are none).
 */
export async function readListing({
  first,
  after,
  between,
}: {
  first: () => Promise<FeedPage<Listed>>
  after: (cursor: string) => Promise<FeedMore<Listed>>
  between?: (onScreen: number[]) => Promise<void>
}): Promise<number[]> {
  const page = await first()
  const ids = page.docs.map((doc) => doc.id)
  await between?.(ids)

  let cursor = page.nextCursor
  // A bound, so a cursor that never advances fails the test instead of hanging it
  for (let loads = 0; cursor !== null; loads++) {
    if (loads > 100) throw new Error('The listing never ended')
    const next = await after(cursor)
    ids.push(...next.docs.map((doc) => doc.id))
    cursor = next.nextCursor
  }
  return ids
}

/**
 * The reader saw every item the listing now holds, once each and in its order: nothing skipped,
 * nothing repeated. `changed` (the item edited between loads) is left out: it may show where it
 * was and again where it went, and the client drops the repeat.
 */
export function expectEveryItemOnce(read: number[], listing: number[], changed?: number) {
  const others = (ids: number[]) => ids.filter((id) => id !== changed)
  const seen = others(read)
  expect(new Set(seen).size, 'an item was repeated').toBe(seen.length)
  expect(seen.filter((id) => listing.includes(id))).toEqual(others(listing))
}
