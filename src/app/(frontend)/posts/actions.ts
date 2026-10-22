'use server'

import { parsePageNumber } from '@/platform/lib'
import { findPublishedPosts } from '@/utilities/feeds'

/** Next page of published posts for the incrementally loaded /posts listing. */
export async function loadPostsPage(page: unknown) {
  const pageNumber = parsePageNumber(page)
  if (pageNumber === null) throw new Error('Invalid page number')
  return findPublishedPosts(pageNumber)
}
