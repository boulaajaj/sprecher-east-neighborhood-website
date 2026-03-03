import { root, heading, paragraph, text, linkNode, p } from '../helpers/lexical'

type FAQItem = {
  question: string
  answer: ReturnType<typeof root>
  category: 'general' | 'membership' | 'events' | 'neighborhood'
  order: number
}

export const faqItems: FAQItem[] = [
  {
    question: 'What is Sprecher East?',
    answer: root([
      p(
        'Sprecher East is a grassroots neighborhood initiative on Madison\u2019s Far East Side. We represent residents of the Meadowlands, Door Creek, and Reston Heights subdivisions. Our goal is to advocate for our neighborhood, share information, and build community connections.',
      ),
    ]),
    category: 'general',
    order: 1,
  },
  {
    question: 'Is Sprecher East an official neighborhood association?',
    answer: root([
      p(
        'We are working toward official registration with the City of Madison. In the meantime, we operate as a grassroots initiative. Official registration requires a certain level of community participation, and we\u2019re building toward that.',
      ),
    ]),
    category: 'general',
    order: 2,
  },
  {
    question: 'Is this the same as the Meadowlands HOA?',
    answer: root([
      p(
        'No. Sprecher East is not a homeowners association (HOA). We have no mandatory dues, no rules about your property, and no enforcement power. We\u2019re a voluntary neighborhood association focused on advocacy, information sharing, and community building.',
      ),
    ]),
    category: 'general',
    order: 3,
  },
  {
    question: 'How do I join?',
    answer: root([
      p(
        'Membership is free and open to any resident within our boundaries (I-94 to the north, Door Creek Park to the east, Sprecher Road to the west, Cottage Grove Road to the south). There\u2019s no formal sign-up required \u2014 just show up, participate, and consider yourself a member.',
      ),
    ]),
    category: 'membership',
    order: 4,
  },
  {
    question: 'Who runs this?',
    answer: root([
      p(
        'Sprecher East was founded by Amine Boulaajaj, a resident of the neighborhood. The initiative is currently led by a small team with the help of AI tools for research, writing, and website development. We\u2019re transparent about our AI-assisted approach.',
      ),
    ]),
    category: 'general',
    order: 5,
  },
  {
    question: 'AI helps build this website?',
    answer: root([
      p(
        'Yes. We use AI agents (Claude by Anthropic) to help research, write content, build the website, and organize information. Every piece of content is reviewed by a real person before it goes live. We believe in being transparent about how we work.',
      ),
    ]),
    category: 'general',
    order: 6,
  },
  {
    question: 'What can I do to help?',
    answer: root([
      p(
        'There are many ways to get involved: attend meetings, volunteer for events or projects, spread the word to neighbors, share ideas or concerns, or help with the website. Even an hour a month makes a difference.',
      ),
    ]),
    category: 'membership',
    order: 7,
  },
  {
    question: 'How do I report a neighborhood issue?',
    answer: root([
      paragraph(
        text('For city services (potholes, streetlights, noise complaints), use the '),
        linkNode('City of Madison Report a Problem', 'https://www.cityofmadison.com/reportaproblem', {
          newTab: true,
        }),
        text(
          ' tool. For neighborhood-specific concerns, reach out to us through the contact form or attend a meeting.',
        ),
      ),
    ]),
    category: 'neighborhood',
    order: 8,
  },
  {
    question: 'Does it cost anything to be a member?',
    answer: root([
      p(
        'No. Membership is completely free. There are no dues, fees, or financial obligations. We\u2019re funded by volunteer effort, not money.',
      ),
    ]),
    category: 'membership',
    order: 9,
  },
  {
    question: 'How is Sprecher East different from Nextdoor?',
    answer: root([
      p(
        'Nextdoor is a social media platform owned by a corporation. Sprecher East is a local, resident-led initiative focused specifically on our neighborhood\u2019s interests at City Hall, community events, and local resources. We\u2019re your neighbors, not an app.',
      ),
    ]),
    category: 'general',
    order: 10,
  },
]
