import React from 'react'

import { CardPreview } from '@/platform/ui/CardPreview'

import type { PostSummary } from '../domain/types'
import { PostCard } from './PostCard'
import { CardGrid, CardGridItem } from '@/platform/ui/CardGrid'

/** The post's card in the post grid's own columns, for an editor's preview (#363). */
export const PostCardPreview: React.FC<{ post: PostSummary }> = ({ post }) => (
  <CardPreview>
    <CardGrid as="div">
      <CardGridItem as="div">
        <PostCard post={post} />
      </CardGridItem>
    </CardGrid>
  </CardPreview>
)
