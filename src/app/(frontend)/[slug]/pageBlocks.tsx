import React from 'react'

import { FormBlock } from '@/modules/contact/server'
import { findArchivePosts, PostGrid } from '@/modules/news/server'
import {
  ArchiveBlock,
  CallToActionBlock,
  ContentBlock,
  type PageBlockComponents,
} from '@/modules/site/server'
import { MediaBlock } from '@/platform/richtext/MediaBlock'

/** The archive block with the posts it lists: site draws the block, news loads the posts. */
const ArchiveWithPosts: PageBlockComponents['archive'] = async (block) => {
  const posts = await findArchivePosts(block)
  return (
    <ArchiveBlock {...block}>
      <PostGrid posts={posts} />
    </ArchiveBlock>
  )
}

/**
 * The block registry: which module's component draws each page-builder block type. Modules meet
 * here, not in each other (docs/architecture decision 0008).
 */
export const pageBlocks: PageBlockComponents = {
  archive: ArchiveWithPosts,
  content: ContentBlock,
  cta: CallToActionBlock,
  // @ts-expect-error The contact form types its form with the form-builder plugin's `Form`, which
  // the generated `Form` doesn't match; the page query populates it, as before #135
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}
