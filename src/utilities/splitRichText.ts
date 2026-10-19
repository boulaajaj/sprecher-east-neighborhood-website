type LexicalDocument = {
  root: { children: Array<{ type: unknown }> }
}

/**
 * Splits a Lexical document into its first heading and everything else, so a
 * layout can style the title and the description separately without rendering
 * the rich text twice (which would duplicate the <h1> in the DOM).
 */
export function splitHeadingFromBody<T extends LexicalDocument>(
  data: T | null | undefined,
): { heading: T | null; body: T | null } {
  const children = data?.root?.children
  if (!data || !Array.isArray(children)) return { heading: null, body: null }

  const withChildren = (nodes: T['root']['children']): T | null =>
    nodes.length > 0 ? { ...data, root: { ...data.root, children: nodes } } : null

  // The title is the first heading; everything else (other headings included) is the body
  const titleIndex = children.findIndex((node) => node.type === 'heading')
  return {
    heading: withChildren(titleIndex === -1 ? [] : children.slice(titleIndex, titleIndex + 1)),
    body: withChildren(children.filter((_node, index) => index !== titleIndex)),
  }
}
