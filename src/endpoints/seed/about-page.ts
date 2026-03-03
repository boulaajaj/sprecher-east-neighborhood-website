import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import { heading, root, p } from './helpers/lexical'

type AboutArgs = {
  mapImage?: Media
}

export const aboutPage: (args?: AboutArgs) => RequiredDataFromCollectionSlug<'pages'> = (args) => {
  const layout: RequiredDataFromCollectionSlug<'pages'>['layout'] = [
    {
      blockName: 'Who We Are',
      blockType: 'content',
      columns: [
        {
          richText: root([
            heading('h2', 'Who We Are'),
            p(
              'Sprecher East is a grassroots neighborhood initiative serving Madison\u2019s far east side. We were established in 2006 to give residents a voice in local government, share information, and build community connections.',
            ),
            p(
              'We are not a homeowners association (HOA). There are no mandatory dues, no rules about your fence height, and no one telling you what color to paint your house. Membership is completely free and open to anyone who lives within our boundaries.',
            ),
            p(
              'Our neighborhood is bounded by I-94 to the north, Door Creek Park to the east, Sprecher Road to the west, and Cottage Grove Road to the south. We fall within Madison\u2019s District 16.',
            ),
          ]),
          size: 'full',
        },
      ],
    },
  ]

  if (args?.mapImage) {
    layout.push({
      blockName: 'Neighborhood Map',
      blockType: 'mediaBlock',
      media: args.mapImage.id,
    })
  }

  layout.push(
    {
      blockName: 'Our Subdivisions',
      blockType: 'content',
      columns: [
        {
          richText: root([heading('h2', 'Our Subdivisions')]),
          size: 'full',
        },
        {
          enableLink: false,
          richText: root([
            heading('h3', 'Meadowlands'),
            p(
              'One of the earliest subdivisions in the Sprecher East area, Meadowlands features established homes and tree-lined streets.',
            ),
          ]),
          size: 'oneThird',
        },
        {
          enableLink: false,
          richText: root([
            heading('h3', 'Door Creek'),
            p(
              'Adjacent to Door Creek Park and the bike path, this subdivision offers easy access to green space and trails.',
            ),
          ]),
          size: 'oneThird',
        },
        {
          enableLink: false,
          richText: root([
            heading('h3', 'Reston Heights'),
            p(
              'The newest development in our area, Reston Heights brings modern housing and new families to the neighborhood.',
            ),
          ]),
          size: 'oneThird',
        },
      ],
    },
    {
      blockName: 'Get Involved CTA',
      blockType: 'cta',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Get Involved',
            url: '/get-involved',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Contact Us',
            url: '/contact',
          },
        },
      ],
      richText: root([
        heading('h3', 'Ready to Connect?'),
        p(
          'Whether you\u2019re a longtime resident or just moved in, we\u2019d love to hear from you.',
        ),
      ]),
    },
  )

  return {
    slug: 'about',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      richText: root([heading('h1', 'About Sprecher East')]),
    },
    layout,
    meta: {
      description:
        'Learn about Sprecher East, a grassroots neighborhood initiative serving the Meadowlands, Door Creek, and Reston Heights subdivisions on Madison\u2019s far east side.',
      title: 'About',
    },
    title: 'About',
  }
}
