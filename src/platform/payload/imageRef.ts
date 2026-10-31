import type { Media } from '@/payload-types'
import type { ImageRef } from '@/platform/lib'

/**
 * The image an upload field holds, for a module's mappers. The field holds the image once it is
 * loaded (`depth` ≥ 1), and only its id otherwise, which shows as no image.
 */
export function toImageRef(value: number | Media | null | undefined): ImageRef | null {
  return typeof value === 'object' ? value : null
}
