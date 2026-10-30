import type { Field, TextFieldSingleValidation } from 'payload'

import { EDITORIAL_LINK_MAX_LENGTH, validateEditorialLink } from './editorialLink'

// The address is checked together with its link text: both or neither
const validateLinkUrl: TextFieldSingleValidation = (value, { siblingData }) =>
  validateEditorialLink(value, (siblingData as { linkLabel?: string | null }).linkLabel)

/**
 * The optional link an editorial block item carries: link text and an address side by side,
 * stored as `linkLabel` and `linkUrl` (`toEditorialLink()` reads them). Shared by every block in
 * `EDITORIAL_BLOCKS`, so they all validate links the same way.
 */
export const editorialLinkFields = ({
  labelExample = 'Read more',
}: { labelExample?: string } = {}): Field => ({
  type: 'row',
  fields: [
    {
      name: 'linkLabel',
      type: 'text',
      label: 'Link text',
      maxLength: 60,
      admin: { width: '50%', description: `Optional, for example "${labelExample}".` },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link address',
      maxLength: EDITORIAL_LINK_MAX_LENGTH,
      admin: { width: '50%', description: 'A site path (/events) or https:// address.' },
      validate: validateLinkUrl,
    },
  ],
})
