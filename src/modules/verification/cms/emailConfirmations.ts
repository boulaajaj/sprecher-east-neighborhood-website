import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/platform/payload/roles'

/** The collection's slug, for the Local API calls in this folder. */
export const EMAIL_CONFIRMATIONS = 'email-confirmations'

/** Set by the server only: shown in Admin, never edited there. */
const readOnly = { readOnly: true, position: 'sidebar' } as const

/**
 * Email addresses people typed into a public form, and whether they confirmed them by link
 * (#183). Kept apart from accounts (`users`). Only admins can see or change it: it is personal
 * data, and the server writes it with access bypassed.
 */
export const EmailConfirmations: CollectionConfig = {
  slug: EMAIL_CONFIRMATIONS,
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    defaultColumns: ['email', 'confirmedAt', 'lastSentAt'],
    description:
      'Addresses typed into a public form, and when they were confirmed by link. Unconfirmed ones are deleted 7 days after their last link. To remove a confirmed address on request, delete it here.',
    useAsTitle: 'email',
  },
  defaultSort: '-updatedAt',
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      index: true,
      admin: { ...readOnly, description: 'When the link was clicked. Empty: not confirmed yet.' },
    },
    { name: 'welcomeSentAt', type: 'date', admin: readOnly },
    {
      name: 'lastSentAt',
      type: 'date',
      index: true,
      admin: { ...readOnly, description: 'When the latest confirmation link was sent.' },
    },
    // The link's token is never stored, only its SHA-256, and it never leaves the server
    { name: 'tokenHash', type: 'text', index: true, hidden: true },
    { name: 'tokenExpiresAt', type: 'date', admin: readOnly },
    // The per-address limit: links sent since sendWindowStart
    { name: 'sendCount', type: 'number', defaultValue: 0, hidden: true },
    { name: 'sendWindowStart', type: 'date', hidden: true },
  ],
  timestamps: true,
}
