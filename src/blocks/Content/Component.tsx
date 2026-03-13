import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  type ColumnSize = 'full' | 'half' | 'oneThird' | 'twoThirds'

  const colSpanClasses: Record<ColumnSize, string> = {
    full: 'col-span-4 lg:col-span-12',
    half: 'col-span-4 lg:col-span-6',
    oneThird: 'col-span-4 lg:col-span-4',
    twoThirds: 'col-span-4 lg:col-span-8',
  }

  const colCount = columns?.length ?? 0
  const isMultiColumn = colCount > 1 && columns?.some((col) => col?.size !== 'full')
  const isFourColumns = colCount === 4 && columns?.every((col) => col?.size !== 'full')
  // Two-column content layout (e.g., twoThirds + oneThird) — no card styling
  const isContentColumns =
    isMultiColumn &&
    !isFourColumns &&
    colCount === 2 &&
    columns?.some((col) => col?.size !== 'half')
  // Card grid: 3+ equal columns (stats, features, etc.)
  const isCardGrid = isMultiColumn && !isFourColumns && !isContentColumns

  return (
    <div className={cn('py-8 md:py-10', (isCardGrid || isFourColumns) && 'bg-surface')}>
      <div className="container">
        <div
          className={cn({
            'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6': isFourColumns,
            'grid grid-cols-4 gap-x-6 gap-y-6 lg:grid-cols-12 lg:gap-x-8': isCardGrid,
            'grid grid-cols-4 gap-x-8 gap-y-8 lg:grid-cols-12 lg:gap-x-12': isContentColumns,
            'grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12': !isMultiColumn,
          })}
        >
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col

              return (
                <div
                  className={cn({
                    // Four-column stats grid — compact cards with icon-friendly styling
                    'col-span-1 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:p-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground':
                      isFourColumns,
                    [colSpanClasses[(size as ColumnSize) ?? 'full'] ?? colSpanClasses.full]:
                      !isFourColumns,
                    'md:col-span-2': isCardGrid && size !== 'full',
                    'rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:p-8':
                      isCardGrid,
                    // Content columns — clean text layout, no card boxes
                    '[&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground md:[&_h2]:text-4xl [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground md:[&_p]:text-lg':
                      isContentColumns && index === 0,
                    'flex flex-col justify-center rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground':
                      isContentColumns && index > 0,
                    // Single full-width column — readable width with accent border
                    'max-w-prose border-l-4 border-primary pl-6 md:pl-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground md:[&_h2]:text-3xl [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground':
                      !isMultiColumn,
                  })}
                  key={index}
                >
                  {richText && <RichText data={richText} enableGutter={false} />}

                  {enableLink && <CMSLink {...link} />}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
