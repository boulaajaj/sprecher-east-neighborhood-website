import { describe, expect, it, vi } from 'vitest'

const findEventsAfter = vi.hoisted(() =>
  vi.fn(async () => ({ docs: [], nextCursor: null, totalDocs: 0 })),
)
vi.mock('./use-cases/findEventsAfter', () => ({ findEventsAfter }))

import { loadMoreEvents } from './actions'

const CURSOR = '2026-10-19T00:00:00.000Z|42'

describe('loadMoreEvents', () => {
  it('passes a valid scope and cursor to the use case', async () => {
    await loadMoreEvents('past', CURSOR)
    expect(findEventsAfter).toHaveBeenCalledWith('past', {
      key: '2026-10-19T00:00:00.000Z',
      id: 42,
    })
  })

  it.each([
    ['a page number instead of a cursor', 'upcoming', 2],
    ['a bad date', 'upcoming', '2026-02-30T00:00:00.000Z|1'],
    ['an extra field', 'upcoming', `${CURSOR}|1`],
    ['a cursor that is too long', 'upcoming', `${CURSOR}${'0'.repeat(64)}`],
    ['a Payload query', 'upcoming', { date: { exists: true } }],
    ['an unknown scope', 'all', CURSOR],
  ])('refuses %s without querying', async (_label, scope, cursor) => {
    findEventsAfter.mockClear()
    await expect(loadMoreEvents(scope, cursor)).rejects.toThrow('Invalid request')
    expect(findEventsAfter).not.toHaveBeenCalled()
  })
})
