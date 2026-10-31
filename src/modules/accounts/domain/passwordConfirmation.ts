/**
 * The request-context key that marks a password change whose current password was checked just
 * before it (#233). Only server code can set it: Payload starts every REST and GraphQL request
 * with an empty context.
 */
export const CURRENT_PASSWORD_CONFIRMED = 'accounts.currentPasswordConfirmed'

/** What anyone changing their own password any other way is told: REST, GraphQL or `/admin`. */
export const CONFIRM_ON_ACCOUNT_PAGE =
  'To change your own password, use your account page and enter your current password.'
