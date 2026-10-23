/**
 * What a visitor reads when a public account form is turned away before it reaches the server's
 * real work (sign-up, forgot password): the robot check failed, or too many requests. Neither
 * depends on the email, so neither says whether an account exists.
 */
export const GUARD_MESSAGES = {
  'robot-check': 'The spam check didn’t pass. Please wait a moment and try again.',
  'too-many': 'Too many requests right now. Please try again in an hour.',
} as const
