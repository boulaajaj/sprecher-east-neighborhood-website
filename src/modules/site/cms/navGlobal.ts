import type { Field, GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/platform/payload/roles'
import { link } from '@/platform/payload/link'

import { FORUM_DEFAULT_URL, trimForumUrl, validateForumUrl } from '../domain/forum'
import { revalidateGlobal } from './revalidateGlobal'

/** The neighborhood forum's address (#485): the footer and each post page link to it. */
const forumUrlField: Field = {
  name: 'forumUrl',
  type: 'text',
  label: 'Forum address',
  defaultValue: FORUM_DEFAULT_URL,
  validate: validateForumUrl,
  hooks: {
    beforeValidate: [({ value }) => trimForumUrl(value)],
  },
  admin: {
    description:
      'The neighborhood forum’s https address. The footer and every post link to it; leave it empty to hide those links.',
  },
}

/**
 * The header's or the footer's global: up to six links, each a page or a custom URL. The footer
 * also keeps the forum's address.
 */
const navGlobal = (slug: 'header' | 'footer', extraFields: Field[] = []): GlobalConfig => ({
  slug,
  access: {
    read: () => true,
    // Set explicitly: Payload's default would let any signed-in account edit it (#140)
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/modules/site/cms/NavItemRowLabel.client#NavItemRowLabel',
        },
      },
    },
    ...extraFields,
  ],
  hooks: {
    afterChange: [revalidateGlobal(slug)],
  },
})

export const Header = navGlobal('header')
export const Footer = navGlobal('footer', [forumUrlField])
