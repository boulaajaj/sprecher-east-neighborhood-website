import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Plugin } from 'payload'
import { isAdmin } from '@/platform/payload/roles'
import { revalidateRedirects } from '@/modules/site/cms'
import { formBuilderOptions } from '@/modules/contact/cms'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { searchOptions } from '@/modules/news/cms'

import type { Page, Post, Event } from '@/payload-types'
import { getServerSideURL } from '@/platform/lib/getURL'

const generateTitle: GenerateTitle<Post | Page | Event> = ({ doc }) => {
  return doc?.title || 'Sprecher East'
}

const generateURL: GenerateURL<Post | Page | Event> = ({ doc, collectionConfig }) => {
  const url = getServerSideURL()

  if (!doc?.slug) return url

  if (collectionConfig?.slug === 'events') {
    return `${url}/events/${doc.slug}`
  }

  if (collectionConfig?.slug === 'posts') {
    return `${url}/posts/${doc.slug}`
  }

  return `${url}/${doc.slug}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      access: {
        create: isAdmin,
        read: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  // No `collections`: Pages, Posts and Events build their own SEO tab (with an image) from the
  // plugin's fields. Listing them here added a second `meta` group without one, which reads
  // returned, so no share image or card thumbnail ever showed (#196).
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  // Forms, submissions and their safeguards belong to the contact module
  formBuilderPlugin(formBuilderOptions),
  // Search belongs to news; it also indexes events, which the module doesn't name (0008)
  searchPlugin({ ...searchOptions, collections: ['posts', 'events'] }),
]
