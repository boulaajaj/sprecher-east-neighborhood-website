import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Redirect } from '@/payload-types'

// The data functions are replaced: this tests the use case's decisions, not Payload
const data = vi.hoisted(() => ({ listRedirects: vi.fn(), getDocumentById: vi.fn() }))
vi.mock('../data/redirects', () => ({ listRedirects: data.listRedirects }))
vi.mock('../data/documents', () => ({ getDocumentById: data.getDocumentById }))

import { getRedirectTarget } from './getRedirectTarget'

const redirect = (from: string, to: Redirect['to']): Redirect => ({
  id: 1,
  from,
  to,
  updatedAt: '',
  createdAt: '',
})

beforeEach(() => {
  data.listRedirects.mockReset()
  data.getDocumentById.mockReset()
})

describe('getRedirectTarget', () => {
  it('is null when no redirect starts at the address', async () => {
    data.listRedirects.mockResolvedValue([redirect('/old', { url: '/new' })])

    expect(await getRedirectTarget('/other')).toBeNull()
  })

  it('sends a custom redirect to its URL', async () => {
    data.listRedirects.mockResolvedValue([redirect('/old', { type: 'custom', url: '/new' })])

    expect(await getRedirectTarget('/old')).toBe('/new')
  })

  it('sends a redirect to a post to the post’s address', async () => {
    data.listRedirects.mockResolvedValue([
      redirect('/old', {
        type: 'reference',
        reference: { relationTo: 'posts', value: { id: 3, slug: 'park-cleanup' } as never },
      }),
    ])

    expect(await getRedirectTarget('/old')).toBe('/posts/park-cleanup')
  })

  it('looks a target given by ID up as a visitor, and sends the redirect to its address', async () => {
    data.listRedirects.mockResolvedValue([
      redirect('/old', { type: 'reference', reference: { relationTo: 'pages', value: 5 } }),
    ])
    data.getDocumentById.mockResolvedValue({ id: 5, slug: 'home' })

    expect(await getRedirectTarget('/old')).toBe('/')
    expect(data.getDocumentById).toHaveBeenCalledWith('pages', 5)
  })

  it('is null when the target is a draft or gone, so nothing leaks', async () => {
    data.listRedirects.mockResolvedValue([
      redirect('/old', { type: 'reference', reference: { relationTo: 'pages', value: 5 } }),
    ])
    data.getDocumentById.mockResolvedValue(null)

    expect(await getRedirectTarget('/old')).toBeNull()
  })

  it('is null when the redirect has neither a URL nor a target', async () => {
    data.listRedirects.mockResolvedValue([redirect('/old', {})])

    expect(await getRedirectTarget('/old')).toBeNull()
  })
})
