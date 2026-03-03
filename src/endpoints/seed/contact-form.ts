import type { RequiredDataFromCollectionSlug } from 'payload'
import { heading, root, p } from './helpers/lexical'

export const contactForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: root([
    heading('h2', 'Thank you for reaching out!'),
    p('Your message has been received. We\u2019ll get back to you as soon as possible.'),
  ]),
  confirmationType: 'message',
  emails: [
    {
      emailFrom: '"Sprecher East" \u003Cno-reply@example.com\u003E',
      emailTo: '{{email}}',
      message: root([
        p(
          'Thank you for contacting Sprecher East. We received your message and will respond as soon as we can.',
        ),
      ]),
      subject: 'We received your message \u2014 Sprecher East',
    },
  ],
  fields: [
    {
      name: 'full-name',
      blockName: 'full-name',
      blockType: 'text',
      label: 'Full Name',
      required: true,
      width: 100,
    },
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 100,
    },
    {
      name: 'subject',
      blockName: 'subject',
      blockType: 'select',
      label: 'Subject',
      required: true,
      width: 100,
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Events', value: 'events' },
        { label: 'Neighborhood Issue', value: 'issue' },
        { label: 'Board / Association', value: 'board' },
        { label: 'Resources', value: 'resources' },
        { label: 'Volunteering', value: 'volunteer' },
        { label: 'General Question', value: 'general' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'message',
      blockName: 'message',
      blockType: 'textarea',
      label: 'Message',
      required: true,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Send Message',
  title: 'Contact Form',
}
