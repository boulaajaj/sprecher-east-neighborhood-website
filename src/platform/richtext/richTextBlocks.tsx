import React from 'react'

import { BannerBlock } from './BannerBlock'
import { CodeBlock } from './CodeBlock'
import { Timeline } from './editorial/Timeline'
import { toTimelineProps } from './editorial/timeline'
import { MediaBlock } from './MediaBlock'
import type { RichTextBlocks } from './RichText'

/**
 * Renderers for the blocks in `RICH_TEXT_BLOCKS`, for `RichText`'s `blocks` prop.
 * Post and event pages pass this map to RichText; event content offers the media and editorial
 * blocks (`EVENT_RICH_TEXT_BLOCKS`).
 */
export const richTextBlocks = {
  banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
  mediaBlock: ({ node }) => (
    <MediaBlock
      className="col-span-3 col-start-1"
      imgClassName="m-0"
      {...node.fields}
      captionClassName="mx-auto max-w-[48rem]"
      enableGutter={false}
      disableInnerContainer={true}
    />
  ),
  code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
  timeline: ({ node }) => <Timeline className="col-start-2" {...toTimelineProps(node.fields)} />,
} satisfies RichTextBlocks
