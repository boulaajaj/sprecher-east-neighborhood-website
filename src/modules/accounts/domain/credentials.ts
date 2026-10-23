import { z } from 'zod'

// One set of rules for the forms in the browser and the server actions, which check again
// because anyone can call an action directly (https://nextjs.org/docs/app/guides/data-security).

export const MIN_PASSWORD_LENGTH = 8
/** Far above any real password; bounds the work an anonymous caller can ask of the hashing */
export const MAX_PASSWORD_LENGTH = 1024
/** The longest an email address can be (RFC 5321: 64 + 1 + 255), with room to spare */
export const MAX_EMAIL_LENGTH = 320

/** Strict like every action schema: a field the form doesn't have is refused, not ignored. */
export const signInSchema = z.strictObject({
  email: z.string().trim().min(1, 'Enter your email address').max(MAX_EMAIL_LENGTH),
  password: z.string().min(1, 'Enter your password').max(MAX_PASSWORD_LENGTH),
})

export type SignInValues = z.output<typeof signInSchema>

/**
 * A new password for the signed-in account, with its current one (#233). Strict: the account is
 * always the signed-in one, so an extra field (such as an `id` or an `email`) is refused rather
 * than ignored. The current password is kept exactly as typed, like the one used to sign in.
 */
export const passwordChangeSchema = z
  .strictObject({
    currentPassword: z.string().min(1, 'Enter your current password').max(MAX_PASSWORD_LENGTH),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH, `Use at most ${MAX_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Type the new password again').max(MAX_PASSWORD_LENGTH),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'The passwords don’t match',
    path: ['confirmPassword'],
  })

export type PasswordChangeValues = z.output<typeof passwordChangeSchema>
