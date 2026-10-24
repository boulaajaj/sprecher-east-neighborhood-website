import type { Payload, SanitizedConfig } from 'payload'
import { vi } from 'vitest'

import type { User } from '@/payload-types'

/**
 * Shared by the tests that send real requests to Payload booted on an in-memory SQLite database:
 * no file, no network, no email.
 */

/** Saving published content refreshes cached pages, which needs Next.js. */
export const NO_REVALIDATE = { disableRevalidate: true }

/** Boots Payload with the real config on a fresh in-memory database. */
export async function bootPayload(): Promise<{ payload: Payload; config: SanitizedConfig }> {
  vi.stubEnv('DATABASE_URI', 'file::memory:')
  vi.stubEnv('PAYLOAD_SECRET', 'in-memory-test-secret-0123456789abcdef')
  vi.stubEnv('SMTP_HOST', '')
  const { getPayload } = await import('payload')
  const config = await (await import('@payload-config')).default
  return { payload: await getPayload({ config }), config }
}

export type Account = User & { collection: 'users' }

/** An account with this role, its name also its email's local part and password prefix. */
export async function createAccount(
  payload: Payload,
  role: User['role'],
  name: string,
): Promise<Account> {
  const user = await payload.create({
    collection: 'users',
    data: { email: `${name}@example.com`, password: `${name}-password-for-tests`, name, role },
    disableVerificationEmail: true,
    overrideAccess: true,
  })
  // Verified, as opening the emailed link would, so the account can sign in
  await payload.db.updateOne({ collection: 'users', id: user.id, data: { _verified: true } })
  return { ...user, collection: 'users' }
}

/** A one-paragraph rich text, as the editor saves it. */
export const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        textFormat: 0,
        children: [
          { type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 },
        ],
      },
    ],
  },
})
