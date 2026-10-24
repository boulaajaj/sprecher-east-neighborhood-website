import { GraphQLError, type ValidationRule } from 'graphql'
import type { Endpoint } from 'payload'

/**
 * Payload's own ways to verify an account from a link's token, which this site turns off (#303):
 * `POST /api/users/verify/:token` and the `verifyEmailUser` GraphQL mutation. Payload's
 * `verifyEmail` operation runs no hooks, so neither can be guarded there. Left open, anyone holding
 * the token could verify without the robot check, and a resent link (#289) would open the account
 * with the old password instead of asking for a new one. Only the site's `/verify-account` page,
 * whose server action runs the robot check and then Payload's Local API, verifies accounts.
 */
const REFUSED = 'Open the link from the email and press Confirm on the site.'

/**
 * Takes the place of Payload's `POST /verify/:id` on the users collection: a collection's own
 * endpoints are matched before the ones Payload adds, so this one answers first.
 */
export const verifyEndpointFromSiteOnly: Endpoint = {
  path: '/verify/:id',
  method: 'post',
  handler: () => Response.json({ errors: [{ message: REFUSED }] }, { status: 403 }),
}

/** The GraphQL mutation Payload adds for the users collection's verify link. */
export const VERIFY_MUTATION = 'verifyEmailUser'

/** A GraphQL validation rule (`graphQL.validationRules`) that refuses the verify mutation. */
export const noVerifyMutation: ValidationRule = (context) => ({
  Field(node) {
    if (node.name.value === VERIFY_MUTATION) {
      context.reportError(new GraphQLError(REFUSED, { nodes: [node] }))
    }
  },
})
