import React from 'react'

import type { PostSummary } from '../domain/types'
import { PostCard } from './PostCard'
import { CardGrid, CardGridItem } from '@/platform/ui/CardGrid'

/** Posts as a grid of cards: one column on phones, two from `sm`, three from `lg`. */
export const PostGrid: React.FC<{ posts: PostSummary[] }> = ({ posts }) => {
  return (
    <div className="container">
      <CardGrid>
        {/* Index keys: an editor may pick the same post twice in an archive block */}
        {posts.map((post, index) => (
          <CardGridItem key={index}>
            <PostCard post={post} />
          </CardGridItem>
        ))}
      </CardGrid>
    </div>
  )
}
