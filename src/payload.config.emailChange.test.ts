import { REST_PATCH } from '@payloadcms/next/routes'
import type { Payload, SanitizedConfig } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * An account's email can't be changed to an unconfirmed address (#555). Payload sends a
 * verification link only when an account is created, so an update to `email` would keep the
 * account marked verified without anyone opening a link to the new address. These tests send the
 * writes a signed-in member could try, through Payload's REST handler and the Local API, and check
 * what was stored. Payload runs on an in-memory SQLite database: no file, no network.
 */

let config: SanitizedConfig
let payload: Payload

beforeAll(async () => {
  vi.stubEnv('DATABASE_URI', 'file::memory:')
  vi.stubEnv('PAYLOAD_SECRET', 'email-change-test-secret-0123456789')
  vi.stubEnv('SMTP_HOST', '')
  const { getPayload } = await import('payload')
  config = await (await import('@payload-config')).default
  payload = await getPayload({ config })
}, 60_000)

const password = 'member-password-for-tests'

async function makeVerifiedAccount(email: string, role: 'guest' | 'resident' | 'editor') {
  const user = await payload.create({
    collection: 'users',
    data: { email, password, name: role, role },
    disableVerificationEmail: true,
    overrideAccess: true,
  })
  // Verified, as opening the emailed link would, so the account can sign in
  await payload.db.updateOne({
    collection: 'users',
    id: user.id,
    data: { _verified: true },
    returning: false,
  })
  const { token } = await payload.login({ collection: 'users', data: { email, password } })
  return { id: user.id, email, token: token ?? '' }
}

const storedEmail = async (id: number) =>
  (await payload.findByID({ collection: 'users', id, depth: 0, overrideAccess: true })).email

async function restPatchEmail(id: number, token: string, email: string) {
  const handler = REST_PATCH(Promise.resolve(config))
  const request = new Request(`http://localhost:3000/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ email }),
  })
  return handler(request, { params: Promise.resolve({ slug: ['users', String(id)] }) })
}

describe('changing your own email', () => {
  beforeAll(async () => {
    // The first account on an empty database becomes an admin (#354); it is not one tested
    await payload.create({
      collection: 'users',
      data: { email: 'first@example.com', password, name: 'First', role: 'guest' },
      disableVerificationEmail: true,
      overrideAccess: true,
    })
  })

  it.each(['guest', 'resident', 'editor'] as const)(
    'is refused over REST for a %s, and the stored email stays',
    async (role) => {
      const member = await makeVerifiedAccount(`${role}-rest@example.com`, role)
      const response = await restPatchEmail(member.id, member.token, `new-${role}@example.com`)
      expect(response.status).toBe(403)
      expect(await storedEmail(member.id)).toBe(member.email)
    },
  )

  it('is refused in a Local API update made as the member', async () => {
    const member = await makeVerifiedAccount('guest-local@example.com', 'guest')
    const user = await payload.findByID({
      collection: 'users',
      id: member.id,
      depth: 0,
      overrideAccess: true,
    })
    await expect(
      payload.update({
        collection: 'users',
        id: member.id,
        data: { email: 'changed-local@example.com' },
        user,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    expect(await storedEmail(member.id)).toBe(member.email)
  })

  it('still lets a member change other details such as the name', async () => {
    const member = await makeVerifiedAccount('guest-name@example.com', 'guest')
    const handler = REST_PATCH(Promise.resolve(config))
    const response = await handler(
      new Request(`http://localhost:3000/api/users/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `JWT ${member.token}` },
        body: JSON.stringify({ name: 'Renamed', email: member.email }),
      }),
      { params: Promise.resolve({ slug: ['users', String(member.id)] }) },
    )
    expect(response.status).toBe(200)
  })

  it('still lets an admin change another account’s email', async () => {
    const member = await makeVerifiedAccount('guest-admin-edit@example.com', 'guest')
    await payload.update({
      collection: 'users',
      id: member.id,
      data: { email: 'by-admin@example.com' },
      overrideAccess: true,
    })
    expect(await storedEmail(member.id)).toBe('by-admin@example.com')
  })
})
