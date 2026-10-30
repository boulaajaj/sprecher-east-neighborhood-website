import React from 'react'

import { cn } from '@/platform/lib/cn'
import { Card } from '@/platform/ui/Card'

import type { DiagramKeyItem, DiagramKeyProps } from './diagramKey'

/**
 * The legend under an annotated image (#515): numbered circles in the accent colour, the orange
 * the site's diagrams use for their markers, each with a bold label and a short line. Two columns
 * from `sm`, in a muted `Card` tight to the image above (`-mt-4` pulls it toward the caption). The circles are
 * decoration; screen readers hear "Marker 2: Westbound entrance loop" from a hidden prefix.
 */
export function DiagramKey({ items, className }: DiagramKeyProps & { className?: string }) {
  if (items.length === 0) return null
  return (
    <Card
      variant="muted"
      padding="sm"
      className={cn('not-prose -mt-4 mb-10 w-full md:p-6', className)}
    >
      {/* `role="list"`: Safari drops list semantics from a list without bullets */}
      <ol
        role="list"
        aria-label="Diagram key"
        className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2"
      >
        {items.map((item, index) => (
          <KeyItem key={`${index}-${item.label}`} item={item} number={index + 1} />
        ))}
      </ol>
    </Card>
  )
}

function KeyItem({ item, number }: { item: DiagramKeyItem; number: number }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground ring-2 ring-background"
      >
        {number}
      </span>
      <p className="pt-0.5 text-base leading-snug text-foreground">
        <span className="sr-only">Marker {number}: </span>
        {item.label && <span className="font-semibold">{item.label}</span>}
        {/* The dot stays on the label's line (no-break space before it); screen readers hear a
            colon instead of "middle dot" */}
        {item.label && item.text && (
          <>
            <span className="sr-only">: </span>
            <span aria-hidden="true" className="text-muted-foreground">
              {'\u00a0· '}
            </span>
          </>
        )}
        {item.text}
      </p>
    </li>
  )
}
