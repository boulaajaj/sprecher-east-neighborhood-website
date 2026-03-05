import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container">
      <div className="flex flex-col gap-6 rounded-2xl bg-primary/5 p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div className="max-w-[48rem]">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
