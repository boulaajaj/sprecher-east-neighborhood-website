import { LoaderCircle } from 'lucide-react'
import React from 'react'

/**
 * A short line that says something is under way, such as a page confirming an email on load
 * (#300). Screen readers hear it politely; the icon only turns when motion is welcome.
 */
export function PendingStatus({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" aria-live="polite" className="flex items-center gap-2 text-foreground">
      <LoaderCircle aria-hidden className="size-5 shrink-0 text-primary motion-safe:animate-spin" />
      {children}
    </p>
  )
}
