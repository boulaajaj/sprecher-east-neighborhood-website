import { Eye } from 'lucide-react'
import React from 'react'

/**
 * How a draft will look as a card in lists, shown above the page only in an editor's preview
 * (draft mode, #363), below the page's hero. The card inside is the site's own component, at the width a three-column
 * grid gives it, so editors see the image, categories, title and summary as residents will.
 */
export const CardPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="container mt-8">
    <aside
      aria-label="Card preview"
      className="rounded-2xl border border-dashed border-border bg-surface p-6"
    >
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <Eye aria-hidden="true" className="size-4 text-primary" />
          Card preview
        </span>
        How this shows in lists. Only editors see this box.
      </p>
      <div className="max-w-sm">{children}</div>
    </aside>
  </div>
)
