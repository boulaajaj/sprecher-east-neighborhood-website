import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import type { JSXConverterArgs } from '@payloadcms/richtext-lexical/react'
import { describe, expect, it } from 'vitest'

import type { BannerBlock as BannerFields, MediaBlock as MediaFields } from '@/payload-types'

import { BannerBlock } from './BannerBlock'
import { RICH_TEXT_BLOCKS } from './blockConfigs'
import { CodeBlock, type CodeBlockProps } from './CodeBlock'
import { MediaBlock } from './MediaBlock'
import { richTextBlocks } from './richTextBlocks'

/** The arguments Lexical passes a block renderer; these renderers read only `node`. */
const argsFor = <T extends { blockType: string }>(fields: T) =>
  ({ node: { type: 'block', version: 2, format: '', fields } }) as unknown as JSXConverterArgs<
    SerializedBlockNode<T>
  >

describe('richTextBlocks', () => {
  it('has a renderer for every block a post may hold, and no other', () => {
    expect(Object.keys(richTextBlocks).sort()).toEqual(
      RICH_TEXT_BLOCKS.map((block) => block.slug).sort(),
    )
  })

  it('draws a banner in the middle column', () => {
    const content: BannerFields['content'] = {
      root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
    }
    const fields: BannerFields = { blockType: 'banner', style: 'warning', content }
    const element = richTextBlocks.banner(argsFor(fields))

    expect(element.type).toBe(BannerBlock)
    expect(element.props).toMatchObject({ className: 'col-start-2 mb-4', style: 'warning' })
  })

  it('draws a code block in the middle column', () => {
    const fields: CodeBlockProps = { blockType: 'code', code: 'let a = 1', language: 'css' }
    const element = richTextBlocks.code(argsFor(fields))

    expect(element.type).toBe(CodeBlock)
    expect(element.props).toMatchObject({
      className: 'col-start-2',
      code: 'let a = 1',
      language: 'css',
    })
  })

  it('draws a media block across all columns, without its own gutter or container', () => {
    const fields: MediaFields = { blockType: 'mediaBlock', media: 4 }
    const element = richTextBlocks.mediaBlock(argsFor(fields))

    expect(element.type).toBe(MediaBlock)
    expect(element.props).toMatchObject({
      className: 'col-span-3 col-start-1',
      imgClassName: 'm-0',
      captionClassName: 'mx-auto max-w-[48rem]',
      enableGutter: false,
      disableInnerContainer: true,
      media: 4,
    })
  })
})
