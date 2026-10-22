import type { LexicalRichTextAdapter } from '@payloadcms/richtext-lexical'
import type { Field, SanitizedConfig } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { RICH_TEXT_BLOCKS } from '@/platform/richtext/blockConfigs'

/**
 * Where modules meet in the CMS (docs/architecture decision 0008): checks the composed config,
 * loaded for real with no database, so a module dropped from the composition fails here.
 */

let config: SanitizedConfig

beforeAll(async () => {
  config = await (await import('@payload-config')).default
}, 60_000)

/** Every field, including those inside tabs, rows and groups. */
function allFields(fields: Field[]): Field[] {
  return fields.flatMap((field) => {
    if (field.type === 'tabs') return field.tabs.flatMap((tab) => allFields(tab.fields))
    if ('fields' in field && field.type !== 'array') {
      return [field, ...allFields(field.fields)]
    }
    return [field]
  })
}

const collection = (slug: string) => {
  const found = config.collections.find((c) => c.slug === slug)
  if (!found) throw new Error(`No ${slug} collection`)
  return found
}

describe('a post’s content', () => {
  it('can hold the rich-text blocks, and the post page has a renderer for each', () => {
    const content = allFields(collection('posts').fields).find(
      (field) => 'name' in field && field.name === 'content',
    )
    if (content?.type !== 'richText') throw new Error('Posts have no rich-text content')
    // The sanitized field carries the Lexical adapter, which knows its features
    const editor = content.editor as LexicalRichTextAdapter
    const blocksFeature = editor.editorConfig.resolvedFeatureMap.get('blocks')
    const props = blocksFeature?.sanitizedServerFeatureProps as { blocks?: { slug: string }[] }

    expect(props.blocks?.map((block) => block.slug)).toEqual(
      RICH_TEXT_BLOCKS.map((block) => block.slug),
    )
  })
})
