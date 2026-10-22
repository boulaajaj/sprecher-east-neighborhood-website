// Payload entry: the email-confirmations collection and the confirmation service, for
// payload.config.ts to register and hand to the modules that need it (decision 0008). Nothing
// here may be server-only, because the Payload CLI (migrations, seed) loads it outside Next.js.
export { emailConfirmer } from './cms/emailConfirmer'
export { createEmailConfirmations } from './cms/emailConfirmations'
