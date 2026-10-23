import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm } from '@/components/contact/contact-form'
import { ContactInfo } from '@/components/contact/contact-info'
import { CONTACT_LABELS } from '@/lib/labels'
import { getSiteSettings } from '@/lib/metadata'
import { findPublished } from '@/lib/payload'

export const revalidate = 3600

export const metadata: Metadata = {
  title: CONTACT_LABELS.title,
}

type ContactPageProps = {
  searchParams: Promise<{ course?: string | string[]; schedule?: string | string[] }>
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams
  const [coursesResult, branchesResult, siteSettings] = await Promise.all([
    findPublished('courses', { limit: 200, pagination: false, sort: 'title' }),
    findPublished('branches', { limit: 200, pagination: false, sort: 'order,title' }),
    getSiteSettings(),
  ])
  const courses = coursesResult.docs.map(({ id, title }) => ({ id, title }))
  const branches = branchesResult.docs.map(({ id, title }) => ({ id, title }))
  const courseSlug = typeof params.course === 'string' ? params.course : ''
  const scheduleValue = typeof params.schedule === 'string' ? params.schedule : ''
  const initialCourseId = coursesResult.docs.find((course) => course.slug === courseSlug)?.id ?? null
  const scheduleId = /^\d+$/.test(scheduleValue) ? Number(scheduleValue) : null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label={CONTACT_LABELS.breadcrumbNavigation} className="mb-6 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link className="hover:text-orange-700" href="/">{CONTACT_LABELS.breadcrumbHome}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-slate-700">{CONTACT_LABELS.title}</li>
        </ol>
      </nav>
      <h1 className="mb-8 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
        {CONTACT_LABELS.title}
      </h1>
      <div className="grid items-start gap-8 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:col-span-3">
          <ContactForm
            branches={branches}
            courses={courses}
            hotline={siteSettings.hotline}
            zaloUrl={siteSettings.zaloUrl}
            initialCourseId={initialCourseId}
            scheduleId={scheduleId}
          />
        </div>
        <div className="lg:col-span-2">
          <ContactInfo branch={branchesResult.docs[0]} siteSettings={siteSettings} />
        </div>
      </div>
    </section>
  )
}
