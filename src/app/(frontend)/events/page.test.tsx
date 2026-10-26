// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The events module is replaced: this tests what the page says when a list is empty
const pages = vi.hoisted(() => ({ upcoming: 0, past: 0 }))
vi.mock('@/modules/events/server', () => ({
  EventsFeed: () => null,
  findEventPage: async (scope: 'upcoming' | 'past') => ({
    items: [],
    totalDocs: pages[scope],
    hasMore: false,
    firstItemNumber: 1,
  }),
}))
import EventsPage from './page'

afterEach(cleanup)

describe('/events with no upcoming events', () => {
  it('points to past events when there are some', async () => {
    pages.past = 3
    render(await EventsPage())

    expect(screen.getByText('No upcoming events are posted right now.')).toBeTruthy()
    expect(screen.getByText(/browse past events below/)).toBeTruthy()
  })

  it("doesn't point to past events that aren't there (#206)", async () => {
    pages.past = 0
    render(await EventsPage())

    expect(screen.getByText('No upcoming events are posted right now.')).toBeTruthy()
    expect(screen.queryByText(/past events/)).toBeNull()
  })
})
