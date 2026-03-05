import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin, isAdminOrEditor } from '../../access/roles'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateDelete, revalidateEvent } from './hooks/revalidateEvent'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdminOrEditor,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    date: true,
    timeStart: true,
    timeEnd: true,
    category: true,
    description: true,
    locationName: true,
    heroImage: true,
    meta: {
      title: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'date', 'category', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Event Details',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  admin: {
                    date: { pickerAppearance: 'dayOnly' },
                    width: '33%',
                  },
                },
                {
                  name: 'timeStart',
                  type: 'text',
                  admin: { width: '33%', placeholder: '6:00 PM' },
                },
                {
                  name: 'timeEnd',
                  type: 'text',
                  admin: { width: '33%', placeholder: '8:00 PM' },
                },
              ],
            },
            {
              name: 'category',
              type: 'select',
              options: [
                { label: 'Meeting', value: 'meeting' },
                { label: 'Social', value: 'social' },
                { label: 'Volunteer', value: 'volunteer' },
                { label: 'Workshop', value: 'workshop' },
                { label: 'Sports & Recreation', value: 'sports' },
                { label: 'Community', value: 'community' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'community',
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Featured events appear prominently on the homepage' },
            },
            {
              name: 'locationType',
              type: 'select',
              options: [
                { label: 'In Person', value: 'in-person' },
                { label: 'Virtual', value: 'virtual' },
                { label: 'Hybrid', value: 'hybrid' },
              ],
              defaultValue: 'in-person',
            },
            {
              name: 'locationName',
              type: 'text',
              admin: {
                condition: (data) => data?.locationType !== 'virtual',
                placeholder: 'e.g., Sprecher East Park Shelter',
              },
            },
            {
              name: 'locationAddress',
              type: 'text',
              admin: {
                condition: (data) => data?.locationType !== 'virtual',
                placeholder: 'e.g., 4605 Sprecher Rd, Madison, WI 53718',
              },
            },
            {
              name: 'mapsUrl',
              type: 'text',
              admin: {
                condition: (data) => data?.locationType !== 'virtual',
                placeholder: 'Google Maps link',
              },
            },
            {
              name: 'registrationUrl',
              type: 'text',
              admin: { placeholder: 'Registration link (optional)' },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Short description shown in event cards' },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: 'Full Event Description',
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateEvent],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
}
