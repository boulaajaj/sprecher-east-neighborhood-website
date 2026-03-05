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

  const isMultiColumn = columns && columns.length > 1 && columns[0]?.size !== 'full'

  return (
    <div className="container py-16 md:py-20">
      <div
        className={cn('grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12', {
          'gap-x-8 gap-y-6 lg:gap-x-12': isMultiColumn,
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
                  'rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8': isMultiColumn,
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
  )
}
