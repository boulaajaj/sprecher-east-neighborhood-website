import { createLocalReq, getPayload } from 'payload'

import { hasAdmin } from '@/access/roles'
import { seed } from '@/endpoints/seed'
import { isSeedEnabled } from '@/endpoints/seed/isSeedEnabled'
import type { User } from '@/payload-types'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  // Off on the live site: the route doesn't exist there (#147)
  if (!isSeedEnabled()) {
    return new Response('Not found.', { status: 404 })
  }

  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  // The seed deletes nearly all content and creates a demo admin, so only admins may run it.
  // Being signed in is not enough: residents and editors are refused (#140).
  if (!user || !hasAdmin(user as User)) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    // Create a Payload request object to pass to the Local API for transactions
    // At this point you should pass in a user, locale, and any other context you need for the Local API
    const payloadReq = await createLocalReq({ user }, payload)

    await seed({ payload, req: payloadReq })

    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response('Error seeding data.', { status: 500 })
  }
}
