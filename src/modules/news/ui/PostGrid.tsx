import React from 'react'

import type { PostSummary } from '../domain/types'
import { PostCard } from './PostCard.client'
import { POST_CELL_CLASS, POST_GRID_CLASS } from './postGridClasses'

/** Posts as a grid of cards: one column on phones, two from `sm`, three from `lg`. */
export const PostGrid: React.FC<{ posts: PostSummary[] }> = ({ posts }) => {
  return (
    <div className="container">
      <div>
        <div className={POST_GRID_CLASS}>
          {/* Index keys: an editor may pick the same post twice in an archive block */}
          {posts.map((post, index) => (
            <div className={POST_CELL_CLASS} key={index}>
              <PostCard className="h-full" post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
