import 'server-only'

import type { Header } from '@/payload-types'

import * as globals from '../data/globals'

/** The header's nav links, as editors set them. */
export function getHeaderNav(): Promise<Header> {
  return globals.getHeader()
}
