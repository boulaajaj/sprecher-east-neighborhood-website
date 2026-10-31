import 'server-only'

import type { Footer } from '@/payload-types'

import * as globals from '../data/globals'

/** The footer's nav links, as editors set them. */
export function getFooterNav(): Promise<Footer> {
  return globals.getFooter()
}
