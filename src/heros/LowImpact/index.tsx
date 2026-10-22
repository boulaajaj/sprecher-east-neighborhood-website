import React from 'react'

import type { Page } from '@/payload-types'

import { RichText } from '@/platform/richtext/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-[48rem]">
        {children ||
          (richText && (
            <RichText
              // Match the h1 used on /events and /posts (prose renders it light)
              className="[&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-balance md:[&_h1]:text-5xl"
              data={richText}
              enableGutter={false}
            />
          ))}
      </div>
    </div>
  )
}
