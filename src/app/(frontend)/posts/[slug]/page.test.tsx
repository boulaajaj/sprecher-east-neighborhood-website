// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { richTextBlocks } from '@/platform/richtext/richTextBlocks'

// The modules are replaced: this tests the page's wiring, not news, events or the renderer
const mocks = vi.hoisted(() => ({
  getPostBySlug: vi.fn(),
  richText: vi.fn(),
  redirects: vi.fn(),
}))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }))
vi.mock('@/modules/news/server', () => ({
  findRecentPosts: async () => [],
  getPostBySlug: mocks.getPostBySlug,
  listPostSlugs: async () => [],
  PostHero: () => null,
  postJsonLd: () => ({}),
  SidebarPosts: () => null,
}))
vi.mock('@/modules/events/server', () => ({
  findUpcomingEvents: async () => [],
  SidebarEvents: () => null,
}))
vi.mock('@/platform/richtext/RichText', () => ({
  RichText: (props: unknown) => {
    mocks.richText(props)
    return null
  },
}))
vi.mock('@/components/PayloadRedirects', () => ({
  PayloadRedirects: (props: unknown) => {
    mocks.redirects(props)
    return null
  },
}))
vi.mock('./page.client', () => ({ default: () => null }))

import PostPage from './page'

afterEach(cleanup)
beforeEach(() => vi.clearAllMocks())

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('/posts/[slug]', () => {
  it('renders the post’s content with the rich-text blocks a post may hold', async () => {
    const content = { root: { type: 'root', children: [] } }
    mocks.getPostBySlug.mockResolvedValue({ slug: 'park-cleanup', title: 'Park cleanup', content })

    render(await PostPage(params('park-cleanup')))

    expect(mocks.getPostBySlug).toHaveBeenCalledWith('park-cleanup')
    expect(mocks.richText).toHaveBeenCalledWith(
      expect.objectContaining({ data: content, blocks: richTextBlocks }),
    )
  })

  it('follows a redirect, or answers 404, when there is no such post', async () => {
    mocks.getPostBySlug.mockResolvedValue(null)

    render(await PostPage(params('gone')))

    expect(mocks.redirects).toHaveBeenCalledWith({ url: '/posts/gone' })
    expect(mocks.richText).not.toHaveBeenCalled()
  })
})
