import { Eye } from 'lucide-react'
import React from 'react'

/**
 * How a draft will look as a card in lists, shown below the page's hero only in an editor's
 * preview (draft mode, #363). The children lay the site's own card out in its list's own grid,
 * inside the same container, so the card gets the width residents see at every breakpoint. The
 * dashed frame is an outline, which takes no space.
 */
export const CardPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="container mt-8">
    <aside
      aria-label="Card preview"
      className="rounded-2xl bg-surface outline-2 outline-offset-8 outline-border outline-dashed"
    >
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <Eye aria-hidden="true" className="size-4 text-primary" />
          Card preview
        </span>
        How this shows in lists. Only editors see this box.
      </p>
      {children}
    </aside>
  </div>
)
