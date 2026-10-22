import { type CmsLink, resolveLink } from '@/platform/payload/resolveLink'
import { Button, Link } from '@/platform/ui'
import React from 'react'

type CMSLinkProps = Omit<CmsLink, 'appearance'> & {
  /** `default` and `outline` (from the CMS) draw a `Button`; anything else a text `Link` */
  appearance?: 'inline' | CmsLink['appearance']
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

  if (appearance === 'default' || appearance === 'outline') {
    return (
      <Button
        href={resolved.href}
        external={resolved.external}
        variant={resolved.appearance === 'outline' ? 'secondary' : 'primary'}
        className={className}
        aria-current={ariaCurrent ? 'page' : undefined}
      >
        {resolved.label}
        {children}
      </Button>
    )
  }

  return (
    <Link
      href={resolved.href}
      external={resolved.external}
      current={ariaCurrent}
      className={className}
    >
      {resolved.label}
      {children}
    </Link>
  )
}
