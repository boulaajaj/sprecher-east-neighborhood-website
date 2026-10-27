// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { ImageRef } from '@/platform/lib/content'
import { PageHeader } from '@/platform/ui/PageHeader'

import type { PostDetail } from '../domain/types'
import { postHeaderProps } from './postHeader'

afterEach(cleanup)

const photo = { id: 3, alt: 'Neighbors at the park', url: '/api/media/file/park.webp' } as ImageRef

const post: PostDetail = {
  id: 7,
  slug: 'road-study',
  href: '/posts/road-study',
  title: 'Road study hearings',
  publishedAt: '2026-10-01T12:00:00.000Z',
  categories: [{ id: 1, title: 'Transportation' }],
  description: null,
  image: null,
  heroImage: photo,
  content: {
    root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
  },
  authors: ['Ana', 'Ben'],
  relatedPosts: [],
  createdAt: '2026-09-30T12:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  meta: { title: null, description: null, image: null },
}

describe('postHeaderProps', () => {
  it('puts a post on its hero photo with its byline and date (#461)', () => {
    const props = postHeaderProps(post)
    expect(props).toMatchObject({ variant: 'image', image: photo, title: 'Road study hearings' })

    render(<PageHeader {...props} />)
    expect(screen.getByText('Author').nextElementSibling?.textContent).toBe('Ana and Ben')
    expect(
      screen.getByText('Date Published').nextElementSibling?.querySelector('time'),
    ).not.toBeNull()
    expect(screen.getByText('Transportation').className).toContain('bg-scrim/60')
  })

  it('heads a post without a photo plainly, never white text on the page', () => {
    const props = postHeaderProps({ ...post, heroImage: null, authors: [] })
    expect(props.variant).toBeUndefined()

    render(<PageHeader {...props} />)
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('text-foreground')
    expect(screen.queryByText('Author')).toBeNull()
    expect(screen.getByText('Transportation').className).toContain('text-primary-strong')
  })
})
