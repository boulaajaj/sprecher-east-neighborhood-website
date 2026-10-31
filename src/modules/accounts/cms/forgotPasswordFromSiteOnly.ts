import { APIError, type CollectionBeforeOperationHook } from 'payload'

/**
 * Refuses forgot password everywhere but the site's own page (#282). The page's server action
 * runs the robot check and the limits first, then calls Payload's Local API. Payload's
 * `POST /api/users/forgot-password` and its GraphQL mutation have neither, and Payload has no
 * option to turn off just this endpoint, so they answer 403 for every email (nobody learns an
 * account exists). The admin panel's "Forgot password?" page goes to the site's page instead
 * (`src/proxy.ts`).
 */
export const forgotPasswordFromSiteOnly: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (operation === 'forgotPassword' && req.payloadAPI !== 'local') {
    throw new APIError('Use the forgot password page on the site.', 403, null, true)
  }
  return args
}
