import React from 'react'

import { Badge, BadgeList } from '@/platform/ui/Badge'
import { DateTime } from '@/platform/ui/DateTime'
import type { LabelledMetaItem } from '@/platform/ui/MetaList'
import type { PageHeaderProps } from '@/platform/ui/PageHeader'

import { formatAuthors } from '../domain/authors'
import type { PostDetail } from '../domain/types'

/**
 * The top of a post's page as `PageHeader` props (#461): its categories, title, byline and date,
 * on its hero photo (`image`), or plain (`default`) when it has none.
 */
export function postHeaderProps(post: PostDetail): PageHeaderProps {
  const { categories, heroImage, publishedAt, title } = post
  const byline = formatAuthors(post.authors)
  const facts: LabelledMetaItem[] = [
    ...(byline ? [{ label: 'Author', value: byline }] : []),
    ...(publishedAt
      ? [{ label: 'Date Published', value: <DateTime value={publishedAt} format="long" /> }]
      : []),
  ]
  const badge = heroImage ? 'on-image' : 'category'
  const eyebrow =
    categories.length > 0 ? (
      <BadgeList>
        {categories.map((category) => (
          <Badge key={category.id} variant={badge}>
            {category.title}
          </Badge>
        ))}
      </BadgeList>
    ) : undefined

  return heroImage
    ? { variant: 'image', image: heroImage, eyebrow, title, facts }
    : { eyebrow, title, facts }
}
