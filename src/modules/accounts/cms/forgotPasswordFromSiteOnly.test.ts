import { APIError, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { forgotPasswordFromSiteOnly } from './forgotPasswordFromSiteOnly'

const run = (operation: string, payloadAPI: PayloadRequest['payloadAPI']) => {
  const args = { data: { email: 'ana@example.com' } }
  return forgotPasswordFromSiteOnly({
    args,
    operation,
    req: { payloadAPI },
  } as unknown as Parameters<typeof forgotPasswordFromSiteOnly>[0])
}

describe('forgotPasswordFromSiteOnly', () => {
  it.each(['REST', 'GraphQL'] as const)('refuses forgot password over %s with 403', (api) => {
    expect(() => run('forgotPassword', api)).toThrow(APIError)
    try {
      run('forgotPassword', api)
    } catch (error) {
      expect((error as APIError).status).toBe(403)
    }
  })

  it('lets the site’s own server action (the Local API) through', () => {
    expect(run('forgotPassword', 'local')).toEqual({ data: { email: 'ana@example.com' } })
  })

  it.each(['login', 'resetPassword', 'create', 'update'])('leaves %s alone over REST', (op) => {
    expect(run(op, 'REST')).toEqual({ data: { email: 'ana@example.com' } })
  })
})
