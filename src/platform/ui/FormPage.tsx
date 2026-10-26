import React from 'react'

import { cn } from '@/platform/lib/cn'

export type FormPageProps = {
  /** `md` for a single form, `lg` for a page of panels (the account page) */
  width?: 'md' | 'lg'
  /** `center` sets a short form in the middle of the screen; `top` lets a long page start high */
  align?: 'center' | 'top'
  children: React.ReactNode
}

/*
 * A page that holds one form or one message (#439): log in, sign up, password and confirmation
 * pages, the account page. A narrow column with a `PageHeader variant="compact"` at its top.
 */
export function FormPage({ width = 'md', align = 'center', children }: FormPageProps) {
  return (
    <div className={cn('container py-16', align === 'center' && 'flex min-h-[60vh] items-center')}>
      <div className={cn('mx-auto w-full', width === 'md' ? 'max-w-md' : 'max-w-lg')}>
        {children}
      </div>
    </div>
  )
}
