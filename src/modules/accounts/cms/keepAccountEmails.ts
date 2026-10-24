import type { ConfirmedEmailKeeper } from '@/platform/payload/emailConfirmer'

/**
 * For the verification module (#274): a confirmed address stays while an account uses it. Only
 * a person without an account has their confirmation deleted for retention. Payload stores
 * account emails in lowercase, like the addresses asked about. `payload.config.ts` hands it over
 * (decision 0008).
 */
export const keepAccountEmails: ConfirmedEmailKeeper = async (emails, req) => {
  if (emails.length === 0) return new Set()
  const { docs } = await req.payload.find({
    collection: 'users',
    where: { email: { in: [...emails] } },
    select: { email: true },
    pagination: false,
    depth: 0,
    // Accounts are private; the retention task runs as nobody and only learns which addresses
    // have one
    overrideAccess: true,
    req,
  })
  return new Set(docs.map(({ email }) => email))
}
