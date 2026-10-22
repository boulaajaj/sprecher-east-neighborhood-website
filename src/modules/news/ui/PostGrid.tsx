import React from 'react'

import type { PostSummary } from '../domain/types'
import { PostCard } from './PostCard.client'

/** Posts as a grid of cards: one column on phones, two from `sm`, three from `lg`. */
export const PostGrid: React.FC<{ posts: PostSummary[] }> = ({ posts }) => {
  return (
    <div className="container">
      <div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
          {/* Index keys: an editor may pick the same post twice in an archive block */}
          {posts.map((post, index) => (
            <div className="col-span-4" key={index}>
              <PostCard className="h-full" post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
