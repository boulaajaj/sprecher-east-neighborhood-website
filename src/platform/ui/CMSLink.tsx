import type { ResolvedLink } from '@/platform/lib'
import { type CmsLink, resolveLink } from '@/platform/payload/resolveLink'
import { Button } from './Button'
import { Link } from './Link'
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
      <LinkButton link={resolved} className={className}>
        {children}
      </LinkButton>
    )
  }

  return (
    <Link href={resolved.href} external={resolved.external} className={className}>
      {resolved.label}
      {children}
    </Link>
  )
}

/** A resolved CMS link as a `Button` in the look the editor chose: `default` is primary, `outline` secondary. */
export function LinkButton({
  link,
  className,
  children,
}: {
  link: ResolvedLink
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Button
      href={link.href}
      external={link.external}
      variant={link.appearance === 'outline' ? 'secondary' : 'primary'}
      className={className}
    >
      {link.label}
      {children}
    </Button>
  )
}
