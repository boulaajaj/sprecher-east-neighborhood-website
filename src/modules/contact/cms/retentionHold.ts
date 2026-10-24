import type { Field, FieldAccess } from 'payload'

import { isAdminFieldAccess } from '@/platform/payload/roles'

/**
 * Staff only, like the collection itself. Never set on create: a visitor could otherwise send a
 * message that is never deleted.
 */
const staffOnly: { create: FieldAccess; read: FieldAccess; update: FieldAccess } = {
  create: () => false,
  read: isAdminFieldAccess,
  update: isAdminFieldAccess,
}

/** The reason is required while the hold is on. */
export const validateHoldReason = (
  value: string | null | undefined,
  { siblingData }: { siblingData: Partial<{ retentionHold: boolean | null }> },
): true | string =>
  siblingData?.retentionHold === true && !value?.trim()
    ? 'Say why this message is kept longer.'
    : true

/**
 * A hold that keeps a message past the automatic deletion (#274), for an active matter or an
 * applicable retention requirement (the owner's words). The retention task skips it.
 */
export const retentionHoldFields: Field[] = [
  {
    name: 'retentionHold',
    type: 'checkbox',
    defaultValue: false,
    access: staffOnly,
    admin: {
      position: 'sidebar',
      description:
        'Keep this message past the automatic deletion (48 hours if never confirmed, otherwise 12 months after the sender’s last message), for an active matter or a retention requirement. Untick it when that no longer applies.',
    },
  },
  {
    name: 'retentionHoldReason',
    type: 'textarea',
    access: staffOnly,
    validate: validateHoldReason,
    admin: {
      position: 'sidebar',
      condition: (data) => data?.retentionHold === true,
      description: 'Why it is kept longer.',
    },
  },
]
