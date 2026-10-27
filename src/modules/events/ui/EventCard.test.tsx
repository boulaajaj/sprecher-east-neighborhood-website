// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

import type { EventSummary } from '../domain/types'
import { EventCard } from './EventCard'
import { SidebarEvents } from './SidebarEvents'

afterEach(cleanup)

const event: EventSummary = {
  id: 7,
  slug: 'potluck',
  title: 'Fall potluck',
  date: '2026-11-02T00:00:00.000Z',
  timeStart: '6:00 PM',
  timeEnd: null,
  cancelled: false,
  categories: [{ id: 1, title: 'Social' }],
  description: 'Bring a dish.',
  locationName: 'Park shelter',
  image: null,
}
const cancelled = { ...event, cancelled: true }

describe('EventCard, for a cancelled event (#122)', () => {
  it.each([
    ['the full card', false],
    ['the compact card', true],
  ])('labels %s "Cancelled" in words, inside the title’s link', async (_, compact) => {
    const { container } = render(<EventCard event={cancelled} compact={compact} />)

    const link = screen.getByRole('link', { name: 'Cancelled: Fall potluck' })
    expect(link.getAttribute('href')).toBe('/events/potluck')
    expect(screen.getByRole('heading', { name: 'Cancelled: Fall potluck' })).toBeDefined()
    // Text and an icon, not colour alone; the icon is decoration
    const label = screen.getByText('Cancelled')
    expect(label.className).toContain('text-destructive-strong')
    expect(label.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    await expectAccessible(container)
  })

  it('keeps the rest of the card: date, time, place and category', () => {
    const { container } = render(<EventCard event={cancelled} />)

    expect(container.querySelector('time')).not.toBeNull()
    expect(screen.getByText('6:00 PM', { exact: false })).toBeDefined()
    expect(screen.getByText('Park shelter')).toBeDefined()
    expect(screen.getByText('Social')).toBeDefined()
  })

  it.each([false, true])('shows no label on an event that goes ahead (compact: %s)', (compact) => {
    render(<EventCard event={event} compact={compact} />)

    expect(screen.queryByText('Cancelled')).toBeNull()
    expect(screen.getByRole('link', { name: 'Fall potluck' })).toBeDefined()
  })
})

describe('SidebarEvents, with a cancelled event (#122)', () => {
  it('lists it with its "Cancelled" label, next to one that goes ahead', async () => {
    const { container } = render(
      <SidebarEvents
        events={[cancelled, { ...event, id: 8, slug: 'cleanup', title: 'Cleanup' }]}
      />,
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    const link = screen.getByRole('link', { name: /Fall potluck/ })
    expect(link.textContent).toContain('Cancelled')
    expect(screen.getByRole('link', { name: /Cleanup/ }).textContent).not.toContain('Cancelled')
    await expectAccessible(container)
  })
})
