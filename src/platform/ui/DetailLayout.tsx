import React from 'react'

import { cn } from '@/platform/lib/cn'

export type DetailLayoutProps = {
  /** The page's main content */
  children: React.ReactNode
  /** What goes beside it: related items, a call to action */
  aside: React.ReactNode
  className?: string
}

/*
 * A post's or an event's page under its hero (#434): the content, with a sidebar that sits below it
 * on phones and tablets and sticks beside it from `lg`, where there is room for both.
 */
export function DetailLayout({ children, aside, className }: DetailLayoutProps) {
  return (
    <div className={cn('container lg:grid lg:grid-cols-[1fr_18rem] lg:gap-8', className)}>
      <div className="min-w-0">{children}</div>
      <aside className="mt-12 space-y-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">{aside}</aside>
    </div>
  )
}
