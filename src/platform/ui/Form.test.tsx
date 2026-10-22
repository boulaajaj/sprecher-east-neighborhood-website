// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Button } from './Button'
import { Field } from './Field.client'
import { Form, type FormStatus } from './Form.client'
import { expectAccessible } from './testing/expectAccessible'

afterEach(cleanup)

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Enter an email address, like name@example.com'),
})

type Values = z.output<typeof schema>

/** A small form the way a page uses one: the page owns the status and the messages. */
function ContactForm({ send }: { send: (values: Values) => Promise<boolean> }) {
  const [status, setStatus] = useState<FormStatus>('idle')
  return (
    <Form
      aria-label="Contact"
      schema={schema}
      defaultValues={{ name: '', email: '' }}
      status={status}
      successMessage="Thanks, your message is on its way."
      errorMessage="Your message wasn’t sent. Please try again."
      onSubmit={async (values) => {
        setStatus('submitting')
        setStatus((await send(values)) ? 'success' : 'error')
      }}
    >
      {({ register, formState: { errors } }) => (
        <>
          <Field label="Name" width="half" required error={errors.name?.message}>
            <Field.Input {...register('name')} />
          </Field>
          <Field label="Email" width="half" required error={errors.email?.message}>
            <Field.Input type="email" {...register('email')} />
          </Field>
          <div>
            <Button type="submit" loading={status === 'submitting'}>
              Send
            </Button>
          </div>
        </>
      )}
    </Form>
  )
}

const fill = async () => {
  await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), ' Ada ')
  await userEvent.type(screen.getByRole('textbox', { name: /Email/ }), 'ada@example.com')
}

describe('Form', () => {
  it('shows each field’s error and does not submit when the schema fails', async () => {
    const send = vi.fn()
    render(<ContactForm send={send} />)

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(send).not.toHaveBeenCalled()
    const name = screen.getByRole('textbox', { name: /Name/ })
    expect(name.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getAllByRole('alert').map((alert) => alert.textContent)).toEqual([
      'Enter your name',
      'Enter an email address, like name@example.com',
    ])
    // The first invalid field gets focus, so keyboard users land where the problem is
    expect(document.activeElement).toBe(name)
  })

  it('submits the parsed values', async () => {
    const send = vi.fn().mockResolvedValue(true)
    render(<ContactForm send={send} />)

    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(send).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com' })
  })

  it('shows the fixed success message and moves focus to it', async () => {
    render(<ContactForm send={vi.fn().mockResolvedValue(true)} />)

    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    const message = await screen.findByRole('status')
    expect(message.textContent).toBe('Thanks, your message is on its way.')
    expect(message.parentElement).toBe(document.activeElement)
  })

  it('keeps the success message when onSubmit resets the fields', async () => {
    function ResettingForm() {
      const [status, setStatus] = useState<FormStatus>('idle')
      return (
        <Form
          aria-label="Reset"
          schema={schema}
          defaultValues={{ name: '', email: '' }}
          status={status}
          successMessage="Saved."
          onSubmit={async (_values, form) => {
            setStatus('submitting')
            await Promise.resolve()
            form.reset()
            setStatus('success')
          }}
        >
          {({ register }) => (
            <>
              <Field label="Name">
                <Field.Input {...register('name')} />
              </Field>
              <Field label="Email">
                <Field.Input type="email" {...register('email')} />
              </Field>
              <div>
                <Button type="submit">Save</Button>
              </div>
            </>
          )}
        </Form>
      )
    }
    render(<ResettingForm />)

    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect((await screen.findByRole('status')).textContent).toBe('Saved.')
    expect((screen.getByRole('textbox', { name: /Name/ }) as HTMLInputElement).value).toBe('')
  })

  it('shows the fixed error message, and hides it once a field changes', async () => {
    render(<ContactForm send={vi.fn().mockResolvedValue(false)} />)

    await fill()
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Your message wasn’t sent. Please try again.',
    )

    await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'x')

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('ignores a second submit while the first is still running', async () => {
    let finish: (ok: boolean) => void = () => {}
    const send = vi.fn(() => new Promise<boolean>((resolve) => (finish = resolve)))
    render(<ContactForm send={send} />)
    await fill()

    const form = screen.getByRole('form', { name: 'Contact' }) as HTMLFormElement
    form.requestSubmit()
    form.requestSubmit()
    await waitFor(() => expect(send).toHaveBeenCalledOnce())
    finish(true)

    await screen.findByRole('status')
    expect(send).toHaveBeenCalledOnce()
  })

  it('lays half-width fields out in two columns from 640 px', () => {
    render(<ContactForm send={vi.fn()} />)

    const form = screen.getByRole('form', { name: 'Contact' })
    expect(form.className).toContain('sm:grid-cols-2')
    expect(form.className).toContain('*:col-span-full')
  })

  it('has no accessibility violations, with errors shown', async () => {
    const { container } = render(<ContactForm send={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await expectAccessible(container)
  })
})
