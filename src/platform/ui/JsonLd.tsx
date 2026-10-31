import React from 'react'

/**
 * Safely renders a JSON-LD script tag by escaping `<` characters to prevent
 * XSS when CMS content contains `</script>` or other HTML-like strings.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
