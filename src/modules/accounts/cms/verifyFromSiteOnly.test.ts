import { buildSchema, parse, specifiedRules, validate } from 'graphql'
import { describe, expect, it } from 'vitest'

import { noVerifyMutation, verifyEndpointFromSiteOnly, VERIFY_MUTATION } from './verifyFromSiteOnly'

// A stand-in for the part of Payload's schema these tests need
const schema = buildSchema(`
  type Query { me: Boolean }
  type Mutation { ${VERIFY_MUTATION}(token: String): Boolean, logoutUser: Boolean }
`)

const errorsFor = (query: string) =>
  validate(schema, parse(query), [...specifiedRules, noVerifyMutation]).map((e) => e.message)

describe('Payload’s own account verification is turned off (#303)', () => {
  it('answers 403 on REST, on the path Payload uses, so the site’s page is the only way', async () => {
    expect([verifyEndpointFromSiteOnly.method, verifyEndpointFromSiteOnly.path]).toEqual([
      'post',
      '/verify/:id',
    ])
    const handler = verifyEndpointFromSiteOnly.handler as () => Response
    const response = handler()
    expect(response.status).toBe(403)
    expect(JSON.stringify(await response.json())).toMatch(/press Confirm on the site/)
  })

  it('refuses the GraphQL verify mutation, aliased or not', () => {
    expect(errorsFor(`mutation { ${VERIFY_MUTATION}(token: "x") }`)).toHaveLength(1)
    expect(errorsFor(`mutation { ok: ${VERIFY_MUTATION}(token: "x") }`)).toHaveLength(1)
  })

  it('leaves every other operation alone', () => {
    expect(errorsFor('mutation { logoutUser }')).toEqual([])
    expect(errorsFor('{ me }')).toEqual([])
  })
})
