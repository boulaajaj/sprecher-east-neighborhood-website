import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { CtaBanner } from '@/components/sections/cta-banner'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Sprecher East — what we are, how to join, who runs it, and how you can get involved in your neighborhood.',
}

const FAQ_ITEMS = [
  {
    question: 'What is Sprecher East?',
    answer: `We're a grassroots neighborhood initiative on Madison's Far East Side. Bounded by I-94 to the north, Door Creek Park to the east, Cottage Grove Road to the south, and Sprecher Road to the west. We include the Meadowlands, Door Creek, and Reston Heights subdivisions. We're neighbors who decided to stop waiting for someone else to build community — and just started doing it ourselves.`,
  },
  {
    question: 'Is Sprecher East an official neighborhood association?',
    answer: `Not yet — and we're upfront about that. Right now, we're a grassroots initiative working toward official registration with the City of Madison. That process takes time, but we're putting in the work. Official or not, the community we're building is real.`,
  },
  {
    question: 'Is this the same as the Meadowlands HOA?',
    answer: `Nope, totally different. The Meadowlands HOA is a homeowner's association that covers one specific subdivision within our area. Sprecher East is a neighborhood association — it covers a broader area (Meadowlands, Door Creek, and Reston Heights), it's free to join, there are no dues, and there are no mandates. We don't enforce rules on your lawn. We help neighbors connect.`,
  },
  {
    question: 'How do I join?',
    answer: `Just show up. Seriously. There's no application form, no approval process, no dues. If you live in the Sprecher East area and you want to be part of this, you're in. Come to a meeting, introduce yourself, or just read the newsletter. Every neighbor is welcome.`,
  },
  {
    question: 'Who runs this?',
    answer: `Right now, this is driven by one person — Amine Boulaajaj — with the help of AI tools. Yes, you read that right. AI agents help us research, write, build, and organize. We're transparent about that because we believe honesty builds trust. As more neighbors get involved, this will become a true community-run operation.`,
  },
  {
    question: 'Wait — AI helps build this website?',
    answer: `Absolutely. We use AI tools to help research, write content, design pages, and keep things organized. Think of it like having a team of tireless volunteers who never sleep. But every decision, every piece of content, every outreach — it goes through a real human (Amine) before it goes live. AI is a tool, not a replacement for community judgment.`,
  },
  {
    question: 'What can I do to help?',
    answer: `So many things! Come to meetings, share ideas, volunteer for events, or just tell your neighbors about us. You can also reach out through our contact page if you have specific skills or time to contribute. Even just showing up and being present makes a difference — it shows that this neighborhood cares about itself.`,
  },
  {
    question: 'How do I report a neighborhood issue?',
    answer: `For emergencies, call 911. For non-emergencies (potholes, streetlights, noise), call Madison City Services at 311. For things that affect our neighborhood specifically, reach out to us through the contact page or contact our District 16 Alder, Sean O'Brien, at district16@cityofmadison.com or (608) 572-7560. We're here to help you navigate the system.`,
  },
  {
    question: 'Does it cost anything?',
    answer: `Zero. Nothing. Nada. Membership is completely free and always will be. No dues, no fees, no hidden charges. We're neighbors helping neighbors — that's it.`,
  },
  {
    question: 'How is this different from Nextdoor?',
    answer: `Nextdoor is a social media platform. Sprecher East is a neighborhood association — we organize events, advocate to local government on behalf of residents, provide community resources, and work on real projects that make our neighborhood better. Think of us as the organized, action-oriented complement to your Nextdoor feed.`,
  },
]

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Common Questions"
        title="Frequently Asked Questions"
        description="Everything you want to know about Sprecher East — who we are, what we do, and how you can be part of it."
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-foreground select-none">
                  <span className="text-base md:text-lg">{item.question}</span>
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Plus className="h-4 w-4 transition-transform group-open:rotate-45" />
                  </span>
                </summary>
                <div className="px-6 pt-0 pb-6">
                  <p className="leading-relaxed text-muted">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border bg-surface p-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-foreground">Still have questions?</h3>
            <p className="mb-5 text-muted">
              We&apos;re real people and we actually read our messages. Reach out anytime.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              Send Us a Message
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner
        title="Ready to Get Involved?"
        description="You don't need permission to be part of your own neighborhood. Show up, speak up, and let's build something together."
        primaryHref="/get-involved"
        primaryLabel="Get Involved"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </>
  )
}
