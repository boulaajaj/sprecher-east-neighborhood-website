import { describe, expect, it } from 'vitest'

import { toAgentAnswer, toAgentView } from './agentView'

// A small allowlist in the shape of the real one (`cms/agentViews.ts`)
const VIEWS = {
  posts: ['id', 'title', 'slug', 'categories', 'meta', 'sourceName', '_status'],
  categories: ['id', 'title'],
  'agent-runs': ['id', 'runId', 'agent', 'sourcesChecked', 'counts'],
}

const author = { id: 1, name: 'Ana Admin', email: 'ana@example.com', createdAt: '2026-01-01' }

const post = {
  id: 5,
  title: 'Road work on Sprecher Rd',
  slug: 'road-work',
  content: { root: { children: [] } },
  authors: [author],
  populatedAuthors: [{ id: '1', name: 'Ana Admin' }],
  categories: [{ id: 3, title: 'Roads', createdAt: '2026-01-01' }],
  meta: { title: 'Road work', description: 'Lanes closed', image: { id: 9, createdAt: 'x' } },
  sourceName: 'City of Madison',
  _status: 'published',
}

describe('toAgentView', () => {
  it('keeps only the allowlisted fields, with related documents as ids', () => {
    expect(toAgentView(VIEWS, 'posts', post)).toEqual({
      id: 5,
      title: 'Road work on Sprecher Rd',
      slug: 'road-work',
      categories: [3],
      meta: { title: 'Road work', description: 'Lanes closed' },
      sourceName: 'City of Madison',
      _status: 'published',
    })
  })

  it('never shows authors, rich text or anything from a collection without a view', () => {
    const text = JSON.stringify(toAgentView(VIEWS, 'posts', post))
    expect(text).not.toContain('Ana')
    expect(text).not.toContain('example.com')
    expect(toAgentView(VIEWS, 'users', author)).toEqual({})
    expect(toAgentView(VIEWS, 'form-submissions', { id: 1, submissionData: [] })).toEqual({})
  })

  it('keeps array rows and groups of a run, but reduces its agent to an id', () => {
    const sourcesChecked = [{ id: 'row1', sourceId: 'city-calendar', cursor: '2026-10-24' }]
    const run = { id: 2, runId: 'scout-1', agent: author, sourcesChecked, counts: { seen: 4 } }
    expect(toAgentView(VIEWS, 'agent-runs', run)).toEqual({
      id: 2,
      runId: 'scout-1',
      agent: 1,
      sourcesChecked,
      counts: { seen: 4 },
    })
  })
})

describe('toAgentAnswer', () => {
  it('rebuilds a list answer from the views, with its totals', () => {
    const answer = toAgentAnswer(VIEWS, 'posts', 'Collection: "posts"', {
      docs: [post],
      totalDocs: 1,
      page: 1,
      totalPages: 1,
    })
    expect(answer?.split('\n').slice(0, 3)).toEqual([
      'Collection: "posts"',
      'Total: 1 documents',
      'Page: 1 of 1',
    ])
    expect(answer).not.toContain('Ana')
  })

  it('rebuilds a single document answer, and leaves error answers alone', () => {
    expect(toAgentAnswer(VIEWS, 'categories', 'Created:', { id: 3, title: 'Roads', x: 1 })).toBe(
      'Created:\n{"id":3,"title":"Roads"}',
    )
    expect(toAgentAnswer(VIEWS, 'posts', 'Error', {})).toBeNull()
  })
})
