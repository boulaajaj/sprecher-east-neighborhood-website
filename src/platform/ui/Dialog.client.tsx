'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import React from 'react'

import { cn } from '@/platform/lib/cn'

import { Button } from './Button'

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Names the dialog for screen readers; `hideTitle` keeps it off screen */
  title: string
  hideTitle?: boolean
  /** The button that opens it; focus returns there when the dialog closes */
  trigger?: React.ReactNode
  /** What the close button says to screen readers */
  closeLabel?: string
  /** Element ids or classes for the panel: the mobile menu sets `lg:hidden` */
  className?: string
  children: React.ReactNode
}

/*
 * A modal panel (#437, docs/ui/component-set.md). `sheet` slides down under the sticky header and
 * fills the rest of the screen. Radix Dialog gives the behaviour: focus moves in and is trapped,
 * Escape and an outside click close it, the page behind is hidden from assistive tech and doesn't
 * scroll, and focus goes back to the trigger.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  trigger,
  closeLabel = 'Close',
  className,
  children,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-x-0 top-[var(--header-height)] bottom-0 z-40 bg-scrim/40" />
        <RadixDialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-x-0 top-[var(--header-height)] z-50 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-t border-border bg-background shadow-lg focus:outline-none',
            className,
          )}
        >
          <div className="container flex items-start justify-between gap-4 pt-4">
            <RadixDialog.Title
              className={cn('text-lg font-semibold text-foreground', hideTitle && 'sr-only')}
            >
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <Button variant="ghost" size="icon" className="ml-auto" aria-label={closeLabel}>
                <X aria-hidden="true" />
              </Button>
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
