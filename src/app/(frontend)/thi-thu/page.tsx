import type { Metadata } from 'next'
import Link from 'next/link'

import { EXAM_CATALOG_LABELS } from '@/lib/labels'
import { findPublished } from '@/lib/payload'
import type { Exam } from '@/payload-types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Đề thi thử',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default async function ExamCatalogPage() {
  let exams: Exam[] = []
  try {
    const result = await findPublished('exams', {
      limit: 100,
      sort: '-year,-publishedAt',
    })
    exams = result.docs
  } catch (error) {
    console.error('[thi-thu] Failed to load published exams:', error)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600">HANOI SMART EDU</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">{EXAM_CATALOG_LABELS.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{EXAM_CATALOG_LABELS.description}</p>
      </header>

      {exams.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" key={exam.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                  {exam.isPremium ? EXAM_CATALOG_LABELS.premium : EXAM_CATALOG_LABELS.free}
                </span>
                <span className="text-sm font-bold text-slate-500">{exam.year}</span>
              </div>

              <h2 className="mt-4 text-xl font-extrabold leading-snug text-blue-950">
                <Link className="hover:text-orange-700" href={exam.slug ? `/thi-thu/${exam.slug}` : '/thi-thu'}>
                  {exam.title}
                </Link>
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                {exam.grade ? `Lớp ${exam.grade} · ` : ''}
                {exam.level === 'tieu-hoc' ? 'Tiểu học' : 'THCS'}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <span className="text-xl font-black text-blue-950">
                  {exam.isPremium ? formatCurrency(Number(exam.price ?? 0)) : EXAM_CATALOG_LABELS.freePrice}
                </span>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-950 px-4 text-sm font-bold text-white transition hover:bg-blue-900"
                  href={exam.slug ? `/thi-thu/${exam.slug}` : '/thi-thu'}
                >
                  {EXAM_CATALOG_LABELS.viewDetails}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          {EXAM_CATALOG_LABELS.empty}
        </p>
      )}
    </section>
  )
}
