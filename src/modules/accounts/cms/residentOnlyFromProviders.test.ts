import type { CollectionBeforeChangeHook } from 'payload'
import { describe, expect, it } from 'vitest'

import { residentOnlyFromProviders } from './residentOnlyFromProviders'

type Args = Parameters<CollectionBeforeChangeHook>[0]
const run = (args: Partial<Args>) => residentOnlyFromProviders({ context: {}, ...args } as Args)

describe('residentOnlyFromProviders', () => {
  it('makes an account a provider sign-in creates a resident, whatever the data says', () => {
    expect(
      run({ operation: 'create', context: { socialSignIn: true }, data: { role: 'admin' } }),
    ).toEqual({ role: 'resident' })
  })

  it('leaves every other create and update alone', () => {
    expect(run({ operation: 'create', data: { role: 'admin' } })).toEqual({ role: 'admin' })
    expect(
      run({ operation: 'update', context: { socialSignIn: true }, data: { role: 'editor' } }),
    ).toEqual({ role: 'editor' })
  })
})
