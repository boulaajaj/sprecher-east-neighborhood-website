import React from 'react'

import { CodeBlock } from '@/platform/richtext/CodeBlock'
import { RichText } from '@/platform/richtext/RichText'

import { GalleryEntry, GalleryVariant } from './GalleryEntry'
import { SAMPLE_CODE, SAMPLE_RICH_TEXT } from './sampleData'

/** The rich-text renderer and the code block inside it */
export function RichTextGallery() {
  return (
    <>
      <GalleryEntry name="RichText" description="Lexical content as the editor saved it.">
        <GalleryVariant label="prose (the default)" className="block">
          <RichText data={SAMPLE_RICH_TEXT} enableGutter={false} />
        </GalleryVariant>
        <GalleryVariant label="without prose" className="block">
          <RichText data={SAMPLE_RICH_TEXT} enableGutter={false} enableProse={false} />
        </GalleryVariant>
      </GalleryEntry>

      <GalleryEntry
        name="CodeBlock"
        description="A code block inside rich text, with a copy button."
      >
        <GalleryVariant label="one look" className="block">
          <CodeBlock blockType="code" code={SAMPLE_CODE} language="ts" />
        </GalleryVariant>
      </GalleryEntry>
    </>
  )
}
