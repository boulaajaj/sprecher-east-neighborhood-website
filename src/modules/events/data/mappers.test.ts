import { describe, expect, it } from 'vitest'

import type { Event, Media } from '@/payload-types'

import { toEventDetail, toEventSummary } from './mappers'

const image = { id: 4, alt: 'Park shelter', url: '/api/media/file/park.jpg' } as Media

const doc: Event = {
  id: 7,
  slug: 'potluck',
  title: 'Fall potluck',
  date: '2026-11-02T00:00:00.000Z',
  timeStart: '6:00 PM',
  timeEnd: '8:00 PM',
  category: 'social',
  description: 'Bring a dish.',
  locationType: 'in-person',
  locationName: 'Park shelter',
  locationAddress: '4605 Sprecher Rd',
  mapsUrl: null,
  registrationUrl: 'https://example.com/register',
  heroImage: image,
  content: null,
  meta: { title: 'Potluck', description: 'A potluck', image },
  updatedAt: '2026-10-01T12:00:00.000Z',
  createdAt: '2026-10-01T12:00:00.000Z',
}

describe('toEventSummary', () => {
  it('keeps what a card shows and names the image', () => {
    expect(toEventSummary(doc)).toEqual({
      id: 7,
      slug: 'potluck',
      title: 'Fall potluck',
      date: '2026-11-02T00:00:00.000Z',
      timeStart: '6:00 PM',
      timeEnd: '8:00 PM',
      category: 'social',
      description: 'Bring a dish.',
      locationName: 'Park shelter',
      image,
    })
  })

  it('turns missing fields into null', () => {
    const summary = toEventSummary({
      id: 8,
      slug: 'cleanup',
      title: 'Park cleanup',
      date: '2026-11-03T00:00:00.000Z',
    })
    expect(summary).toMatchObject({
      timeStart: null,
      timeEnd: null,
      category: null,
      description: null,
      locationName: null,
      image: null,
    })
  })

  it('drops an image that was not loaded, which is only an id', () => {
    expect(toEventSummary({ ...doc, heroImage: 4 }).image).toBeNull()
  })
})

describe('toEventDetail', () => {
  it('adds the place, links, content and search fields', () => {
    expect(toEventDetail(doc)).toMatchObject({
      locationType: 'in-person',
      locationAddress: '4605 Sprecher Rd',
      mapsHref: 'https://www.google.com/maps/search/?api=1&query=4605%20Sprecher%20Rd',
      registrationUrl: 'https://example.com/register',
      content: null,
      meta: { title: 'Potluck', description: 'A potluck', image },
    })
  })

  it('has empty search fields when the event has none', () => {
    expect(toEventDetail({ ...doc, meta: undefined }).meta).toEqual({
      title: null,
      description: null,
      image: null,
    })
  })
})
