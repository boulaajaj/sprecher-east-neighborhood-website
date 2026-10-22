import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import type { JSXConverters, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { LinkJSXConverter, RichText as ConvertRichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { cn } from '@/platform/lib/cn'
import type { RichTextValue } from '@/platform/lib'
import { documentHref } from '@/platform/payload/documentHref'
import type { BannerBlock, MediaBlock } from '@/payload-types'

import type { CodeBlockProps } from './CodeBlock'

/** A node for one of the blocks an editor can put inside rich text (`RICH_TEXT_BLOCKS`) */
export type RichTextBlockNode = SerializedBlockNode<BannerBlock | CodeBlockProps | MediaBlock>

type NodeTypes = DefaultNodeTypes | RichTextBlockNode

/**
 * Renderers for the blocks a rich-text field may hold, by block type. The caller passes them in
 * (the post page passes `richTextBlocks`), so this file imports no block, and a block can render
 * rich text of its own without an import cycle (#135).
 */
export type RichTextBlocks = NonNullable<JSXConverters<NodeTypes>['blocks']>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields.doc
  if (!doc) return '/'
  const { value, relationTo } = doc
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  return documentHref(relationTo, typeof value.slug === 'string' ? value.slug : '')
}

const withBlocks =
  (blocks: RichTextBlocks): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    blocks,
  })

const NO_BLOCKS = withBlocks({})

type Props = {
  data: RichTextValue
  /** Renderers for the blocks this field may hold; a block with none renders nothing */
  blocks?: RichTextBlocks
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/** Rich text as the editor saved it, with links to pages and posts resolved to site addresses. */
export function RichText(props: Props) {
  const { blocks, className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={blocks ? withBlocks(blocks) : NO_BLOCKS}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
          // Without a gutter the parent sets the width: full width, no prose 65ch cap
          // (otherwise `mx-auto` shrinks and centres the text inside flex cards). A max-w-*
          // passed in className still wins, because tailwind-merge drops this max-w-none.
          'w-full max-w-none': !enableGutter,
        },
        className,
      )}
      {...rest}
    />
  )
}
