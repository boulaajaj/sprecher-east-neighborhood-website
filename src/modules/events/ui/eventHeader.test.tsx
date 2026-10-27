// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { ImageRef } from '@/platform/lib/content'
import { PageHeader } from '@/platform/ui/PageHeader'

import type { EventDetail } from '../domain/types'
import { eventHeaderProps } from './eventHeader'

afterEach(cleanup)

const event: EventDetail = {
  id: 7,
  slug: 'potluck',
  title: 'Fall potluck',
  date: '2026-11-02T00:00:00.000Z',
  timeStart: '6:00 PM',
  timeEnd: '8:00 PM',
  categories: [{ id: 1, title: 'Social' }],
  description: 'Bring a dish.',
  locationName: 'Park shelter',
  image: null,
  locationType: 'in-person',
  locationAddress: '4605 Sprecher Rd',
  mapsHref: null,
  registrationUrl: null,
  content: null,
  meta: { title: null, description: null, image: null },
}

const photo = { id: 3, alt: 'The park shelter', url: '/api/media/file/shelter.webp' } as ImageRef

describe('eventHeaderProps', () => {
  it('heads an event without a photo plainly, with its category pill and facts (#461)', () => {
    const props = eventHeaderProps(event)
    expect(props.variant).toBeUndefined()

    render(<PageHeader {...props} />)
    expect(screen.getByText('Social').className).toContain('text-primary-strong')
    expect(screen.getByText('Time').nextElementSibling?.textContent).toMatch(/^6:00 PM – 8:00 PM /)
    expect(screen.getByText('Format').nextElementSibling?.textContent).toBe('In Person')
    expect(screen.getByText('Date').nextElementSibling?.querySelector('time')).not.toBeNull()
  })

  it('puts an event with a photo on it, its category on the photo', () => {
    const props = eventHeaderProps({ ...event, image: photo })
    expect(props).toMatchObject({ variant: 'image', image: photo, title: 'Fall potluck' })

    render(<PageHeader {...props} />)
    expect(screen.getByText('Social').className).toContain('bg-scrim/60')
  })

  it('leaves out the time and format it does not know', () => {
    render(<PageHeader {...eventHeaderProps({ ...event, timeStart: null, locationType: null })} />)

    expect(screen.queryByText('Time')).toBeNull()
    expect(screen.queryByText('Format')).toBeNull()
  })
})
