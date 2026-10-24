import { describe, expect, it } from 'vitest'

import type { Category, Media, Post, Search } from '@/payload-types'

import {
  toCategoryIds,
  toPickedPosts,
  toPostDetail,
  toPostSummary,
  toSearchResult,
} from './mappers'

const image = { id: 4, alt: 'Park shelter', url: '/api/media/file/park.jpg' } as Media
const hero = { id: 5, alt: 'Street', url: '/api/media/file/street.jpg' } as Media
const news = { id: 1, title: 'Neighborhood News', slug: 'neighborhood-news' } as Category
const city = { id: 2, title: 'City Updates', slug: 'city-updates' } as Category
const content: Post['content'] = {
  root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
}

const related: Post = {
  id: 8,
  slug: 'park-cleanup',
  title: 'Park cleanup recap',
  content,
  publishedAt: '2026-09-01T12:00:00.000Z',
  categories: [news],
  meta: { description: 'Thanks, everyone.', image },
  updatedAt: '2026-09-01T12:00:00.000Z',
  createdAt: '2026-09-01T12:00:00.000Z',
}

const doc: Post = {
  id: 7,
  slug: 'road-study',
  title: 'Road study hearings',
  heroImage: hero,
  content,
  relatedPosts: [related, 9],
  categories: [news, city],
  meta: { title: 'Hearings', description: 'Public hearings.', image },
  publishedAt: '2026-10-01T12:00:00.000Z',
  populatedAuthors: [{ id: '1', name: 'Ana' }, { id: '2', name: null }, { id: '3', name: 'Ben' }],
  updatedAt: '2026-10-02T12:00:00.000Z',
  createdAt: '2026-09-30T12:00:00.000Z',
}

describe('toPostSummary', () => {
  it('keeps what a card shows and names the image', () => {
    expect(toPostSummary(doc)).toEqual({
      id: 7,
      slug: 'road-study',
      href: '/posts/road-study',
      title: 'Road study hearings',
      publishedAt: '2026-10-01T12:00:00.000Z',
      categories: [
        { id: 1, title: 'Neighborhood News' },
        { id: 2, title: 'City Updates' },
      ],
      description: 'Public hearings.',
      image,
    })
  })

  it('turns missing fields into null and an empty category list', () => {
    expect(toPostSummary({ id: 3, slug: 'hello', title: 'Hello' })).toEqual({
      id: 3,
      slug: 'hello',
      href: '/posts/hello',
      title: 'Hello',
      publishedAt: null,
      categories: [],
      description: null,
      image: null,
    })
  })

  it('drops categories and images that are only ids (not loaded)', () => {
    const summary = toPostSummary({
      id: 3,
      slug: 'hello',
      title: 'Hello',
      categories: [1, city],
      meta: { image: 4 },
    })
    expect(summary.categories).toEqual([{ id: 2, title: 'City Updates' }])
    expect(summary.image).toBeNull()
  })

  it('names a category without a title "Untitled category"', () => {
    const summary = toPostSummary({ ...doc, categories: [{ ...news, title: '' }] })
    expect(summary.categories).toEqual([{ id: 1, title: 'Untitled category' }])
  })
})

describe('toPostDetail', () => {
  it('adds the hero, content, byline names, dates and search-engine fields', () => {
    expect(toPostDetail(doc)).toMatchObject({
      heroImage: hero,
      content,
      authors: ['Ana', 'Ben'],
      createdAt: '2026-09-30T12:00:00.000Z',
      updatedAt: '2026-10-02T12:00:00.000Z',
      meta: { title: 'Hearings', description: 'Public hearings.', image },
    })
  })

  it('keeps only the related posts the reader may see, in the editor’s order', () => {
    // A related post the reader may not see (a draft) comes back as its id only
    expect(toPostDetail(doc).relatedPosts).toEqual([toPostSummary(related)])
  })

  it('has no authors, related posts or images when none are set', () => {
    expect(toPostDetail(related)).toMatchObject({
      heroImage: null,
      authors: [],
      relatedPosts: [],
      meta: { title: null, description: 'Thanks, everyone.', image },
    })
  })
})

describe('toCategoryIds', () => {
  it('takes the id of each category, loaded or not', () => {
    expect(toCategoryIds([news, 2])).toEqual([1, 2])
  })

  it('returns an empty list when no categories are set', () => {
    expect(toCategoryIds(null)).toEqual([])
    expect(toCategoryIds(undefined)).toEqual([])
  })
})

describe('toPickedPosts', () => {
  it('shows the picked posts the reader may see, in the editor’s order', () => {
    expect(
      toPickedPosts([
        { relationTo: 'posts', value: related },
        { relationTo: 'posts', value: 9 },
        { relationTo: 'posts', value: doc },
      ]),
    ).toEqual([toPostSummary(related), toPostSummary(doc)])
  })

  it('returns an empty list when nothing is picked', () => {
    expect(toPickedPosts(null)).toEqual([])
    expect(toPickedPosts(undefined)).toEqual([])
  })
})

describe('toSearchResult', () => {
  const hit: Pick<Search, 'id' | 'doc' | 'title' | 'slug' | 'categories' | 'meta'> = {
    id: 12,
    doc: { relationTo: 'posts', value: 7 },
    title: 'Road study hearings',
    slug: 'road-study',
    categories: [
      { relationTo: 'categories', categoryID: '1', title: 'Neighborhood News' },
      { relationTo: 'categories', categoryID: '2', title: '' },
    ],
    meta: { title: 'Hearings', description: 'Public hearings.', image },
  }

  it('shows a search entry as a post card, with the categories it copied', () => {
    expect(toSearchResult(hit)).toEqual({
      id: 12,
      slug: 'road-study',
      href: '/posts/road-study',
      title: 'Road study hearings',
      publishedAt: null,
      categories: [
        { id: 1, title: 'Neighborhood News' },
        { id: 2, title: 'Untitled category' },
      ],
      description: 'Public hearings.',
      image,
    })
  })

  it('links an event to the event’s page, not a post’s (#200)', () => {
    const event = { ...hit, doc: { relationTo: 'events' as const, value: 3 }, slug: 'council' }
    expect(toSearchResult(event)?.href).toBe('/events/council')
  })

  it('leaves out an entry without a slug: it has no page to link to', () => {
    expect(toSearchResult({ ...hit, slug: null })).toBeNull()
  })

  it('turns missing fields into empty text, null and an empty category list', () => {
    expect(toSearchResult({ id: 13, doc: { relationTo: 'events', value: 3 }, slug: 'x' })).toEqual({
      id: 13,
      slug: 'x',
      href: '/events/x',
      title: '',
      publishedAt: null,
      categories: [],
      description: null,
      image: null,
    })
  })
})
