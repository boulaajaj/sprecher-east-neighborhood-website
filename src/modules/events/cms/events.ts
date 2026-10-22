import { slugField, type CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { draftContentAccess } from '@/platform/payload/draftContentAccess'
import { populatePublishedAt } from '@/platform/payload/populatePublishedAt'

import { EVENT_CATEGORIES } from '../domain/categories'
import { EVENT_LOCATION_TYPES } from '../domain/locationTypes'
import { revalidateDelete, revalidateEvent } from './revalidateEvent'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: draftContentAccess,
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
              options: [...EVENT_CATEGORIES],
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
              options: [...EVENT_LOCATION_TYPES],
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
