import type React from 'react'

import { documentHref } from '@/platform/payload/documentHref'
import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    const reference = redirectItem.to?.reference
    let target = typeof reference?.value === 'object' ? reference.value : null

    // An unpopulated reference is an ID: look it up as a visitor would (null for a draft)
    if (typeof reference?.value === 'number') {
      target = await getCachedDocument(reference.relationTo, reference.value)()
    }

    if (reference && target?.slug) {
      redirect(documentHref(reference.relationTo, target.slug))
    }
  }

  if (disableNotFound) return null

  notFound()
}
