import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Plugin } from 'payload'
import { anyone } from '@/access/anyone'
import { isAdmin, isAdminOrEditor, isAdminOrEditorFieldAccess } from '@/access/roles'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { dropEmailsToSubmittedAddresses, rateLimitSubmissions } from '@/hooks/formSubmissionGuards'
import { limitSubmissionSize } from '@/hooks/limitSubmissionSize'
import { verifyHumanSubmission } from '@/hooks/verifyHumanSubmission'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import type { Page, Post, Event } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

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
  formBuilderPlugin({
    beforeEmail: dropEmailsToSubmittedAddresses,
    fields: {
      payment: false,
    },
    formOverrides: {
      access: {
        create: isAdminOrEditor,
        // Visitors must read a form's definition (fields, labels, submit button) to fill it
        // in. With admin/editor-only read, the public contact page rendered an empty form.
        read: anyone,
        update: isAdminOrEditor,
        delete: isAdmin,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          // Email routing (recipients, reply-to, templates) stays private.
          if ('name' in field && field.name === 'emails' && field.type === 'array') {
            return {
              ...field,
              access: { ...field.access, read: isAdminOrEditorFieldAccess },
            }
          }
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      hooks: {
        // Cheapest check first: oversized submissions never reach Turnstile or the database
        beforeValidate: [limitSubmissionSize],
        // Rate limit before Turnstile, so a rate-limited client never triggers a Siteverify call
        beforeChange: [rateLimitSubmissions, verifyHumanSubmission],
      },
      access: {
        create: () => true,
        read: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'events'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      // The plugin sets only create (off) and read (public). Its own sync bypasses access, so
      // these only gate the admin screens: staff may reindex (needs both) and set priority (#140).
      access: { update: isAdminOrEditor, delete: isAdminOrEditor },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
