import { z } from 'zod'

// One set of rules for the forms in the browser and the server actions, which check again
// because anyone can call an action directly (https://nextjs.org/docs/app/guides/data-security).

export const MIN_PASSWORD_LENGTH = 8

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email address'),
  password: z.string().min(1, 'Enter your password'),
})

export type SignInValues = z.output<typeof signInSchema>

/**
 * A new password for the signed-in account. Strict: the account is always the signed-in one, so
 * an extra field (such as an `id`) is refused rather than ignored.
 */
export const passwordChangeSchema = z
  .strictObject({
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Type the new password again'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'The passwords don’t match',
    path: ['confirmPassword'],
  })

export type PasswordChangeValues = z.output<typeof passwordChangeSchema>
