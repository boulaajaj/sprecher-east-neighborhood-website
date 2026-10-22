'use server'

import { parsePageNumber } from '@/platform/lib'

import { findPostPage } from './use-cases/findPostPage'

/** Next page of published posts for the /posts listing ("Load more"). */
export async function loadPostsPage(page: unknown) {
  const pageNumber = parsePageNumber(page)
  if (pageNumber === null) throw new Error('Invalid page number')
  return findPostPage(pageNumber)
}
