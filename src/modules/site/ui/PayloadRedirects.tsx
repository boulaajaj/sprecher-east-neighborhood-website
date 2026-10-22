import { notFound, redirect } from 'next/navigation'
import type React from 'react'

import { getRedirectTarget } from '../use-cases/getRedirectTarget'

interface Props {
  disableNotFound?: boolean
  url: string
}

/**
 * Follows the redirect editors set for `url`, at render time. With none, answers 404, unless
 * `disableNotFound` (a page that exists renders it to honour redirects set over it).
 */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const target = await getRedirectTarget(url)
  if (target) redirect(target)

  if (disableNotFound) return null

  notFound()
}
