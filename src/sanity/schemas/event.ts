import { defineField, defineType } from 'sanity'
import { CalendarIcon } from 'lucide-react'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'timeStart', title: 'Start Time', type: 'string', placeholder: '6:00 PM' }),
    defineField({ name: 'timeEnd', title: 'End Time', type: 'string', placeholder: '7:30 PM' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Government', value: 'government' },
          { title: 'Community', value: 'community' },
          { title: 'Social', value: 'social' },
          { title: 'Other', value: 'other' },
        ],
      },
      initialValue: 'community',
    }),
    defineField({
      name: 'locationType',
      title: 'Location Type',
      type: 'string',
      options: {
        list: [
          { title: 'In Person', value: 'in-person' },
          { title: 'Virtual / Online', value: 'virtual' },
          { title: 'Hybrid', value: 'hybrid' },
        ],
      },
      initialValue: 'in-person',
    }),
    defineField({ name: 'locationName', title: 'Venue Name', type: 'string' }),
    defineField({ name: 'locationAddress', title: 'Street Address', type: 'string' }),
    defineField({ name: 'locationCity', title: 'City', type: 'string', initialValue: 'Madison' }),
    defineField({ name: 'mapsUrl', title: 'Google Maps URL', type: 'url' }),
    defineField({ name: 'registrationUrl', title: 'Registration / RSVP URL', type: 'url' }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown in event cards.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'body',
      title: 'Full Details',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Longer event description, agenda, etc.',
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  orderings: [
    { title: 'Date (newest)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Date (oldest)', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'date', media: 'image' },
    prepare({ title, date }) {
      return { title, subtitle: date }
    },
  },
})
