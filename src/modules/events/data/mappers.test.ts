import { describe, expect, it } from 'vitest'

import type { Event, Media } from '@/payload-types'

import { SUMMARY_FIELDS, toEventDetail, toEventSummary } from './mappers'

const image = { id: 4, alt: 'Park shelter', url: '/api/media/file/park.jpg' } as Media

const doc: Event = {
  id: 7,
  slug: 'potluck',
  title: 'Fall potluck',
  date: '2026-11-02T00:00:00.000Z',
  timeStart: '6:00 PM',
  timeEnd: '8:00 PM',
  cancelled: false,
  categories: [{ id: 3, title: 'Social', slug: 'social', updatedAt: '', createdAt: '' }, 9],
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
      cancelled: false,
      categories: [{ id: 3, title: 'Social' }],
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
      cancelled: false,
      categories: [],
      description: null,
      locationName: null,
      image: null,
    })
  })

  it('carries the cancelled flag to the card and the page (#122)', () => {
    expect(toEventSummary({ ...doc, cancelled: true }).cancelled).toBe(true)
    expect(toEventDetail({ ...doc, cancelled: true }).cancelled).toBe(true)
    expect(toEventSummary({ ...doc, cancelled: null }).cancelled).toBe(false)
  })

  it('selects the flag, so listings can show it', () => {
    expect(SUMMARY_FIELDS).toHaveProperty('cancelled', true)
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
