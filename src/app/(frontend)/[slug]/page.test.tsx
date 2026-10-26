// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The site module is replaced: this tests the page's wiring, not the module
const site = vi.hoisted(() => ({
  getPageBySlug: vi.fn(),
  listPageSlugs: vi.fn(),
  redirects: vi.fn(),
  hero: vi.fn(),
  blocks: vi.fn(),
}))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }))
vi.mock('@/modules/site/server', () => ({
  getPageBySlug: site.getPageBySlug,
  listPageSlugs: site.listPageSlugs,
  PayloadRedirects: (props: unknown) => {
    site.redirects(props)
    return null
  },
  RenderHero: (props: unknown) => {
    site.hero(props)
    return null
  },
  RenderBlocks: (props: unknown) => {
    site.blocks(props)
    return null
  },
}))
vi.mock('./pageBlocks', () => ({ pageBlocks: { marker: 'the block registry' } }))
import { homeStatic } from '@/endpoints/seed/home-static'

import Page, { generateStaticParams } from './page'

afterEach(cleanup)
beforeEach(() => vi.clearAllMocks())

const params = (slug?: string) => ({ params: Promise.resolve(slug ? { slug } : {}) })

describe('/[slug]', () => {
  it('draws the page’s hero, then its blocks with the block registry', async () => {
    const hero = { type: 'lowImpact' }
    const layout = [{ blockType: 'content', id: 'b1' }]
    site.getPageBySlug.mockResolvedValue({ slug: 'about', hero, layout })

    render(await Page(params('about')))

    expect(site.getPageBySlug).toHaveBeenCalledWith('about')
    expect(site.hero).toHaveBeenCalledWith(hero)
    expect(site.blocks).toHaveBeenCalledWith({
      blocks: layout,
      components: { marker: 'the block registry' },
    })
    expect(site.redirects).toHaveBeenCalledWith({ disableNotFound: true, url: '/about' })
  })

  it('shows the home page at the root, and the starter home page before the seed', async () => {
    site.getPageBySlug.mockResolvedValue(null)

    render(await Page(params()))

    expect(site.getPageBySlug).toHaveBeenCalledWith('home')
    expect(site.blocks).toHaveBeenCalledWith(expect.objectContaining({ blocks: homeStatic.layout }))
  })

  it('follows a redirect, or answers 404, when there is no such page', async () => {
    site.getPageBySlug.mockResolvedValue(null)

    render(await Page(params('gone')))

    expect(site.redirects).toHaveBeenCalledExactlyOnceWith({ url: '/gone' })
    expect(site.blocks).not.toHaveBeenCalled()
  })
})

describe('generateStaticParams', () => {
  it('builds every published page except home, which is the root', async () => {
    site.listPageSlugs.mockResolvedValue([
      { slug: 'home', updatedAt: '' },
      { slug: 'about', updatedAt: '' },
    ])

    expect(await generateStaticParams()).toEqual([{ slug: 'about' }])
  })

  it('builds none, instead of failing the build, when the database is unreachable', async () => {
    site.listPageSlugs.mockRejectedValue(new Error('no database'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await generateStaticParams()).toEqual([])
  })
})
