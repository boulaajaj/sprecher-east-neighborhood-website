import { type CmsLink, resolveLink } from '@/platform/payload/resolveLink'
import { Button } from '@/platform/ui'
import Link from 'next/link'
import React from 'react'

type CMSLinkProps = Omit<CmsLink, 'appearance'> & {
  /** `default` and `outline` (from the CMS) draw a `Button`; `inline` and `link` a text link */
  appearance?: 'inline' | 'link' | CmsLink['appearance']
  /** Marks the link as the current page for assistive tech (aria-current="page"). */
  ariaCurrent?: boolean
  children?: React.ReactNode
  className?: string
}

/** A link field from the CMS, drawn as a `Button` or a text link. The href comes from `resolveLink`. */
export const CMSLink: React.FC<CMSLinkProps> = ({
  appearance = 'inline',
  ariaCurrent,
  children,
  className,
  ...link
}) => {
  const resolved = resolveLink({
    ...link,
    appearance: appearance === 'outline' ? 'outline' : 'default',
  })
  if (!resolved) return null

  const currentProps = ariaCurrent ? { 'aria-current': 'page' as const } : {}

  if (appearance === 'default' || appearance === 'outline') {
    return (
      <Button
        href={resolved.href}
        external={resolved.external}
        variant={resolved.appearance === 'outline' ? 'secondary' : 'primary'}
        className={className}
        {...currentProps}
      >
        {resolved.label}
        {children}
      </Button>
    )
  }

  // Text links: the styles come from the caller or the surrounding rich text (until `Link`, #210)
  const newTabProps = resolved.external ? { rel: 'noopener noreferrer', target: '_blank' } : {}
  return (
    <Link className={className} href={resolved.href} {...newTabProps} {...currentProps}>
      {resolved.label}
      {children}
    </Link>
  )
}
