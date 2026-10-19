import type { RequiredDataFromCollectionSlug } from 'payload'
import { heading, root, p } from './helpers/lexical'

const CONTACT_EMAIL_FROM =
  process.env.CONTACT_EMAIL_FROM ?? '"Sprecher East" <no-reply@example.com>'

/** Where contact-form messages are sent (e.g. the association inbox). Unset = no email. */
const CONTACT_NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL

export const contactForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: root([
    heading('h2', 'Thank you for reaching out!'),
    p('Your message has been received. We\u2019ll get back to you as soon as possible.'),
  ]),
  confirmationType: 'message',
  // Notify the site owner; never email the address a visitor types in (the form-builder
  // guard drops such emails anyway). Recipient comes from the environment, not the source.
  emails: CONTACT_NOTIFY_EMAIL
    ? [
        {
          emailFrom: CONTACT_EMAIL_FROM,
          emailTo: CONTACT_NOTIFY_EMAIL,
          replyTo: '{{email}}',
          message: root([p('New message from the website contact form:'), p('{{*:table}}')]),
          subject: 'Website message: {{subject}}',
        },
      ]
    : [],
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
