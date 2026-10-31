import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { withOwnTransaction } from './ownTransaction'

describe('withOwnTransaction', () => {
  const caller = () =>
    ({
      transactionID: 'caller-tx',
      headers: new Headers({ 'x-forwarded-for': '203.0.113.7' }),
      payload: { name: 'payload' },
    }) as unknown as PayloadRequest

  it('drops the caller’s transaction and keeps everything else', () => {
    const req = caller()
    const own = withOwnTransaction(req)
    expect(own.transactionID).toBeUndefined()
    expect(own.headers.get('x-forwarded-for')).toBe('203.0.113.7')
    expect(own.payload).toBe(req.payload)
  })

  it('never touches the caller’s transaction when its own one starts', () => {
    const req = caller()
    const own = withOwnTransaction(req)
    own.transactionID = 'own-tx'
    expect(req.transactionID).toBe('caller-tx')
  })

  it('keeps the headers of a real Request (a private field behind a getter)', () => {
    const request = new Request('http://localhost/api', {
      headers: { 'x-real-ip': '198.51.100.4' },
    })
    const req = Object.assign(request, { transactionID: 'tx' }) as unknown as PayloadRequest
    expect(withOwnTransaction(req).headers.get('x-real-ip')).toBe('198.51.100.4')
  })
})
