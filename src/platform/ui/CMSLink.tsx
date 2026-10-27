import React from 'react'

import type { ResolvedLink } from '@/platform/lib'

import { Button } from './Button'

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
