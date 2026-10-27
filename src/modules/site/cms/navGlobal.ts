import type { GlobalConfig } from 'payload'

import { isAdminOrEditor } from '@/platform/payload/roles'
import { link } from '@/platform/payload/link'

import { revalidateGlobal } from './revalidateGlobal'

/** The header's or the footer's global: up to six links, each a page or a custom URL. */
const navGlobal = (slug: 'header' | 'footer'): GlobalConfig => ({
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
  ],
  hooks: {
    afterChange: [revalidateGlobal(slug)],
  },
})

export const Header = navGlobal('header')
export const Footer = navGlobal('footer')
