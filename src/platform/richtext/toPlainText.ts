import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import type { RichTextValue } from '@/platform/lib'

/**
 * Rich text as plain text, for places that can't hold HTML such as structured data (JSON-LD).
 * Payload's converter: blocks are separated by a blank line, list items by a line break.
 */
export function richTextToPlainText(value: RichTextValue | null | undefined): string {
  return value ? convertLexicalToPlaintext({ data: value }) : ''
}
