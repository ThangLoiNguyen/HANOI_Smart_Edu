'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { submitContact } from '@/app/actions/submit-contact'
import { CONTACT_LABELS } from '@/lib/labels'
import type { Branch, Course } from '@/payload-types'

type ContactOption = Pick<Course, 'id' | 'title'>
type BranchOption = Pick<Branch, 'id' | 'title'>
type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

type ContactFormProps = {
  courses: ContactOption[]
  branches: BranchOption[]
}

const vietnamesePhonePattern = /^(\+?84|0)[\s.-]?\d{3,4}[\s.-]?\d{3}[\s.-]?\d{3,4}$/

export function ContactForm({ courses, branches }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const phone = String(formData.get('phone') ?? '').trim()
    if (!vietnamesePhonePattern.test(phone)) {
      setStatus('error')
      setErrorMessage(CONTACT_LABELS.invalidPhone)
      return
    }

    setStatus('submitting')
    try {
      const result = await submitContact(formData)
      if (!result.success) {
        setStatus('error')
        setErrorMessage(result.message || CONTACT_LABELS.genericError)
        return
      }

      formRef.current?.reset()
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage(CONTACT_LABELS.genericError)
    }
  }

  return (
    <form
      className="relative grid gap-5 sm:grid-cols-2"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {CONTACT_LABELS.name}
        <input
          autoComplete="name"
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4"
          maxLength={100}
          name="fullName"
          placeholder={CONTACT_LABELS.namePlaceholder}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {CONTACT_LABELS.phone}
        <input
          autoComplete="tel"
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4"
          maxLength={24}
          name="phone"
          placeholder={CONTACT_LABELS.phonePlaceholder}
          required
          type="tel"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {CONTACT_LABELS.email}
        <input
          autoComplete="email"
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4"
          maxLength={200}
          name="email"
          placeholder={CONTACT_LABELS.emailPlaceholder}
          required
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {CONTACT_LABELS.course}
        <select
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4"
          name="interestedCourse"
          defaultValue=""
        >
          <option value="">{CONTACT_LABELS.choose} ({CONTACT_LABELS.optional.toLowerCase()})</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {CONTACT_LABELS.branch}
        <select
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-4"
          name="branch"
          defaultValue=""
        >
          <option value="">{CONTACT_LABELS.choose} ({CONTACT_LABELS.optional.toLowerCase()})</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>{branch.title}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
        {CONTACT_LABELS.message}
        <textarea
          className="min-h-32 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3"
          maxLength={2000}
          name="message"
          placeholder={CONTACT_LABELS.messagePlaceholder}
          rows={5}
        />
      </label>
      <label aria-hidden="true" className="absolute left-[-9999px] top-0">
        {CONTACT_LABELS.honeypot}
        <input
          aria-hidden="true"
          autoComplete="off"
          className="absolute left-[-9999px] top-0"
          name="website"
          tabIndex={-1}
        />
      </label>
      <div className="space-y-3 sm:col-span-2">
        {status === 'success' ? (
          <p className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800" role="status">
            {CONTACT_LABELS.success}
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={status === 'submitting'}
          type="submit"
        >
          {status === 'submitting' ? CONTACT_LABELS.submitting : CONTACT_LABELS.submit}
        </button>
      </div>
    </form>
  )
}
