import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div
      className="bg-gradient-to-br from-primary to-primary-dark py-10 md:py-14"
      data-theme="dark"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:gap-12 md:text-left">
          <div className="max-w-[48rem] flex-1">
            {richText && (
              <RichText
                className="mb-0 text-white [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-white [&_p]:text-lg [&_p]:text-white/90 [&_strong]:text-white"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
            {(links || []).map(({ link }, i) => {
              return (
                <CMSLink
                  key={i}
                  {...link}
                  size="clear"
                  className={cn(
                    'inline-flex h-auto min-h-11 items-center justify-center rounded-lg px-8 py-3 text-base font-semibold whitespace-normal transition-all motion-safe:hover:-translate-y-0.5',
                    // This block is a data-theme="dark" scope: --primary-dark is the brand
                    // #3d7a5e there (5.1:1 on white); --primary would be #4e9b76 (3.4:1).
                    i === 0
                      ? 'bg-white text-primary-dark shadow-lg hover:bg-white/95 hover:shadow-xl'
                      : 'border-2 border-white bg-transparent text-white shadow-none hover:bg-white/10',
                  )}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
