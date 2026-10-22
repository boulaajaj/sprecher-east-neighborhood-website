import React from 'react'
import { ChevronDown } from 'lucide-react'

import { RichText } from '@/platform/richtext/RichText'

import type { FaqEntry } from '../domain/types'

/** FAQ entries as cards that open to show the answer (native `<details>`, no JavaScript). */
export function FaqList({ items }: { items: readonly FaqEntry[] }) {
  return (
    <div className="space-y-4">
      {items.map((faq) => (
        <details key={faq.id} className="group rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer list-none font-medium">
            <span className="flex items-center justify-between">
              {faq.question}
              <ChevronDown
                aria-hidden="true"
                className="ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </span>
          </summary>
          <div className="mt-4 border-t border-border pt-4">
            <RichText data={faq.answer} enableGutter={false} />
          </div>
        </details>
      ))}
    </div>
  )
}
