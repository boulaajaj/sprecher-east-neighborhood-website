import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const isMultiColumn = (columns?.length ?? 0) > 1 && columns?.some((col) => col?.size !== 'full')

  return (
    <div className={cn('py-16 md:py-20', isMultiColumn && 'bg-surface')}>
      <div className="container">
        <div
          className={cn('grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12', {
            'gap-x-6 gap-y-6 lg:gap-x-8': isMultiColumn,
          })}
        >
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                    'rounded-2xl border border-border bg-card p-6 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:p-8':
                      isMultiColumn,
                    'max-w-prose [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground md:[&_h2]:text-4xl [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground':
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
