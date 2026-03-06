import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colSpanClasses: Record<string, string> = {
    full: 'col-span-4 lg:col-span-12',
    half: 'col-span-4 lg:col-span-6',
    oneThird: 'col-span-4 lg:col-span-4',
    twoThirds: 'col-span-4 lg:col-span-8',
  }

  const isMultiColumn = (columns?.length ?? 0) > 1 && columns?.some((col) => col?.size !== 'full')
  const isFourColumns = (columns?.length ?? 0) === 4

  return (
    <div className={cn('py-16 md:py-20', isMultiColumn && 'bg-surface')}>
      <div className="container">
        <div
          className={cn({
            'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8': isFourColumns,
            'grid grid-cols-4 gap-x-6 gap-y-6 lg:grid-cols-12 lg:gap-x-8':
              isMultiColumn && !isFourColumns,
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
                    'col-span-1': isFourColumns,
                    [colSpanClasses[size ?? 'full']]: !isFourColumns,
                    'md:col-span-2': isMultiColumn && !isFourColumns && size !== 'full',
                    'rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:p-8':
                      isMultiColumn,
                    'mx-auto max-w-3xl text-center [&_h2]:mb-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground md:[&_h2]:text-4xl lg:[&_h2]:text-5xl [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground md:[&_p]:text-lg':
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
