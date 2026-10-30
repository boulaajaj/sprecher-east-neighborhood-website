import type { Block, TextFieldSingleValidation } from 'payload'

import { validateEditorialLink } from './editorialLink'
import { TIMELINE_STATUS_OPTIONS } from './timelineStatus'

// The address is checked together with its link text: both or neither
const validateLinkUrl: TextFieldSingleValidation = (value, { siblingData }) =>
  validateEditorialLink(value, (siblingData as { linkLabel?: string | null }).linkLabel)

/**
 * The timeline an editor puts inside rich text (#507): milestones in order, each with a date
 * label, a title, a short description, a status and at most one link. It follows the MOJ and DWP
 * design systems' timeline (date first, one marker per entry, one link per entry).
 */
export const TimelineBlockConfig: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  labels: { singular: 'Timeline', plural: 'Timelines' },
  fields: [
    {
      name: 'entries',
      type: 'array',
      label: 'Milestones',
      labels: { singular: 'Milestone', plural: 'Milestones' },
      admin: {
        description: 'In the order they happen, oldest first. Two to twelve milestones.',
      },
      minRows: 2,
      maxRows: 12,
      required: true,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'date',
              type: 'text',
              label: 'When',
              required: true,
              maxLength: 40,
              admin: {
                width: '50%',
                description: 'As readers should see it: "Dec 5, 2024", "Spring 2027", "Not set".',
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'later',
              options: TIMELINE_STATUS_OPTIONS,
              admin: { width: '50%' },
            },
          ],
        },
        { name: 'title', type: 'text', required: true, maxLength: 100 },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 300,
          admin: { description: 'One or two plain sentences. Optional.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'linkLabel',
              type: 'text',
              label: 'Link text',
              maxLength: 60,
              admin: { width: '50%', description: 'Optional, for example "Read the decision".' },
            },
            {
              name: 'linkUrl',
              type: 'text',
              label: 'Link address',
              admin: { width: '50%', description: 'A site path (/events) or https:// address.' },
              validate: validateLinkUrl,
            },
          ],
        },
      ],
    },
  ],
}
