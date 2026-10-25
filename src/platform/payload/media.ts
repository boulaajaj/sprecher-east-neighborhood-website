import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { isHttpUrl } from '@/platform/lib/reviewQueue'
import { anyone } from '@/platform/payload/anyone'
import { isAdmin, isAdminOrEditor } from '@/platform/payload/roles'

/**
 * Under what terms the site may show an image (#362). Agents never upload images; an editor
 * records this when adding one, so every photo can be credited and its use checked.
 */
export const MEDIA_LICENSES = [
  { value: 'own', label: 'Our own photo' },
  { value: 'permission', label: 'Used with permission' },
  { value: 'cc-by', label: 'CC BY' },
  { value: 'cc-by-sa', label: 'CC BY-SA' },
  { value: 'cc0', label: 'CC0 or public domain' },
  { value: 'other', label: 'Other (say which in the credit)' },
] as const

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'credit',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Who made the image, as it should be credited, for example "Jane Doe".',
      },
    },
    {
      name: 'license',
      type: 'select',
      options: [...MEDIA_LICENSES],
      admin: { description: 'Under what terms the site may show it.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Source link',
      maxLength: 2048,
      validate: (value: unknown) =>
        value === null ||
        value === undefined ||
        value === '' ||
        isHttpUrl(value) ||
        'Enter a full http(s) link.',
      admin: { description: 'Where the image came from, when it isn’t our own.' },
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    // (this file is src/platform/payload/, three levels below the project root)
    staticDir: path.resolve(dirname, '../../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
