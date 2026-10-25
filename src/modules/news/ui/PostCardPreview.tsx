import React from 'react'

import { CardPreview } from '@/platform/ui/CardPreview'

import type { PostSummary } from '../domain/types'
import { PostCard } from './PostCard.client'
import { POST_CELL_CLASS, POST_GRID_CLASS } from './postGridClasses'

/** The post's card in the post grid's own columns, for an editor's preview (#363). */
export const PostCardPreview: React.FC<{ post: PostSummary }> = ({ post }) => (
  <CardPreview>
    <div className={POST_GRID_CLASS}>
      <div className={POST_CELL_CLASS}>
        <PostCard className="h-full" post={post} />
      </div>
    </div>
  </CardPreview>
)
