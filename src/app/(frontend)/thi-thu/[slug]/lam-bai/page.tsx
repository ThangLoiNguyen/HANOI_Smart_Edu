import { notFound } from 'next/navigation'

import { getExamAccessStatus } from '@/app/actions/exam-purchase'
import { ExamTakingClient } from '@/components/exams/exam-taking-client'
import { EXAM_TAKING_LABELS } from '@/lib/labels'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 0

type ExamAttemptPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ phone?: string; email?: string }>
}

export default async function ExamAttemptPage({ params, searchParams }: ExamAttemptPageProps) {
  const { slug } = await params
  const query = await searchParams
  const payload = await getPayloadClient()
  const visibleExams = await payload.find({
    collection: 'exams',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    overrideAccess: false,
  })
  const exam = visibleExams.docs[0]

  if (!exam) notFound()

  if (exam.isPremium) {
    const phone = query.phone || ''
    const email = query.email || ''

    if (!phone) {
      return (
        <section className="mx-auto max-w-xl px-4 py-14 sm:px-6">
          <form action={`/thi-thu/${slug}/lam-bai`} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" method="get">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">{EXAM_TAKING_LABELS.brand}</p>
              <h1 className="mt-2 text-2xl font-black text-blue-950">{EXAM_TAKING_LABELS.accessHeading}</h1>
              <p className="mt-2 text-sm text-slate-600">{exam.title}</p>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              {EXAM_TAKING_LABELS.accessPhone}
              <input autoComplete="tel" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500" name="phone" placeholder={EXAM_TAKING_LABELS.accessPhonePlaceholder} required type="tel" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {EXAM_TAKING_LABELS.accessEmail}
              <input autoComplete="email" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500" name="email" placeholder={EXAM_TAKING_LABELS.accessEmailPlaceholder} type="email" />
            </label>
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-950 px-5 text-sm font-bold text-white hover:bg-blue-900" type="submit">
              {EXAM_TAKING_LABELS.verifyAccess}
            </button>
          </form>
        </section>
      )
    }

    const access = await getExamAccessStatus(exam.id, phone, email)

    if (!access.allowed) {
      return (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">Đề thi thử premium</p>
            <h1 className="mt-3 text-3xl font-black text-blue-950">{EXAM_TAKING_LABELS.accessErrorTitle}</h1>
            <p className="mt-4 text-slate-600">{access.message}</p>
            <a className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-sm font-bold text-white" href={`/thi-thu/${slug}/lam-bai`}>
              {EXAM_TAKING_LABELS.verifyAccess}
            </a>
          </div>
        </section>
      )
    }
  }

  const unlockedExam = await payload.findByID({
    collection: 'exams',
    id: exam.id,
    overrideAccess: true,
  })

  return <ExamTakingClient exam={unlockedExam} />
}
