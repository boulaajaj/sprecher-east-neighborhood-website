'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return (
    <div
      className="relative -mt-[10.4rem] flex min-h-[80vh] items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="absolute inset-0 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover" priority resource={media} />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/20" />
      <div className="relative z-10 container mb-8 flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4 md:justify-center">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
