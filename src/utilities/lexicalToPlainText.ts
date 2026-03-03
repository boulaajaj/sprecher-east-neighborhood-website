/**
 * Extracts plain text from a Lexical editor JSON structure.
 * Used for generating structured data (JSON-LD) where HTML is not allowed.
 */
export function lexicalToPlainText(data: unknown): string {
  if (!data || typeof data !== 'object') return ''

  const root = (data as Record<string, unknown>).root
  if (!root || typeof root !== 'object') return ''

  return extractText(root as Record<string, unknown>).trim()
}

function extractText(node: Record<string, unknown>): string {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text
  }

  if (node.type === 'linebreak') {
    return '\n'
  }

  const children = node.children
  if (!Array.isArray(children)) return ''

  return children
    .map((child) => {
      if (typeof child !== 'object' || child === null) return ''
      const text = extractText(child as Record<string, unknown>)
      // Add newline after block-level elements
      const type = (child as Record<string, unknown>).type as string
      if (type === 'paragraph' || type === 'heading') {
        return text + '\n'
      }
      return text
    })
    .join('')
}
