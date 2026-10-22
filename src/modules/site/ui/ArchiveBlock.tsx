import type { ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import React, { type ReactNode } from 'react'
import { RichText } from '@/platform/richtext/RichText'

/**
 * Page-builder block that lists posts (the home page's "Recent News"): the editor's intro, then
 * the posts, which the block registry in `src/app/` loads from news and passes in (0008).
 */
export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    /** The list of posts */
    children: ReactNode
  }
> = ({ id, introContent, children }) => {
  return (
    <div className="bg-surface py-8 md:py-10" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-8">
          <RichText
            className="ms-0 max-w-[48rem] [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-foreground md:[&_h3]:text-3xl [&_p]:mt-2 [&_p]:text-muted-foreground"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}
      {children}
    </div>
  )
}
