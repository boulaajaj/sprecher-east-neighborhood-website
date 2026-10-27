import React, { type ReactNode } from 'react'

import { RichText } from '@/platform/richtext/RichText'
import { Section } from '@/platform/ui/Section'

import type { ArchiveBlockProps } from '../domain/blocks'

/**
 * Page-builder block that lists posts (the home page's "Recent News", B16): the editor's intro,
 * then the posts, which the block registry in `src/app/` loads from news and passes in (0008).
 */
export function ArchiveBlock({
  id,
  intro,
  children,
}: ArchiveBlockProps & {
  /** The list of posts */
  children: ReactNode
}) {
  return (
    <Section tone="surface" spacing="sm" id={id ? `block-${id}` : undefined}>
      {intro && (
        <RichText
          className="ms-0 mb-8 max-w-[48rem] [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-foreground md:[&_h3]:text-3xl [&_p]:mt-2 [&_p]:text-muted-foreground"
          data={intro}
          enableGutter={false}
        />
      )}
      {children}
    </Section>
  )
}
