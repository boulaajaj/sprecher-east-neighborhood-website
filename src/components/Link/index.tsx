import { type CmsLink, resolveLink } from '@/platform/payload/resolveLink'
import { Button, Link } from '@/platform/ui'
import React from 'react'

type CMSLinkProps = Omit<CmsLink, 'appearance'> & {
  /** `default` and `outline` (from the CMS) draw a `Button`; none draws a text `Link` */
  appearance?: CmsLink['appearance']
  children?: React.ReactNode
  className?: string
}

/** A link field from the CMS, drawn as a `Button` or a text link. The href comes from `resolveLink`. */
export const CMSLink: React.FC<CMSLinkProps> = ({ appearance, children, className, ...link }) => {
  const resolved = resolveLink({
    ...link,
    appearance: appearance === 'outline' ? 'outline' : 'default',
  })
  if (!resolved) return null

  if (appearance === 'default' || appearance === 'outline') {
    return (
      <Button
        href={resolved.href}
        external={resolved.external}
        variant={resolved.appearance === 'outline' ? 'secondary' : 'primary'}
        className={className}
      >
        {resolved.label}
        {children}
      </Button>
    )
  }

  return (
    <Link href={resolved.href} external={resolved.external} className={className}>
      {resolved.label}
      {children}
    </Link>
  )
}
