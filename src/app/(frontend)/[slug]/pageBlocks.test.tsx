import { isValidElement, type ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { ArchiveBlock as ArchiveBlockFields } from '@/payload-types'

// The modules are replaced with stand-ins: this tests which module draws each block type
const modules = vi.hoisted(() => ({
  findArchivePosts: vi.fn(),
  PostGrid: () => null,
  FormBlock: () => null,
  ArchiveBlock: () => null,
  CallToActionBlock: () => null,
  ContentBlock: () => null,
}))
vi.mock('@/modules/news/server', () => ({
  findArchivePosts: modules.findArchivePosts,
  PostGrid: modules.PostGrid,
}))
vi.mock('@/modules/contact/server', () => ({ FormBlock: modules.FormBlock }))
vi.mock('@/modules/site/server', () => ({
  ArchiveBlock: modules.ArchiveBlock,
  CallToActionBlock: modules.CallToActionBlock,
  ContentBlock: modules.ContentBlock,
}))

import { MediaBlock } from '@/platform/richtext/MediaBlock'

import { pageBlocks } from './pageBlocks'

describe('pageBlocks', () => {
  it('draws each block type with its module’s component', () => {
    expect(pageBlocks.content).toBe(modules.ContentBlock)
    expect(pageBlocks.cta).toBe(modules.CallToActionBlock)
    expect(pageBlocks.formBlock).toBe(modules.FormBlock)
    expect(pageBlocks.mediaBlock).toBe(MediaBlock)
  })

  it('draws the archive block around the posts news loads for it', async () => {
    const posts = [{ id: 1, slug: 'park-cleanup' }]
    modules.findArchivePosts.mockResolvedValue(posts)
    const block: ArchiveBlockFields = { blockType: 'archive', id: 'a1', populateBy: 'collection' }

    const element = (await (pageBlocks.archive as (b: ArchiveBlockFields) => unknown)(
      block,
    )) as ReactElement<{ children: ReactElement }>

    expect(modules.findArchivePosts).toHaveBeenCalledWith(block)
    expect(element.type).toBe(modules.ArchiveBlock)
    expect(element.props).toMatchObject({ id: 'a1', populateBy: 'collection' })
    expect(isValidElement(element.props.children)).toBe(true)
    expect(element.props.children.type).toBe(modules.PostGrid)
    expect(element.props.children.props).toEqual({ posts })
  })
})
