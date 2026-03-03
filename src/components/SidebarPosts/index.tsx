import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type SidebarPostData = Pick<Post, 'slug' | 'title' | 'meta'>

export const SidebarPosts: React.FC<{
  posts: SidebarPostData[]
  title?: string
}> = ({ posts, title = 'Related Posts' }) => {
  if (!posts || posts.length === 0) return null

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="space-y-4">
        {posts.map((post) => {
          const metaImage = post.meta?.image

          return (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`} className="group flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                  {metaImage && typeof metaImage === 'object' ? (
                    <Media
                      resource={metaImage}
                      imgClassName="object-cover w-full h-full"
                      fill
                      size="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface">
                      <span className="sr-only">No image available</span>
                    </div>
                  )}
                </div>
                <span className="text-sm leading-snug font-medium text-foreground group-hover:text-primary">
                  {post.title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
