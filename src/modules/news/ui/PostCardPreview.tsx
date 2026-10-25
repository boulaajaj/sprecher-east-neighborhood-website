import React from 'react'

import { CardPreview } from '@/platform/ui/CardPreview'

import type { PostSummary } from '../domain/types'
import { PostCard } from './PostCard.client'

/** The post's card as lists show it, for an editor's preview (#363). */
export const PostCardPreview: React.FC<{ post: PostSummary }> = ({ post }) => (
  <CardPreview>
    <PostCard className="h-full" post={post} />
  </CardPreview>
)
