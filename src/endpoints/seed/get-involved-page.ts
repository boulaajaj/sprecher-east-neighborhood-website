import type { RequiredDataFromCollectionSlug } from 'payload'
import { heading, root, p } from './helpers/lexical'

export const getInvolvedPage: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'get-involved',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      richText: root([heading('h1', 'Get Involved')]),
    },
    layout: [
      {
        blockName: 'Membership Info',
        blockType: 'content',
        columns: [
          {
            richText: root([
              heading('h2', 'Join Sprecher East'),
              p(
                'Membership in Sprecher East is free, voluntary, and open to all residents within our boundaries. There are no dues, no fees, and no obligations. We\u2019re simply neighbors who want to make our community better.',
              ),
              p(
                'By getting involved, you help shape the future of our neighborhood \u2014 from development decisions at City Hall to community events right here at home.',
              ),
            ]),
            size: 'full',
          },
        ],
      },
      {
        blockName: 'Benefits',
        blockType: 'content',
        columns: [
          {
            richText: root([heading('h2', 'Why Get Involved?')]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: root([
              heading('h3', 'Have a Voice'),
              p(
                'Neighborhood associations are how Madison residents influence city decisions. Your voice matters at Plan Commission, Common Council, and zoning hearings.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: root([
              heading('h3', 'Stay Informed'),
              p(
                'Get updates on development projects, road construction, park improvements, and city services that affect our area.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: root([
              heading('h3', 'Connect with Neighbors'),
              p(
                'Meet the people who live around you. Community events, online forums, and neighborhood projects bring us together.',
              ),
            ]),
            size: 'oneThird',
          },
        ],
      },
      {
        blockName: 'Ways to Help',
        blockType: 'content',
        columns: [
          {
            richText: root([heading('h2', 'Ways to Help')]),
            size: 'full',
          },
          {
            enableLink: false,
            richText: root([
              heading('h3', 'Attend a Meeting'),
              p(
                'Our meetings are open to all residents. Come listen, ask questions, or share your ideas for the neighborhood.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: root([
              heading('h3', 'Volunteer'),
              p(
                'Help with events, website content, outreach, or neighborhood clean-ups. Even an hour a month makes a difference.',
              ),
            ]),
            size: 'oneThird',
          },
          {
            enableLink: false,
            richText: root([
              heading('h3', 'Spread the Word'),
              p(
                'Tell your neighbors about Sprecher East. Share our website, invite someone to a meeting, or post about us on social media.',
              ),
            ]),
            size: 'oneThird',
          },
        ],
      },
      {
        blockName: 'Ready CTA',
        blockType: 'cta',
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Contact Us',
              url: '/contact',
            },
          },
          {
            link: {
              type: 'custom',
              appearance: 'outline',
              label: 'Upcoming Events',
              url: '/events',
            },
          },
        ],
        richText: root([
          heading('h3', 'Ready to Get Involved?'),
          p('Reach out to us or come to our next event. We\u2019d love to meet you.'),
        ]),
      },
    ],
    meta: {
      description:
        'Join Sprecher East \u2014 free membership, no dues. Learn how to get involved in your neighborhood on Madison\u2019s far east side.',
      title: 'Get Involved',
    },
    title: 'Get Involved',
  }
}
