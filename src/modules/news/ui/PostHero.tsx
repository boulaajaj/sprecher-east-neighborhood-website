import React from 'react'

import { Badge, BadgeList } from '@/platform/ui/Badge'
import { ImageCredit } from '@/platform/ui/ImageCredit'
import { Media } from '@/platform/ui/Media'
import { DateTime } from '@/platform/ui/DateTime'
import { MetaList, type LabelledMetaItem } from '@/platform/ui/MetaList'

import { formatAuthors } from '../domain/authors'
import type { PostDetail } from '../domain/types'

/** The top of a post's page: categories, title, byline and date over the hero image. */
export const PostHero: React.FC<{
  post: PostDetail
}> = ({ post }) => {
  const { categories, heroImage, publishedAt, title } = post
  const byline = formatAuthors(post.authors)
  const facts: LabelledMetaItem[] = [
    ...(byline ? [{ label: 'Author', value: byline }] : []),
    ...(publishedAt
      ? [{ label: 'Date Published', value: <DateTime value={publishedAt} format="long" /> }]
      : []),
  ]

  return (
    <>
      <div className="relative -mt-[var(--header-height)] flex items-end">
        <div className="relative z-10 container pt-[var(--header-height)] pb-8 text-on-image lg:grid lg:grid-cols-[1fr_48rem_1fr]">
          <div className="col-span-1 col-start-1 md:col-span-2 md:col-start-2">
            {categories.length > 0 && (
              <BadgeList className="mb-6">
                {categories.map((category) => (
                  <Badge key={category.id} variant="on-image">
                    {category.title}
                  </Badge>
                ))}
              </BadgeList>
            )}

            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>

            <MetaList variant="on-image" items={facts} />
          </div>
        </div>
        <div className="min-h-[80vh] select-none">
          {heroImage && (
            <Media fill priority imgClassName="-z-10 object-cover" resource={heroImage} />
          )}
          <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-scrim to-transparent" />
        </div>
      </div>
      <ImageCredit image={heroImage} className="container mt-2 text-right" />
    </>
  )
}
