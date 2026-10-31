import { describe, expect, it } from 'vitest'

import type { RichTextValue } from '@/platform/lib'

import type { FaqCategory, ResourceCategory } from './categories'
import { toFaqSections, toResourceSections } from './sections'
import type { FaqEntry, ResourceSummary } from './types'

const answer: RichTextValue = {
  root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
}

const faq = (id: number, category?: FaqCategory | null): FaqEntry => ({
  id,
  question: `Question ${id}`,
  answer,
  category,
})

const resource = (id: number, category: ResourceCategory): ResourceSummary => ({
  id,
  title: `Resource ${id}`,
  category,
})

const ids = (sections: { items: { id: number }[] }[]) =>
  sections.map(({ items }) => items.map(({ id }) => id))

describe('toFaqSections', () => {
  it('groups entries in category order, labelled, keeping their order within each', () => {
    const sections = toFaqSections([
      faq(1, 'neighborhood'),
      faq(2, 'general'),
      faq(3, 'membership'),
      faq(4, 'general'),
    ])

    expect(sections.map(({ category, label }) => [category, label])).toEqual([
      ['general', 'General'],
      ['membership', 'Membership'],
      ['neighborhood', 'Neighborhood'],
    ])
    expect(ids(sections)).toEqual([[2, 4], [3], [1]])
  })

  it('leaves out categories with no entries', () => {
    expect(toFaqSections([faq(1, 'events')]).map(({ category }) => category)).toEqual(['events'])
  })

  it('files an entry with no category under General', () => {
    const sections = toFaqSections([faq(1, null), faq(2), faq(3, 'membership')])

    expect(sections.map(({ label }) => label)).toEqual(['General', 'Membership'])
    expect(ids(sections)).toEqual([[1, 2], [3]])
  })

  it('files an entry whose category is not on the list under General', () => {
    const stale = { ...faq(1), category: 'retired' as FaqCategory }

    expect(ids(toFaqSections([stale, faq(2, 'general')]))).toEqual([[1, 2]])
  })

  it('returns no sections when there are no entries', () => {
    expect(toFaqSections([])).toEqual([])
  })
})

describe('toResourceSections', () => {
  it('groups resources in category order, labelled, keeping their order within each', () => {
    const sections = toResourceSections([
      resource(1, 'parks'),
      resource(2, 'elected-officials'),
      resource(3, 'parks'),
      resource(4, 'childcare'),
    ])

    expect(sections.map(({ label }) => label)).toEqual([
      'Elected Officials',
      'Childcare & Education',
      'Parks & Recreation',
    ])
    expect(ids(sections)).toEqual([[2], [4], [1, 3]])
  })

  it('files a resource whose category is not on the list under Other', () => {
    // A row saved before an option was removed keeps its old value
    const stale = { ...resource(1, 'other'), category: 'retired' as ResourceCategory }
    const sections = toResourceSections([stale, resource(2, 'other')])

    expect(sections.map(({ category }) => category)).toEqual(['other'])
    expect(ids(sections)).toEqual([[1, 2]])
  })
})
