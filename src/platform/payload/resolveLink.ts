/**
 * The CMS link field (`src/fields/link.ts`) as plain data for `Button` and `Link`: the one place
 * that turns a reference or a custom URL into an `href`. Typed structurally, so any collection's
 * populated document works and an unpopulated ID resolves to nothing.
 */
export type CmsLink = {
  type?: 'reference' | 'custom' | null
  url?: string | null
  label?: string | null
  newTab?: boolean | null
  appearance?: 'default' | 'outline' | null
  reference?: {
    relationTo: string
    value: number | string | { slug?: string | null }
  } | null
}

export type ResolvedLink = {
  href: string
  label: string
  /** Opens in a new tab */
  external: boolean
  /** The `Button` variant the editor chose */
  variant: 'primary' | 'secondary'
}

export function resolveLink(link: CmsLink | null | undefined): ResolvedLink | null {
  if (!link) return null

  const href = link.type === 'reference' ? referenceHref(link.reference) : link.url
  if (!href) return null

  return {
    href,
    label: link.label ?? '',
    external: Boolean(link.newTab),
    variant: link.appearance === 'outline' ? 'secondary' : 'primary',
  }
}

function referenceHref(reference: CmsLink['reference']): string | null {
  const slug = typeof reference?.value === 'object' ? reference.value.slug : null
  if (!reference || !slug) return null

  // Pages live at the root; every other collection under its own path
  return reference.relationTo === 'pages' ? `/${slug}` : `/${reference.relationTo}/${slug}`
}
