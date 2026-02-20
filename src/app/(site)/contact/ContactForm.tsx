'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(data)),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Server error')

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again or reach out via the community forum.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-primary/5 border border-primary/20 rounded-2xl">
        <CheckCircle className="w-12 h-12 text-primary mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
        <p className="text-muted text-sm max-w-sm leading-relaxed">
          Thanks for reaching out. We typically respond within a few business days.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-primary hover:underline font-medium"
        >
          Send another message
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-border rounded-xl text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
  const labelClass = 'block text-xs font-semibold text-foreground mb-1.5'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Name row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelClass}>First Name</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Jane"
            autoComplete="given-name"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClass}>Last Name</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Smith"
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className={labelClass}>What's this about?</label>
        <select id="subject" name="subject" required className={inputClass}>
          <option value="" disabled>Select a topic…</option>
          <option value="membership">Joining SENA / Membership</option>
          <option value="events">Events &amp; Calendar</option>
          <option value="issue">Neighborhood Issue or Concern</option>
          <option value="board">Board of Directors</option>
          <option value="resources">Resources &amp; Referrals</option>
          <option value="volunteer">Volunteering</option>
          <option value="general">General Question</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClass}>Your Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Tell us what's on your mind…"
          required
          rows={6}
          className={inputClass}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Opt-in */}
      <label className="flex gap-3 items-start cursor-pointer">
        <input
          type="checkbox"
          name="join_list"
          className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
        />
        <span className="text-sm text-muted leading-relaxed">
          I'd like to receive occasional neighborhood updates and event announcements from SENA.
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center">We typically respond within a few business days.</p>
    </form>
  )
}
